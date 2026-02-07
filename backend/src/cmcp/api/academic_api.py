from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional, Tuple

from flask import Blueprint, request, g

from cmcp.common.api_response import api_success, api_error
from cmcp.security.rbac_guards import require_permission, ensure_company_scope

from cmcp.modules.academic.schemas import (
    BulkDeleteIn,
    FacultyCreate, FacultyUpdate,
    DepartmentCreate, DepartmentUpdate,
    AcademicYearCreate, AcademicYearUpdate,
    SemesterCreate, SemesterUpdate,
    CourseCreate, CourseUpdate,
    ChapterCreate, ChapterUpdate,
)
from cmcp.modules.academic.academic_service import AcademicService, _semester_display_name
from cmcp.modules.academic.academic_repo import AcademicRepo
from cmcp.modules.academic.models import Faculty, Department, AcademicYear, Semester, Course, Chapter

log = logging.getLogger(__name__)

bp = Blueprint("academic", __name__, url_prefix="/api/academic")

svc = AcademicService()
repo = AcademicRepo()


# ----------------------------
# company scope helper
# ----------------------------
def _get_company_id() -> int:
    cid = request.args.get("company_id", type=int)
    if not cid:
        auth = getattr(g, "auth", None)
        cid = getattr(auth, "active_company_id", None)

    if not cid:
        raise ValueError("company_id is required.")

    ensure_company_scope(company_id=int(cid))
    return int(cid)


# ----------------------------
# list helpers (pagination + scroll + filters)
# ----------------------------
def _list_common_args() -> Tuple[str | None, str | None, int, int, int | None, int | None]:
    q = request.args.get("q")
    sort_key = request.args.get("sort_key")
    sort_order = request.args.get("sort_order")

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    limit = request.args.get("limit", type=int)     # for scroll mode
    offset = request.args.get("offset", type=int)   # for scroll mode
    return q, sort_key, sort_order, page, per_page, limit, offset


def _parse_filters() -> Dict[str, Any] | None:
    """
    Supports:
      - filters as JSON string: ?filters={"is_enabled":true,"faculty_id":2}
      - OR simple params like ?is_enabled=true
    JSON filters win if provided.
    """
    raw = request.args.get("filters")
    if raw:
        try:
            obj = json.loads(raw)
            return obj if isinstance(obj, dict) else None
        except Exception:
            return None

    # basic default: accept is_enabled as boolean if present
    filters: Dict[str, Any] = {}
    if "is_enabled" in request.args:
        v = request.args.get("is_enabled")
        if isinstance(v, str):
            filters["is_enabled"] = v.strip().lower() in ("true", "1", "yes", "y", "on")
    return filters or None


def _scroll_list(model_repo, *, company_id: int, stmt_kwargs: Dict[str, Any], limit: int, offset: int):
    items = model_repo.list(company_id=company_id, limit=limit, offset=offset, **stmt_kwargs)
    # meta for scroll
    meta = {
        "limit": limit,
        "offset": offset,
        "returned": len(items),
        "next_offset": offset + len(items),
        "has_more": len(items) == limit,
    }
    return items, meta


# =========================================================
# FACULTY
# =========================================================
@bp.post("/faculties")
@require_permission("Faculty", "Create")
def create_faculty():
    try:
        company_id = _get_company_id()
        payload = FacultyCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_faculty(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/faculties/<int:faculty_id>")
@require_permission("Faculty", "Update")
def update_faculty(faculty_id: int):
    try:
        company_id = _get_company_id()
        payload = FacultyUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_faculty(company_id=company_id, faculty_id=faculty_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/faculties/<int:faculty_id>")
@require_permission("Faculty", "Delete")
def delete_faculty(faculty_id: int):
    try:
        company_id = _get_company_id()
        ok, msg, out = svc.delete_faculty(company_id=company_id, faculty_id=faculty_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/faculties/delete-bulk")
@require_permission("Faculty", "Delete")
def bulk_delete_faculties():
    try:
        company_id = _get_company_id()
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_faculties(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/faculties")
@require_permission("Faculty", "Read")
def list_faculties():
    try:
        company_id = _get_company_id()
        q, sort_key, sort_order, page, per_page, limit, offset = _list_common_args()
        filters = _parse_filters()

        stmt_kwargs = dict(
            search=q,
            search_columns=[Faculty.name, Faculty.code],
            filters=filters,
            allowed_filters={"is_enabled": Faculty.is_enabled, "name": Faculty.name, "code": Faculty.code},
            sort_fields={"id": Faculty.id, "name": Faculty.name, "code": Faculty.code, "created_at": getattr(Faculty, "created_at", Faculty.id)},
            sort_key=sort_key,
            sort_order=sort_order,
            default_sort=[Faculty.name.asc()],
            only_enabled=False,
        )

        if limit is not None or offset is not None:
            limit = int(limit or 20)
            offset = int(offset or 0)
            items, meta = _scroll_list(repo.faculties, company_id=company_id, stmt_kwargs=stmt_kwargs, limit=limit, offset=offset)
            data = {"items": [{"id": x.id, "name": x.name, "code": x.code} for x in items], "scroll": meta}
            return api_success(message="OK", data=data, status_code=200)

        res = repo.faculties.paginate(company_id=company_id, page=page, per_page=per_page, **stmt_kwargs)
        data = {
            "items": [{"id": x.id, "name": x.name, "code": x.code} for x in res.items],
            "total": res.total,
            "page": res.page,
            "per_page": res.per_page,
            "pages": res.pages,
        }
        return api_success(message="OK", data=data, status_code=200)

    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/faculties/<int:faculty_id>")
@require_permission("Faculty", "Read")
def get_faculty(faculty_id: int):
    try:
        company_id = _get_company_id()
        obj = repo.faculties.get(faculty_id, company_id=company_id)
        if not obj:
            return api_error("Faculty not found.", status_code=404)

        data = {"id": obj.id, "name": obj.name, "code": obj.code, "is_enabled": obj.is_enabled}
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)


# =========================================================
# DEPARTMENT
# =========================================================
@bp.post("/departments")
@require_permission("Department", "Create")
def create_department():
    try:
        company_id = _get_company_id()
        payload = DepartmentCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_department(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/departments/<int:department_id>")
@require_permission("Department", "Update")
def update_department(department_id: int):
    try:
        company_id = _get_company_id()
        payload = DepartmentUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_department(company_id=company_id, department_id=department_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/departments/<int:department_id>")
@require_permission("Department", "Delete")
def delete_department(department_id: int):
    try:
        company_id = _get_company_id()
        ok, msg, out = svc.delete_department(company_id=company_id, department_id=department_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/departments/delete-bulk")
@require_permission("Department", "Delete")
def bulk_delete_departments():
    try:
        company_id = _get_company_id()
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_departments(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/departments")
@require_permission("Department", "Read")
def list_departments():
    try:
        company_id = _get_company_id()
        q, sort_key, sort_order, page, per_page, limit, offset = _list_common_args()
        filters = _parse_filters()

        include_faculty = request.args.get("include_faculty") in ("1", "true", "yes")
        eager = ["faculty"] if include_faculty else None

        stmt_kwargs = dict(
            eager_load=eager,
            search=q,
            search_columns=[Department.name, Department.code],
            filters=filters,
            allowed_filters={
                "is_enabled": Department.is_enabled,
                "faculty_id": Department.faculty_id,
                "name": Department.name,
                "code": Department.code,
            },
            sort_fields={"id": Department.id, "name": Department.name, "created_at": getattr(Department, "created_at", Department.id)},
            sort_key=sort_key,
            sort_order=sort_order,
            default_sort=[Department.name.asc()],
            only_enabled=False,
        )

        def _serialize(x: Department) -> Dict[str, Any]:
            out = {"id": x.id, "name": x.name, "code": x.code, "faculty_id": x.faculty_id}
            if include_faculty and getattr(x, "faculty", None):
                out["faculty_name"] = x.faculty.name
            return out

        if limit is not None or offset is not None:
            limit = int(limit or 20)
            offset = int(offset or 0)
            items, meta = _scroll_list(repo.departments, company_id=company_id, stmt_kwargs=stmt_kwargs, limit=limit, offset=offset)
            return api_success(message="OK", data={"items": [_serialize(x) for x in items], "scroll": meta}, status_code=200)

        res = repo.departments.paginate(company_id=company_id, page=page, per_page=per_page, **stmt_kwargs)
        data = {"items": [_serialize(x) for x in res.items], "total": res.total, "page": res.page, "per_page": res.per_page, "pages": res.pages}
        return api_success(message="OK", data=data, status_code=200)

    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/departments/<int:department_id>")
@require_permission("Department", "Read")
def get_department(department_id: int):
    try:
        company_id = _get_company_id()
        obj = repo.departments.get(department_id, company_id=company_id, eager_load=["faculty"])
        if not obj:
            return api_error("Department not found.", status_code=404)

        data = {
            "id": obj.id,
            "name": obj.name,
            "code": obj.code,
            "faculty_id": obj.faculty_id,
            "faculty_name": obj.faculty.name if getattr(obj, "faculty", None) else None,
            "is_enabled": obj.is_enabled,
        }
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)


# =========================================================
# ACADEMIC YEAR
# =========================================================
@bp.post("/years")
@require_permission("AcademicYear", "Create")
def create_year():
    try:
        company_id = _get_company_id()
        payload = AcademicYearCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_year(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/years/<int:year_id>")
@require_permission("AcademicYear", "Update")
def update_year(year_id: int):
    try:
        company_id = _get_company_id()
        payload = AcademicYearUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_year(company_id=company_id, year_id=year_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/years/<int:year_id>")
@require_permission("AcademicYear", "Delete")
def delete_year(year_id: int):
    try:
        company_id = _get_company_id()
        ok, msg, out = svc.delete_year(company_id=company_id, year_id=year_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/years/delete-bulk")
@require_permission("AcademicYear", "Delete")
def bulk_delete_years():
    try:
        company_id = _get_company_id()
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_years(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/years")
@require_permission("AcademicYear", "Read")
def list_years():
    try:
        company_id = _get_company_id()
        q, sort_key, sort_order, page, per_page, limit, offset = _list_common_args()
        filters = _parse_filters()

        stmt_kwargs = dict(
            search=q,
            search_columns=[AcademicYear.name],
            filters=filters,
            allowed_filters={"is_enabled": AcademicYear.is_enabled, "name": AcademicYear.name},
            sort_fields={"id": AcademicYear.id, "name": AcademicYear.name, "created_at": getattr(AcademicYear, "created_at", AcademicYear.id)},
            sort_key=sort_key,
            sort_order=sort_order,
            default_sort=[AcademicYear.name.asc()],
            only_enabled=False,
        )

        if limit is not None or offset is not None:
            limit = int(limit or 20)
            offset = int(offset or 0)
            items, meta = _scroll_list(repo.years, company_id=company_id, stmt_kwargs=stmt_kwargs, limit=limit, offset=offset)
            return api_success(message="OK", data={"items": [{"id": x.id, "name": x.name} for x in items], "scroll": meta}, status_code=200)

        res = repo.years.paginate(company_id=company_id, page=page, per_page=per_page, **stmt_kwargs)
        data = {"items": [{"id": x.id, "name": x.name} for x in res.items], "total": res.total, "page": res.page, "per_page": res.per_page, "pages": res.pages}
        return api_success(message="OK", data=data, status_code=200)

    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/years/<int:year_id>")
@require_permission("AcademicYear", "Read")
def get_year(year_id: int):
    try:
        company_id = _get_company_id()
        obj = repo.years.get(year_id, company_id=company_id)
        if not obj:
            return api_error("Academic year not found.", status_code=404)

        data = {"id": obj.id, "name": obj.name, "is_enabled": obj.is_enabled}
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)


# =========================================================
# SEMESTER
# =========================================================
@bp.post("/semesters")
@require_permission("Semester", "Create")
def create_semester():
    try:
        company_id = _get_company_id()
        payload = SemesterCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_semester(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/semesters/<int:semester_id>")
@require_permission("Semester", "Update")
def update_semester(semester_id: int):
    try:
        company_id = _get_company_id()
        payload = SemesterUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_semester(company_id=company_id, semester_id=semester_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/semesters/<int:semester_id>")
@require_permission("Semester", "Delete")
def delete_semester(semester_id: int):
    try:
        company_id = _get_company_id()
        ok, msg, out = svc.delete_semester(company_id=company_id, semester_id=semester_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/semesters/delete-bulk")
@require_permission("Semester", "Delete")
def bulk_delete_semesters():
    try:
        company_id = _get_company_id()
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_semesters(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/semesters")
@require_permission("Semester", "Read")
def list_semesters():
    try:
        company_id = _get_company_id()
        q, sort_key, sort_order, page, per_page, limit, offset = _list_common_args()
        filters = _parse_filters()

        include_year = request.args.get("include_year") in ("1", "true", "yes")
        eager = ["academic_year"] if include_year else None

        stmt_kwargs = dict(
            eager_load=eager,
            search=q,
            search_columns=[Semester.name],
            filters=filters,
            allowed_filters={
                "is_enabled": Semester.is_enabled,
                "academic_year_id": Semester.academic_year_id,
                "number": Semester.number,
                "name": Semester.name,
            },
            sort_fields={"id": Semester.id, "number": Semester.number, "created_at": getattr(Semester, "created_at", Semester.id)},
            sort_key=sort_key,
            sort_order=sort_order,
            default_sort=[Semester.number.asc()],
            only_enabled=False,
        )

        def _serialize(x: Semester) -> Dict[str, Any]:
            out = {"id": x.id, "name": (x.name or f"Semester {x.number}"), "number": x.number, "academic_year_id": x.academic_year_id}
            if include_year and getattr(x, "academic_year", None):
                out["academic_year_name"] = x.academic_year.name
            return out

        if limit is not None or offset is not None:
            limit = int(limit or 20)
            offset = int(offset or 0)
            items, meta = _scroll_list(repo.semesters, company_id=company_id, stmt_kwargs=stmt_kwargs, limit=limit, offset=offset)
            return api_success(message="OK", data={"items": [_serialize(x) for x in items], "scroll": meta}, status_code=200)

        res = repo.semesters.paginate(company_id=company_id, page=page, per_page=per_page, **stmt_kwargs)
        data = {"items": [_serialize(x) for x in res.items], "total": res.total, "page": res.page, "per_page": res.per_page, "pages": res.pages}
        return api_success(message="OK", data=data, status_code=200)

    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/semesters/<int:semester_id>")
@require_permission("Semester", "Read")
def get_semester(semester_id: int):
    try:
        company_id = _get_company_id()
        obj = repo.semesters.get(semester_id, company_id=company_id, eager_load=["academic_year"])
        if not obj:
            return api_error("Semester not found.", status_code=404)

        data = {
            "id": obj.id,
            "name": (obj.name or f"Semester {obj.number}"),
            "number": obj.number,
            "academic_year_id": obj.academic_year_id,
            "academic_year_name": obj.academic_year.name if getattr(obj, "academic_year", None) else None,
            "is_enabled": obj.is_enabled,
        }
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)


# =========================================================
# COURSE
# =========================================================
@bp.post("/courses")
@require_permission("Course", "Create")
def create_course():
    try:
        company_id = _get_company_id()
        payload = CourseCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_course(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/courses/<int:course_id>")
@require_permission("Course", "Update")
def update_course(course_id: int):
    try:
        company_id = _get_company_id()
        payload = CourseUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_course(company_id=company_id, course_id=course_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/courses/<int:course_id>")
@require_permission("Course", "Delete")
def delete_course(course_id: int):
    try:
        company_id = _get_company_id()
        ok, msg, out = svc.delete_course(company_id=company_id, course_id=course_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/courses/delete-bulk")
@require_permission("Course", "Delete")
def bulk_delete_courses():
    try:
        company_id = _get_company_id()
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_courses(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/courses")
@require_permission("Course", "Read")
def list_courses():
    try:
        company_id = _get_company_id()
        q, sort_key, sort_order, page, per_page, limit, offset = _list_common_args()
        filters = _parse_filters()

        include_dept = request.args.get("include_department") in ("1", "true", "yes")
        include_sem = request.args.get("include_semester") in ("1", "true", "yes")

        eager = []
        if include_dept:
            eager.append("department")
        if include_sem:
            eager.append("semester")
        eager = eager or None

        stmt_kwargs = dict(
            eager_load=eager,
            search=q,
            search_columns=[Course.title, Course.code, Course.description],
            filters=filters,
            allowed_filters={
                "is_enabled": Course.is_enabled,
                "department_id": Course.department_id,
                "semester_id": Course.semester_id,
                "title": Course.title,
                "code": Course.code,
            },
            sort_fields={"id": Course.id, "title": Course.title, "created_at": getattr(Course, "created_at", Course.id)},
            sort_key=sort_key,
            sort_order=sort_order,
            default_sort=[Course.title.asc()],
            only_enabled=False,
        )

        def _serialize(x: Course) -> Dict[str, Any]:
            out = {"id": x.id, "title": x.title, "code": x.code, "department_id": x.department_id, "semester_id": x.semester_id}
            if include_dept and getattr(x, "department", None):
                out["department_name"] = x.department.name
            if include_sem and getattr(x, "semester", None):
                out["semester_name"] = x.semester.name or f"Semester {x.semester.number}"
            return out

        if limit is not None or offset is not None:
            limit = int(limit or 20)
            offset = int(offset or 0)
            items, meta = _scroll_list(repo.courses, company_id=company_id, stmt_kwargs=stmt_kwargs, limit=limit, offset=offset)
            return api_success(message="OK", data={"items": [_serialize(x) for x in items], "scroll": meta}, status_code=200)

        res = repo.courses.paginate(company_id=company_id, page=page, per_page=per_page, **stmt_kwargs)
        data = {"items": [_serialize(x) for x in res.items], "total": res.total, "page": res.page, "per_page": res.per_page, "pages": res.pages}
        return api_success(message="OK", data=data, status_code=200)

    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/courses/<int:course_id>")
@require_permission("Course", "Read")
def get_course(course_id: int):
    try:
        company_id = _get_company_id()
        obj = repo.courses.get(course_id, company_id=company_id, eager_load=["department", "semester", "chapters"])
        if not obj:
            return api_error("Course not found.", status_code=404)

        chapters = []
        if getattr(obj, "chapters", None):
            chapters = [{"id": ch.id, "title": ch.title, "number": ch.number} for ch in sorted(obj.chapters, key=lambda x: x.number)]

        data = {
            "id": obj.id,
            "title": obj.title,
            "code": obj.code,
            "description": obj.description,
            "department_id": obj.department_id,
            "department_name": obj.department.name if getattr(obj, "department", None) else None,
            "semester_id": obj.semester_id,
            "semester_name": (obj.semester.name or f"Semester {obj.semester.number}") if getattr(obj, "semester", None) else None,
            "chapters": chapters,
            "is_enabled": obj.is_enabled,
        }
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)


# =========================================================
# CHAPTER
# =========================================================
@bp.post("/chapters")
@require_permission("Chapter", "Create")
def create_chapter():
    try:
        company_id = _get_company_id()
        payload = ChapterCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_chapter(company_id=company_id, data=payload.model_dump())
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.put("/chapters/<int:chapter_id>")
@require_permission("Chapter", "Update")
def update_chapter(chapter_id: int):
    try:
        company_id = _get_company_id()
        payload = ChapterUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_chapter(company_id=company_id, chapter_id=chapter_id, data=payload.model_dump(exclude_unset=True))
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.delete("/chapters/<int:chapter_id>")
@require_permission("Chapter", "Delete")
def delete_chapter(chapter_id: int):
    try:
        company_id = _get_company_id()
        ok, msg, out = svc.delete_chapter(company_id=company_id, chapter_id=chapter_id, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.post("/chapters/delete-bulk")
@require_permission("Chapter", "Delete")
def bulk_delete_chapters():
    try:
        company_id = _get_company_id()
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_chapters(company_id=company_id, ids=payload.ids, soft=True)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/chapters")
@require_permission("Chapter", "Read")
def list_chapters():
    try:
        company_id = _get_company_id()
        q, sort_key, sort_order, page, per_page, limit, offset = _list_common_args()
        filters = _parse_filters()

        include_course = request.args.get("include_course") in ("1", "true", "yes")
        eager = ["course"] if include_course else None

        stmt_kwargs = dict(
            eager_load=eager,
            search=q,
            search_columns=[Chapter.title, Chapter.description],
            filters=filters,
            allowed_filters={
                "is_enabled": Chapter.is_enabled,
                "course_id": Chapter.course_id,
                "number": Chapter.number,
                "title": Chapter.title,
            },
            sort_fields={"id": Chapter.id, "number": Chapter.number, "created_at": getattr(Chapter, "created_at", Chapter.id)},
            sort_key=sort_key,
            sort_order=sort_order,
            default_sort=[Chapter.number.asc()],
            only_enabled=False,
        )

        def _serialize(x: Chapter) -> Dict[str, Any]:
            out = {"id": x.id, "title": x.title, "number": x.number, "course_id": x.course_id}
            if include_course and getattr(x, "course", None):
                out["course_title"] = x.course.title
            return out

        if limit is not None or offset is not None:
            limit = int(limit or 20)
            offset = int(offset or 0)
            items, meta = _scroll_list(repo.chapters, company_id=company_id, stmt_kwargs=stmt_kwargs, limit=limit, offset=offset)
            return api_success(message="OK", data={"items": [_serialize(x) for x in items], "scroll": meta}, status_code=200)

        res = repo.chapters.paginate(company_id=company_id, page=page, per_page=per_page, **stmt_kwargs)
        data = {"items": [_serialize(x) for x in res.items], "total": res.total, "page": res.page, "per_page": res.per_page, "pages": res.pages}
        return api_success(message="OK", data=data, status_code=200)

    except Exception as e:
        return api_error(str(e), status_code=400)


@bp.get("/chapters/<int:chapter_id>")
@require_permission("Chapter", "Read")
def get_chapter(chapter_id: int):
    try:
        company_id = _get_company_id()
        obj = repo.chapters.get(chapter_id, company_id=company_id, eager_load=["course"])
        if not obj:
            return api_error("Chapter not found.", status_code=404)

        data = {
            "id": obj.id,
            "title": obj.title,
            "number": obj.number,
            "description": obj.description,
            "course_id": obj.course_id,
            "course_title": obj.course.title if getattr(obj, "course", None) else None,
            "is_enabled": obj.is_enabled,
        }
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return api_error(str(e), status_code=400)
