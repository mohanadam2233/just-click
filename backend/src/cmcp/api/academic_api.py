from __future__ import annotations

import json
from typing import Any, Dict, Optional, Tuple

from flask import Blueprint, request

from cmcp import db
from cmcp.common.api_response import api_success, api_error
from cmcp.core.exceptions import NotFoundError, BusinessValidationError
from cmcp.security.rbac_guards import require_company_and_permission

from cmcp.modules.academic.schemas import (
    BulkDeleteIn,
    FacultyCreate, FacultyUpdate,
    DepartmentCreate, DepartmentUpdate,
    AcademicYearCreate, AcademicYearUpdate,
    SemesterCreate, SemesterUpdate,
    CourseCreate, CourseUpdate,
    ChapterCreate, ChapterUpdate,
)
from cmcp.modules.academic.academic_service import AcademicService
from cmcp.core.http.dropdown_args import dropdown_args

def _handle_error(e: Exception):
    db.session.rollback()
    # your validation layer now throws these (like academic)
    if isinstance(e, NotFoundError):
        return api_error(str(e), status_code=404)
    if isinstance(e, BusinessValidationError):
        return api_error(str(e), status_code=400)
    return api_error(str(e), status_code=400)
bp = Blueprint("academic", __name__, url_prefix="/api/academic")
svc = AcademicService()


def _as_bool(v: Any) -> bool:
    if isinstance(v, bool):
        return v
    if isinstance(v, str):
        return v.strip().lower() in ("1", "true", "yes", "y", "on")
    return bool(v)


def _parse_filters() -> Dict[str, Any] | None:
    """
    Supports:
      - filters JSON: ?filters={"is_enabled":true,"faculty_id":2}
      - OR simple: ?is_enabled=true
    JSON wins if provided.
    """
    raw = request.args.get("filters")
    if raw:
        try:
            obj = json.loads(raw)
            return obj if isinstance(obj, dict) else None
        except Exception:
            return None

    filters: Dict[str, Any] = {}
    if "is_enabled" in request.args:
        filters["is_enabled"] = _as_bool(request.args.get("is_enabled"))
    return filters or None


def _list_args() -> Tuple[str | None, str | None, str | None, int, int, Optional[int], Optional[int], Dict[str, Any] | None]:
    q = request.args.get("q")
    sort_key = request.args.get("sort_key")
    sort_order = request.args.get("sort_order")

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    limit = request.args.get("limit", type=int)
    offset = request.args.get("offset", type=int)

    return q, sort_key, sort_order, page, per_page, limit, offset, _parse_filters()


def _list_mode(limit: Optional[int], offset: Optional[int]) -> str:
    return "scroll" if (limit is not None or offset is not None) else "page"


# =========================================================
# FACULTY
# =========================================================
@bp.post("/faculties/create")
@require_company_and_permission(doctype="Faculty", action="CREATE")
def create_faculty(company_id: int):
    try:
        payload = FacultyCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_faculty(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)

@bp.get("/faculties/list")
@require_company_and_permission(doctype="Faculty", action="READ")
def list_faculties(company_id: int):
    try:
        q = request.args
        mode = (q.get("mode") or "cursor").strip().lower()  # cursor|page

        filters: Dict[str, Any] = {
            "search": (q.get("search") or "").strip() or None,
        }

        is_enabled_raw = q.get("is_enabled")
        is_enabled: Optional[bool] = None
        if is_enabled_raw is not None:
            s = str(is_enabled_raw).strip().lower()
            if s in {"1", "true", "yes"}:
                is_enabled = True
            elif s in {"0", "false", "no"}:
                is_enabled = False

        if mode == "page":
            page = q.get("page", type=int) or 1
            per_page = q.get("per_page", type=int) or 20

            ok, msg, out = svc.list_faculties_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )
            return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

        limit = q.get("limit", type=int) or 20
        cursor = (q.get("cursor") or "").strip() or None

        ok, msg, out = svc.list_faculties_cursor(
            company_id=company_id,
            limit=limit,
            cursor=cursor,
            filters=filters,
            is_enabled=is_enabled,
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.get("/faculties/<int:faculty_id>/get")
@require_company_and_permission(doctype="Faculty", action="READ")
def get_faculty_detail(company_id: int, faculty_id: int):
    try:
        ok, msg, out = svc.get_faculty_detail(
            company_id=company_id,
            faculty_id=faculty_id,
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=404)
    except Exception as e:
        return _handle_error(e)


@bp.put("/faculties/<int:faculty_id>/update")
@require_company_and_permission(doctype="Faculty", action="UPDATE")
def update_faculty(company_id: int, faculty_id: int):
    try:
        payload = FacultyUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_faculty(company_id=company_id, faculty_id=faculty_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/faculties/<int:faculty_id>/delete")
@require_company_and_permission(doctype="Faculty", action="DELETE")
def delete_faculty(company_id: int, faculty_id: int):
    try:
        ok, msg, out = svc.delete_faculty(company_id=company_id, faculty_id=faculty_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/faculties/bulk-delete")
@require_company_and_permission(doctype="Faculty", action="DELETE")
def bulk_delete_faculties(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_faculties(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


# =========================================================
# DEPARTMENT
# =========================================================
@bp.post("/departments/create")
@require_company_and_permission(doctype="Department", action="CREATE")
def create_department(company_id: int):
    try:
        payload = DepartmentCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_department(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/departments/<int:department_id>/update")
@require_company_and_permission(doctype="Department", action="UPDATE")
def update_department(company_id: int, department_id: int):
    try:
        payload = DepartmentUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_department(company_id=company_id, department_id=department_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/departments/<int:department_id>/delete")
@require_company_and_permission(doctype="Department", action="DELETE")
def delete_department(company_id: int, department_id: int):
    try:
        ok, msg, out = svc.delete_department(company_id=company_id, department_id=department_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/departments/bulk-delete")
@require_company_and_permission(doctype="Department", action="DELETE")
def bulk_delete_departments(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_departments(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)

@bp.get("/departments/list")
@require_company_and_permission(doctype="Department", action="READ")
def list_departments(company_id: int):
    try:
        q = request.args
        mode = (q.get("mode") or "cursor").strip().lower()  # cursor|page

        filters: Dict[str, Any] = {
            "faculty_id": q.get("faculty_id", type=int),
            "search": (q.get("search") or "").strip() or None,
        }

        is_enabled_raw = q.get("is_enabled")
        is_enabled: Optional[bool] = None
        if is_enabled_raw is not None:
            s = str(is_enabled_raw).strip().lower()
            if s in {"1", "true", "yes"}:
                is_enabled = True
            elif s in {"0", "false", "no"}:
                is_enabled = False

        if mode == "page":
            page = q.get("page", type=int) or 1
            per_page = q.get("per_page", type=int) or 20

            ok, msg, out = svc.list_departments_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )
            return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

        limit = q.get("limit", type=int) or 20
        cursor = (q.get("cursor") or "").strip() or None

        ok, msg, out = svc.list_departments_cursor(
            company_id=company_id,
            limit=limit,
            cursor=cursor,
            filters=filters,
            is_enabled=is_enabled,
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)

@bp.get("/departments/<int:department_id>/get")
@require_company_and_permission(doctype="Department", action="READ")
def get_department_detail(company_id: int, department_id: int):
    try:
        ok, msg, out = svc.get_department_detail(
            company_id=company_id,
            department_id=department_id,
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=404)
    except Exception as e:
        return _handle_error(e)



# =========================================================
# YEAR
# =========================================================
@bp.post("/years/create")
@require_company_and_permission(doctype="Academic Year", action="CREATE")
def create_year(company_id: int):
    try:
        payload = AcademicYearCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_year(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)

@bp.get("/academic-years/<int:academic_year_id>/get")
@require_company_and_permission(doctype="AcademicYear", action="READ")
def get_academic_year_detail(company_id: int, academic_year_id: int):
    try:
        ok, msg, out = svc.get_academic_year_detail(
            company_id=company_id,
            academic_year_id=academic_year_id,
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.put("/years/<int:year_id>/update")
@require_company_and_permission(doctype="Academic Year", action="UPDATE")
def update_year(company_id: int, year_id: int):
    try:
        payload = AcademicYearUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_year(company_id=company_id, year_id=year_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/years/<int:year_id>/delete")
@require_company_and_permission(doctype="Academic Year", action="DELETE")
def delete_year(company_id: int, year_id: int):
    try:
        ok, msg, out = svc.delete_year(company_id=company_id, year_id=year_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/years/bulk-delete")
@require_company_and_permission(doctype="Academic Year", action="DELETE")
def bulk_delete_years(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_years(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/academic-years/list")
@require_company_and_permission(doctype="AcademicYear", action="READ")
def list_academic_years(company_id: int):
    try:
        q = request.args
        mode = (q.get("mode") or "cursor").strip().lower()

        filters = {
            "search": (q.get("search") or "").strip() or None,
        }

        is_enabled_raw = q.get("is_enabled")
        is_enabled = None
        if is_enabled_raw is not None:
            s = str(is_enabled_raw).strip().lower()
            if s in {"1", "true", "yes"}:
                is_enabled = True
            elif s in {"0", "false", "no"}:
                is_enabled = False

        if mode == "page":
            page = q.get("page", type=int) or 1
            per_page = q.get("per_page", type=int) or 20

            ok, msg, out = svc.list_academic_years_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )
            return api_success(message=msg, data=out)

        limit = q.get("limit", type=int) or 20
        cursor = (q.get("cursor") or "").strip() or None

        ok, msg, out = svc.list_academic_years_cursor(
            company_id=company_id,
            limit=limit,
            cursor=cursor,
            filters=filters,
            is_enabled=is_enabled,
        )

        return api_success(message=msg, data=out)

    except Exception as e:
        return _handle_error(e)




# =========================================================
# SEMESTER
# =========================================================
@bp.post("/semesters/create")
@require_company_and_permission(doctype="Academic Term", action="CREATE")
def create_semester(company_id: int):
    try:
        payload = SemesterCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_semester(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/semesters/<int:semester_id>/get")
@require_company_and_permission(doctype="Semester", action="READ")
def get_semester_detail(company_id: int, semester_id: int):
    try:

        ok, msg, out = svc.get_semester_detail(
            company_id=company_id,
            semester_id=semester_id,
        )

        return api_success(message=msg, data=out)

    except Exception as e:
        return _handle_error(e)

@bp.get("/semesters/list")
@require_company_and_permission(doctype="Semester", action="READ")
def list_semesters(company_id: int):
    try:
        q = request.args
        mode = (q.get("mode") or "cursor").strip().lower()

        filters: Dict[str, Any] = {
            "academic_year_id": q.get("academic_year_id", type=int),
            "search": (q.get("search") or "").strip() or None,
        }

        is_enabled_raw = q.get("is_enabled")
        is_enabled: Optional[bool] = None
        if is_enabled_raw is not None:
            s = str(is_enabled_raw).strip().lower()
            if s in {"1", "true", "yes"}:
                is_enabled = True
            elif s in {"0", "false", "no"}:
                is_enabled = False

        if mode == "page":
            page = q.get("page", type=int) or 1
            per_page = q.get("per_page", type=int) or 20

            ok, msg, out = svc.list_semesters_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )
            return api_success(message=msg, data=out)

        limit = q.get("limit", type=int) or 20
        cursor = (q.get("cursor") or "").strip() or None

        ok, msg, out = svc.list_semesters_cursor(
            company_id=company_id,
            limit=limit,
            cursor=cursor,
            filters=filters,
            is_enabled=is_enabled,
        )
        return api_success(message=msg, data=out)

    except Exception as e:
        return _handle_error(e)


@bp.put("/semesters/<int:semester_id>/update")
@require_company_and_permission(doctype="Academic Term", action="UPDATE")
def update_semester(company_id: int, semester_id: int):
    try:
        payload = SemesterUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_semester(company_id=company_id, semester_id=semester_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/semesters/<int:semester_id>/delete")
@require_company_and_permission(doctype="Academic Term", action="DELETE")
def delete_semester(company_id: int, semester_id: int):
    try:
        ok, msg, out = svc.delete_semester(company_id=company_id, semester_id=semester_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/semesters/bulk-delete")
@require_company_and_permission(doctype="Academic Term", action="DELETE")
def bulk_delete_semesters(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_semesters(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)



# =========================================================
# COURSE
# =========================================================
@bp.post("/courses/create")
@require_company_and_permission(doctype="Course", action="CREATE")
def create_course(company_id: int):
    try:
        payload = CourseCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_course(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/courses/<int:course_id>/update")
@require_company_and_permission(doctype="Course", action="UPDATE")
def update_course(company_id: int, course_id: int):
    try:
        payload = CourseUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_course(company_id=company_id, course_id=course_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/courses/<int:course_id>/delete")
@require_company_and_permission(doctype="Course", action="DELETE")
def delete_course(company_id: int, course_id: int):
    try:
        ok, msg, out = svc.delete_course(company_id=company_id, course_id=course_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/courses/bulk-delete")
@require_company_and_permission(doctype="Course", action="DELETE")
def bulk_delete_courses(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_courses(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)

@bp.get("/courses/<int:course_id>/get")
@require_company_and_permission(doctype="Course", action="READ")
def get_course_detail(company_id: int, course_id: int):
    try:
        ok, msg, out = svc.get_course_detail(
            company_id=company_id,
            course_id=course_id,
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.get("/courses/list")
@require_company_and_permission(doctype="Course", action="READ")
def list_courses(company_id: int):
    try:
        q = request.args
        mode = (q.get("mode") or "cursor").strip().lower()

        filters: Dict[str, Any] = {
            "department_id": q.get("department_id", type=int),
            "semester_id": q.get("semester_id", type=int),
            "search": (q.get("search") or "").strip() or None,
        }

        is_enabled_raw = q.get("is_enabled")
        is_enabled: Optional[bool] = None
        if is_enabled_raw is not None:
            s = str(is_enabled_raw).strip().lower()
            if s in {"1", "true", "yes"}:
                is_enabled = True
            elif s in {"0", "false", "no"}:
                is_enabled = False

        if mode == "page":
            page = q.get("page", type=int) or 1
            per_page = q.get("per_page", type=int) or 20

            ok, msg, out = svc.list_courses_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )
            return api_success(message=msg, data=out)

        limit = q.get("limit", type=int) or 20
        cursor = (q.get("cursor") or "").strip() or None

        ok, msg, out = svc.list_courses_cursor(
            company_id=company_id,
            limit=limit,
            cursor=cursor,
            filters=filters,
            is_enabled=is_enabled,
        )
        return api_success(message=msg, data=out)

    except Exception as e:
        return _handle_error(e)





# =========================================================
# CHAPTER
# =========================================================
@bp.post("/chapters/create")
@require_company_and_permission(doctype="Chapter", action="CREATE")
def create_chapter(company_id: int):
    try:
        payload = ChapterCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_chapter(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/chapters/<int:chapter_id>/update")
@require_company_and_permission(doctype="Chapter", action="UPDATE")
def update_chapter(company_id: int, chapter_id: int):
    try:
        payload = ChapterUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_chapter(company_id=company_id, chapter_id=chapter_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/chapters/<int:chapter_id>/delete")
@require_company_and_permission(doctype="Chapter", action="DELETE")
def delete_chapter(company_id: int, chapter_id: int):
    try:
        ok, msg, out = svc.delete_chapter(company_id=company_id, chapter_id=chapter_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/chapters/bulk-delete")
@require_company_and_permission(doctype="Chapter", action="DELETE")
def bulk_delete_chapters(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_chapters(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/chapters/list")
@require_company_and_permission(doctype="Chapter", action="READ")
def list_chapters(company_id: int):
    try:
        q = request.args
        mode = (q.get("mode") or "cursor").strip().lower()

        filters: Dict[str, Any] = {
            "course_id": q.get("course_id", type=int),
            "search": (q.get("search") or "").strip() or None,
        }

        is_enabled_raw = q.get("is_enabled")
        is_enabled: Optional[bool] = None
        if is_enabled_raw is not None:
            s = str(is_enabled_raw).strip().lower()
            if s in {"1", "true", "yes"}:
                is_enabled = True
            elif s in {"0", "false", "no"}:
                is_enabled = False

        if mode == "page":
            page = q.get("page", type=int) or 1
            per_page = q.get("per_page", type=int) or 20

            ok, msg, out = svc.list_chapters_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )
            return api_success(message=msg, data=out)

        limit = q.get("limit", type=int) or 20
        cursor = (q.get("cursor") or "").strip() or None

        ok, msg, out = svc.list_chapters_cursor(
            company_id=company_id,
            limit=limit,
            cursor=cursor,
            filters=filters,
            is_enabled=is_enabled,
        )
        return api_success(message=msg, data=out)

    except Exception as e:
        return _handle_error(e)





@bp.get("/chapters/<int:chapter_id>/get")
@require_company_and_permission(doctype="Chapter", action="READ")
def get_chapter_detail(company_id: int, chapter_id: int):
    try:
        ok, msg, out = svc.get_chapter_detail(
            company_id=company_id,
            chapter_id=chapter_id,
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.get("/faculties/dropdown")
@require_company_and_permission(doctype="Faculty", action="READ")
def faculties_dropdown(company_id: int):
    try:
        search, limit, offset, active_only, filters = dropdown_args(
            parse_filters_func=_parse_filters,
            parse_bool_func=_as_bool,
        )
        data = svc.dropdown_faculties(
            company_id=company_id,
            search=search,
            limit=limit,
            offset=offset,
            active_only=active_only,
            filters=filters,
        )
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/semesters/dropdown")
@require_company_and_permission(doctype="Academic Term", action="READ")
def semesters_dropdown(company_id: int):
    try:
        search, limit, offset, active_only, filters = dropdown_args(
            parse_filters_func=_parse_filters,
            parse_bool_func=_as_bool,
        )
        data = svc.dropdown_semesters(
            company_id=company_id,
            search=search,
            limit=limit,
            offset=offset,
            active_only=active_only,
            filters=filters,
        )
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)
@bp.get("/faculties/with-departments/dropdown")
@require_company_and_permission(doctype="Faculty", action="READ")
def faculties_with_departments_dropdown(company_id: int):
    search, limit, offset, active_only, filters = dropdown_args(
        parse_filters_func=_parse_filters,
        parse_bool_func=_as_bool,
    )
    data = svc.dropdown_faculties_with_departments(
        company_id=company_id,
        search=search,
        limit=limit,
        offset=offset,
        active_only=active_only,
        filters=filters,
    )
    return api_success(message="OK", data=data, status_code=200)

@bp.get("/departments/dropdown")
@require_company_and_permission(doctype="Department", action="READ")
def departments_dropdown(company_id: int):
    try:
        search, limit, offset, active_only, filters = dropdown_args(
            parse_filters_func=_parse_filters,
            parse_bool_func=_as_bool,
        )

        faculty_id = request.args.get("faculty_id", type=int)  # ✅ dependent param

        data = svc.dropdown_departments(
            company_id=company_id,
            faculty_id=faculty_id,
            search=search,
            limit=limit,
            offset=offset,
            active_only=active_only,
            filters=filters,
        )
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)








