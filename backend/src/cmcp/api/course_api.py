from __future__ import annotations

from typing import Any, Dict, List, Optional

from flask import Blueprint, request
from pydantic import BaseModel, ConfigDict, field_validator

from cmcp import db
from cmcp.common.api_response import api_success, api_error
from cmcp.core.exceptions import NotFoundError, BusinessValidationError
from cmcp.security.rbac_guards import require_company_and_permission
from cmcp.modules.academic.course_service import CourseService


class _BaseIn(BaseModel):
    model_config = ConfigDict(extra="forbid")


class CourseChapterRowIn(_BaseIn):
    id: Optional[int] = None
    number: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("Chapter number must be at least 1.")
        return v


class CourseOfferingRowIn(_BaseIn):
    id: Optional[int] = None
    course_id: Optional[int] = None
    department_id: Optional[int] = None
    semester_id: Optional[int] = None
    custom_title: Optional[str] = None
    credit_hours: Optional[int] = None
    is_enabled: Optional[bool] = None
    chapters: Optional[List[CourseChapterRowIn]] = None

    @field_validator("credit_hours")
    @classmethod
    def validate_credit_hours(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 0 or v > 30):
            raise ValueError("Credit hours must be between 0 and 30.")
        return v


class CourseCreateApiIn(_BaseIn):
    title: str
    code: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = True
    offerings: Optional[List[CourseOfferingRowIn]] = None


class CourseUpdateApiIn(_BaseIn):
    title: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    offerings: Optional[List[CourseOfferingRowIn]] = None


class CourseOfferingCreateApiIn(_BaseIn):
    course_id: int

    # Single offering mode
    department_id: Optional[int] = None
    semester_id: Optional[int] = None
    custom_title: Optional[str] = None
    credit_hours: Optional[int] = None
    is_enabled: Optional[bool] = True
    chapters: Optional[List[CourseChapterRowIn]] = None

    # Bulk offering mode
    offerings: Optional[List[CourseOfferingRowIn]] = None

    @field_validator("credit_hours")
    @classmethod
    def validate_credit_hours(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 0 or v > 30):
            raise ValueError("Credit hours must be between 0 and 30.")
        return v


class CourseOfferingUpdateApiIn(_BaseIn):
    course_id: Optional[int] = None
    department_id: Optional[int] = None
    semester_id: Optional[int] = None
    custom_title: Optional[str] = None
    credit_hours: Optional[int] = None
    is_enabled: Optional[bool] = None
    chapters: Optional[List[CourseChapterRowIn]] = None

    @field_validator("credit_hours")
    @classmethod
    def validate_credit_hours(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 0 or v > 30):
            raise ValueError("Credit hours must be between 0 and 30.")
        return v


class DeleteApiIn(_BaseIn):
    permanent: Optional[bool] = False


class BulkDeleteApiIn(_BaseIn):
    ids: List[int]
    permanent: Optional[bool] = False

    @field_validator("ids")
    @classmethod
    def validate_ids(cls, v: List[int]) -> List[int]:
        if not v:
            raise ValueError("ids is required.")
        if len(v) > 100:
            raise ValueError("Cannot delete more than 100 records.")
        if len(set(v)) != len(v):
            raise ValueError("Duplicate ids are not allowed.")
        return v


bp = Blueprint("academic_courses", __name__, url_prefix="/api/academic_courses")
course_svc = CourseService()


def _handle_error(e: Exception):
    db.session.rollback()

    if isinstance(e, NotFoundError):
        return api_error(str(e), status_code=404)

    if isinstance(e, BusinessValidationError):
        return api_error(str(e), status_code=400)

    return api_error(str(e), status_code=400)


def _json_body() -> Dict[str, Any]:
    payload = request.get_json(silent=True) or {}

    if not isinstance(payload, dict):
        raise BusinessValidationError("Request body must be a JSON object.")

    return payload


# =========================================================
# Course endpoints
# =========================================================
@bp.post("/courses/create")
@require_company_and_permission(doctype="Course", action="CREATE")
def create_course(company_id: int):
    try:
        payload = CourseCreateApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.create_course(
            company_id=company_id,
            data=payload.model_dump(exclude_unset=True),
        )

        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.put("/courses/<int:course_id>/update")
@bp.patch("/courses/<int:course_id>/update")
@require_company_and_permission(doctype="Course", action="UPDATE")
def update_course(company_id: int, course_id: int):
    """
    Update course fields.

    If offerings is provided:
    - request is treated as the full desired offering table.
    - missing offerings are disabled by default.
    - present offerings are enabled unless explicitly is_enabled=false.
    """
    try:
        payload = CourseUpdateApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.update_course(
            company_id=company_id,
            course_id=course_id,
            data=payload.model_dump(exclude_unset=True),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.delete("/courses/<int:course_id>/delete")
@require_company_and_permission(doctype="Course", action="DELETE")
def delete_course(company_id: int, course_id: int):
    """
    Delete one course.

    Default:
    - soft delete course
    - soft delete its offerings
    - soft delete its chapters

    Hard delete:
    - send {"permanent": true}
    - blocked if course has offerings
    """
    try:
        payload = DeleteApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.delete_course(
            company_id=company_id,
            course_id=course_id,
            permanent=bool(payload.permanent),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.post("/courses/bulk-delete")
@require_company_and_permission(doctype="Course", action="DELETE")
def bulk_delete_courses(company_id: int):
    try:
        payload = BulkDeleteApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.bulk_delete_courses(
            company_id=company_id,
            ids=payload.ids,
            permanent=bool(payload.permanent),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


# =========================================================
# Course Offering endpoints
# =========================================================
@bp.post("/course-offerings/create")
@require_company_and_permission(doctype="CourseOffering", action="CREATE")
def create_course_offering(company_id: int):
    """
    Create one or many offerings for an existing course.
    """
    try:
        payload = CourseOfferingCreateApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.create_offering(
            company_id=company_id,
            data=payload.model_dump(exclude_unset=True),
        )

        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.put("/course-offerings/<int:offering_id>/update")
@bp.patch("/course-offerings/<int:offering_id>/update")
@require_company_and_permission(doctype="CourseOffering", action="UPDATE")
def update_course_offering(company_id: int, offering_id: int):
    """
    Update an offering.

    If chapters is provided:
    - request is treated as the full desired chapter table.
    - missing chapters are disabled by default.
    - present chapters are enabled unless explicitly is_enabled=false.
    """
    try:
        payload = CourseOfferingUpdateApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.update_offering(
            company_id=company_id,
            offering_id=offering_id,
            data=payload.model_dump(exclude_unset=True),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.delete("/course-offerings/<int:offering_id>/delete")
@require_company_and_permission(doctype="CourseOffering", action="DELETE")
def delete_course_offering(company_id: int, offering_id: int):
    """
    Delete one offering.

    Default:
    - soft delete offering
    - soft delete its chapters

    Hard delete:
    - send {"permanent": true}
    - blocked if linked materials exist
    """
    try:
        payload = DeleteApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.delete_offering(
            company_id=company_id,
            offering_id=offering_id,
            permanent=bool(payload.permanent),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.post("/course-offerings/bulk-delete")
@require_company_and_permission(doctype="CourseOffering", action="DELETE")
def bulk_delete_course_offerings(company_id: int):
    try:
        payload = BulkDeleteApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.bulk_delete_offerings(
            company_id=company_id,
            ids=payload.ids,
            permanent=bool(payload.permanent),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


# =========================================================
# Chapter endpoints
# =========================================================
@bp.delete("/chapters/<int:chapter_id>/delete")
@require_company_and_permission(doctype="CourseChapter", action="DELETE")
def delete_course_chapter(company_id: int, chapter_id: int):
    """
    Delete one chapter.

    Default:
    - soft delete chapter

    Hard delete:
    - send {"permanent": true}
    - blocked if linked materials exist
    """
    try:
        payload = DeleteApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.delete_chapter(
            company_id=company_id,
            chapter_id=chapter_id,
            permanent=bool(payload.permanent),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.post("/chapters/bulk-delete")
@require_company_and_permission(doctype="CourseChapter", action="DELETE")
def bulk_delete_course_chapters(company_id: int):
    try:
        payload = BulkDeleteApiIn.model_validate(_json_body())

        ok, msg, out = course_svc.bulk_delete_chapters(
            company_id=company_id,
            ids=payload.ids,
            permanent=bool(payload.permanent),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)