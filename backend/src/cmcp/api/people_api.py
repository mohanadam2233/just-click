from __future__ import annotations

import json
from typing import Any, Dict, Optional, Tuple

from flask import Blueprint, request

from cmcp.common.api_response import api_success, api_error
from cmcp.config.database import db
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.security.rbac_guards import require_company_and_permission

from cmcp.modules.education_people.schemas import (
    BulkDeleteIn,
    ClassroomCreate, ClassroomUpdate,
    StudentProfileCreate, StudentProfileUpdate,
    StaffProfileCreate, StaffProfileUpdate,
)
from cmcp.modules.education_people.service import EducationPeopleService

bp = Blueprint("education_people", __name__, url_prefix="/api/education_people")
svc = EducationPeopleService()


def _as_bool(v: Any) -> bool:
    if isinstance(v, bool):
        return v
    if isinstance(v, str):
        return v.strip().lower() in ("1", "true", "yes", "y", "on")
    return bool(v)


def _parse_filters() -> Dict[str, Any] | None:
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


def _commit_ok(ok: bool):
    if ok:
        db.session.commit()
    else:
        db.session.rollback()


def _handle_error(e: Exception):
    db.session.rollback()
    # your validation layer now throws these (like academic)
    if isinstance(e, NotFoundError):
        return api_error(str(e), status_code=404)
    if isinstance(e, BusinessValidationError):
        return api_error(str(e), status_code=400)
    return api_error(str(e), status_code=400)


# =========================================================
# CLASSROOM
# =========================================================
@bp.post("/classrooms/create")
@require_company_and_permission(doctype="Classroom", action="CREATE")
def create_classroom(company_id: int):
    try:
        payload = ClassroomCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_classroom(company_id=company_id, data=payload.model_dump())
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.put("/classrooms/<int:classroom_id>/update")
@require_company_and_permission(doctype="Classroom", action="UPDATE")
def update_classroom(company_id: int, classroom_id: int):
    try:
        payload = ClassroomUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_classroom(
            company_id=company_id,
            classroom_id=classroom_id,
            data=payload.model_dump(exclude_unset=True),
        )
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.delete("/classrooms/<int:classroom_id>/delete")
@require_company_and_permission(doctype="Classroom", action="DELETE")
def delete_classroom(company_id: int, classroom_id: int):
    try:
        ok, msg, out = svc.delete_classroom(company_id=company_id, classroom_id=classroom_id, soft=True)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.post("/classrooms/bulk-delete")
@require_company_and_permission(doctype="Classroom", action="DELETE")
def bulk_delete_classrooms(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_classrooms(company_id=company_id, ids=payload.ids, soft=True)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.get("/classrooms/list")
@require_company_and_permission(doctype="Classroom", action="READ")
def list_classrooms(company_id: int):
    try:
        q, sort_key, sort_order, page, per_page, limit, offset, filters = _list_args()
        mode = _list_mode(limit, offset)

        args = {
            "q": q,
            "sort_key": sort_key,
            "sort_order": sort_order,
            "page": page,
            "per_page": per_page,
            "limit": int(limit or 20),
            "offset": int(offset or 0),
            "filters": filters,
        }
        data = svc.list_classrooms(company_id=company_id, mode=mode, args=args)
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return _handle_error(e)


@bp.get("/classrooms/<int:classroom_id>/get")
@require_company_and_permission(doctype="Classroom", action="READ")
def get_classroom(company_id: int, classroom_id: int):
    try:
        rec = svc.get_classroom(company_id=company_id, classroom_id=classroom_id)
        return api_success(message="OK", data=rec, status_code=200) if rec else api_error("Classroom not found.", status_code=404)
    except Exception as e:
        return _handle_error(e)


# =========================================================
# STUDENT PROFILE
# =========================================================
@bp.post("/students/create")
@require_company_and_permission(doctype="Student Profile", action="CREATE")
def create_student(company_id: int):
    try:
        payload = StudentProfileCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_student(company_id=company_id, data=payload.model_dump())
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.put("/students/<int:student_profile_id>/update")
@require_company_and_permission(doctype="Student Profile", action="UPDATE")
def update_student(company_id: int, student_profile_id: int):
    try:
        payload = StudentProfileUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_student(
            company_id=company_id,
            student_profile_id=student_profile_id,
            data=payload.model_dump(exclude_unset=True),
        )
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.delete("/students/<int:student_profile_id>/delete")
@require_company_and_permission(doctype="Student Profile", action="DELETE")
def delete_student(company_id: int, student_profile_id: int):
    try:
        ok, msg, out = svc.delete_student(company_id=company_id, student_profile_id=student_profile_id, soft=True)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.post("/students/bulk-delete")
@require_company_and_permission(doctype="Student Profile", action="DELETE")
def bulk_delete_students(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_students(company_id=company_id, ids=payload.ids, soft=True)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.get("/students/list")
@require_company_and_permission(doctype="Student Profile", action="READ")
def list_students(company_id: int):
    try:
        q, sort_key, sort_order, page, per_page, limit, offset, filters = _list_args()
        mode = _list_mode(limit, offset)

        args = {
            "q": q,
            "sort_key": sort_key,
            "sort_order": sort_order,
            "page": page,
            "per_page": per_page,
            "limit": int(limit or 20),
            "offset": int(offset or 0),
            "filters": filters,
        }

        data = svc.list_students(company_id=company_id, mode=mode, args=args)
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return _handle_error(e)


@bp.get("/students/<int:student_profile_id>/get")
@require_company_and_permission(doctype="Student Profile", action="READ")
def get_student(company_id: int, student_profile_id: int):
    try:
        rec = svc.get_student(company_id=company_id, student_profile_id=student_profile_id)
        return api_success(message="OK", data=rec, status_code=200) if rec else api_error("Student profile not found.", status_code=404)
    except Exception as e:
        return _handle_error(e)


# =========================================================
# STAFF PROFILE
# =========================================================
@bp.post("/staff/create")
@require_company_and_permission(doctype="Staff Profile", action="CREATE")
def create_staff(company_id: int):
    try:
        payload = StaffProfileCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_staff(company_id=company_id, data=payload.model_dump())
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.put("/staff/<int:staff_profile_id>/update")
@require_company_and_permission(doctype="Staff Profile", action="UPDATE")
def update_staff(company_id: int, staff_profile_id: int):
    try:
        payload = StaffProfileUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_staff(
            company_id=company_id,
            staff_profile_id=staff_profile_id,
            data=payload.model_dump(exclude_unset=True),
        )
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.delete("/staff/<int:staff_profile_id>/delete")
@require_company_and_permission(doctype="Staff Profile", action="DELETE")
def delete_staff(company_id: int, staff_profile_id: int):
    try:
        ok, msg, out = svc.delete_staff(company_id=company_id, staff_profile_id=staff_profile_id, soft=True)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.post("/staff/bulk-delete")
@require_company_and_permission(doctype="Staff Profile", action="DELETE")
def bulk_delete_staff(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_staff(company_id=company_id, ids=payload.ids, soft=True)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.get("/staff/list")
@require_company_and_permission(doctype="Staff Profile", action="READ")
def list_staff(company_id: int):
    try:
        q, sort_key, sort_order, page, per_page, limit, offset, filters = _list_args()
        mode = _list_mode(limit, offset)

        args = {
            "q": q,
            "sort_key": sort_key,
            "sort_order": sort_order,
            "page": page,
            "per_page": per_page,
            "limit": int(limit or 20),
            "offset": int(offset or 0),
            "filters": filters,
        }

        data = svc.list_staff(company_id=company_id, mode=mode, args=args)
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return _handle_error(e)


@bp.get("/staff/<int:staff_profile_id>/get")
@require_company_and_permission(doctype="Staff Profile", action="READ")
def get_staff(company_id: int, staff_profile_id: int):
    try:
        rec = svc.get_staff(company_id=company_id, staff_profile_id=staff_profile_id)
        return api_success(message="OK", data=rec, status_code=200) if rec else api_error("Staff profile not found.", status_code=404)
    except Exception as e:
        return _handle_error(e)
