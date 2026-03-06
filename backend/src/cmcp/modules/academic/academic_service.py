from __future__ import annotations

from typing import Any, Dict, Optional, Tuple, List, Set

from flask import g
from sqlalchemy import exists, select

from cmcp.common.cache import cached_dropdown, cached_list
from cmcp.core.base_service import BaseService
from cmcp.core.exceptions import NotFoundError
from cmcp.modules.academic.academic_repo import AcademicRepo
from cmcp.modules.academic.models import Faculty, Department, AcademicYear, Semester, Course, Chapter
from cmcp.modules.academic.validation import (
    cannot_delete_linked,
    require_text,
    normalize_code,
    ERR_FACULTY_NOT_FOUND,
    ERR_DEPARTMENT_NOT_FOUND,
    ERR_ACADEMIC_YEAR_NOT_FOUND,
    ERR_SEMESTER_NOT_FOUND,
    ERR_COURSE_NOT_FOUND,
    ERR_CHAPTER_NOT_FOUND,
    ERR_FACULTY_EXISTS,
    ERR_FACULTY_CODE_EXISTS,
    ERR_DEPARTMENT_EXISTS_IN_FACULTY,
    ERR_DEPARTMENT_CODE_EXISTS,
    ERR_ACADEMIC_YEAR_EXISTS,
    ERR_SEMESTER_EXISTS_NAME,
    ERR_SEMESTER_EXISTS_NUMBER,
    ERR_COURSE_EXISTS_TITLE_IN_SCOPE,
    ERR_COURSE_CODE_EXISTS,
    ERR_CHAPTER_EXISTS_TITLE,
    ERR_CHAPTER_EXISTS_NUMBER,
)
from cmcp.core.http.dropdown_args import dropdown_args
from cmcp.modules.materials.service import _encode_cursor, _decode_cursor


def _safe_desc(v: Any) -> str | None:
    s = (v or "").strip()
    return s or None


def _semester_display_name(s: Semester) -> str:
    n = (getattr(s, "name", None) or "").strip()
    return n or f"Semester {int(s.number)}"


class AcademicService:
    """
    One module service with:
    - business rules/validations
    - standardized list/get via BaseService (query_utils)
    """

    def __init__(self, repo: Optional[AcademicRepo] = None):
        self.repo = repo or AcademicRepo()
        self.s = self.repo.s

        self.faculty_svc = BaseService(Faculty, session=self.s)
        self.department_svc = BaseService(Department, session=self.s)
        self.year_svc = BaseService(AcademicYear, session=self.s)
        self.semester_svc = BaseService(Semester, session=self.s)
        self.course_svc = BaseService(Course, session=self.s)
        self.chapter_svc = BaseService(Chapter, session=self.s)

    # ---------------------------------------------------------
    # Common bulk delete helper (linked guard + soft delete in one query)
    # ---------------------------------------------------------
    def _bulk_delete_with_link_guard(
        self,
        *,
        company_id: int,
        ids: List[int],
        model,
        base_svc: BaseService,
        linked_ids: Set[int],
        not_found_msg: str,
        linked_msg: str,
        soft: bool = True,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        ids = [int(x) for x in (ids or []) if x]
        if not ids:
            return True, "Nothing to delete.", {"deleted": [], "failed": []}

        existing = self.repo.existing_ids(model=model, company_id=company_id, ids=ids)

        failed: List[Dict[str, Any]] = []
        delete_ids: List[int] = []

        for _id in ids:
            if _id not in existing:
                failed.append({"id": _id, "error": not_found_msg})
            elif _id in linked_ids:
                failed.append({"id": _id, "error": linked_msg})
            else:
                delete_ids.append(_id)

        if not delete_ids:
            return True, "Nothing to delete.", {"deleted": [], "failed": failed}

        ok, msg, meta = base_svc.bulk_delete(company_id=company_id, ids=delete_ids, soft=soft)
        if not ok:
            return False, msg, {"deleted": [], "failed": failed}

        return True, f"Deleted {meta.get('deleted', 0)} record(s).", {"deleted": delete_ids, "failed": failed}

    # =========================================================
    # FACULTY
    # =========================================================
    def create_faculty(self, *, company_id: int, data: Dict[str, Any]):
        name = require_text(data.get("name"), field_label="Faculty name")
        code = normalize_code(data.get("code"))

        if self.repo.faculty_name_exists(company_id=company_id, name=name):
            return False, ERR_FACULTY_EXISTS, None
        if code and self.repo.faculty_code_exists(company_id=company_id, code=code):
            return False, ERR_FACULTY_CODE_EXISTS, None

        return self.faculty_svc.create(company_id=company_id, data={"name": name, "code": code, "is_enabled": True})

    def update_faculty(self, *, company_id: int, faculty_id: int, data: Dict[str, Any]):
        obj = self.repo.faculties.get(faculty_id, company_id=company_id)
        if not obj:
            return False, ERR_FACULTY_NOT_FOUND, None

        patch: Dict[str, Any] = {}
        if "name" in data and data["name"] is not None:
            name = require_text(data.get("name"), field_label="Faculty name")
            if self.repo.faculty_name_exists(company_id=company_id, name=name, exclude_id=obj.id):
                return False, ERR_FACULTY_EXISTS, None
            patch["name"] = name

        if "code" in data:
            code = normalize_code(data.get("code"))
            if code and self.repo.faculty_code_exists(company_id=company_id, code=code, exclude_id=obj.id):
                return False, ERR_FACULTY_CODE_EXISTS, None
            patch["code"] = code

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        return self.faculty_svc.update(company_id=company_id, id=faculty_id, data=patch)

    def delete_faculty(self, *, company_id: int, faculty_id: int, soft: bool = True):
        obj = self.repo.faculties.get(faculty_id, company_id=company_id)
        if not obj:
            return False, ERR_FACULTY_NOT_FOUND, None
        linked = self.repo.faculties_with_departments([obj.id])
        if obj.id in linked:
            return False, cannot_delete_linked("Faculty", "Departments"), None
        return self.faculty_svc.delete(company_id=company_id, id=faculty_id, soft=soft)

    def bulk_delete_faculties(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.faculties_with_departments(ids)
        return self._bulk_delete_with_link_guard(
            company_id=company_id,
            ids=ids,
            model=Faculty,
            base_svc=self.faculty_svc,
            linked_ids=linked,
            not_found_msg=ERR_FACULTY_NOT_FOUND,
            linked_msg=cannot_delete_linked("Faculty", "Departments"),
            soft=soft,
        )
    def get_faculty(self, *, company_id: int, faculty_id: int) -> Optional[Dict[str, Any]]:
        return self.faculty_svc.get_one(company_id=company_id, id=faculty_id)

    # =========================================================
    # DEPARTMENT
    # =========================================================
    def create_department(self, *, company_id: int, data: Dict[str, Any]):
        faculty_id = int(data.get("faculty_id") or 0)
        if not self.repo.faculties.get(faculty_id, company_id=company_id):
            return False, ERR_FACULTY_NOT_FOUND, None

        name = require_text(data.get("name"), field_label="Department name")
        code = normalize_code(data.get("code"))

        if self.repo.department_name_exists(company_id=company_id, faculty_id=faculty_id, name=name):
            return False, ERR_DEPARTMENT_EXISTS_IN_FACULTY, None
        if code and self.repo.department_code_exists(company_id=company_id, code=code):
            return False, ERR_DEPARTMENT_CODE_EXISTS, None

        return self.department_svc.create(
            company_id=company_id,
            data={"faculty_id": faculty_id, "name": name, "code": code, "is_enabled": True},
        )

    def update_department(self, *, company_id: int, department_id: int, data: Dict[str, Any]):
        obj = self.repo.departments.get(department_id, company_id=company_id)
        if not obj:
            return False, ERR_DEPARTMENT_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "faculty_id" in data and data["faculty_id"] is not None:
            new_faculty_id = int(data["faculty_id"])
            if not self.repo.faculties.get(new_faculty_id, company_id=company_id):
                return False, ERR_FACULTY_NOT_FOUND, None
            patch["faculty_id"] = new_faculty_id

        if "name" in data and data["name"] is not None:
            name = require_text(data.get("name"), field_label="Department name")
            check_faculty_id = int(patch.get("faculty_id") or obj.faculty_id)
            if self.repo.department_name_exists(company_id=company_id, faculty_id=check_faculty_id, name=name, exclude_id=obj.id):
                return False, ERR_DEPARTMENT_EXISTS_IN_FACULTY, None
            patch["name"] = name

        if "code" in data:
            code = normalize_code(data.get("code"))
            if code and self.repo.department_code_exists(company_id=company_id, code=code, exclude_id=obj.id):
                return False, ERR_DEPARTMENT_CODE_EXISTS, None
            patch["code"] = code

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        return self.department_svc.update(company_id=company_id, id=department_id, data=patch)

    def delete_department(self, *, company_id: int, department_id: int, soft: bool = True):
        obj = self.repo.departments.get(department_id, company_id=company_id)
        if not obj:
            return False, ERR_DEPARTMENT_NOT_FOUND, None
        linked = self.repo.departments_with_courses([obj.id])
        if obj.id in linked:
            return False, cannot_delete_linked("Department", "Courses"), None
        return self.department_svc.delete(company_id=company_id, id=department_id, soft=soft)

    def bulk_delete_departments(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.departments_with_courses(ids)
        return self._bulk_delete_with_link_guard(
            company_id=company_id,
            ids=ids,
            model=Department,
            base_svc=self.department_svc,
            linked_ids=linked,
            not_found_msg=ERR_DEPARTMENT_NOT_FOUND,
            linked_msg=cannot_delete_linked("Department", "Courses"),
            soft=soft,
        )

    def get_department(self, *, company_id: int, department_id: int) -> Optional[Dict[str, Any]]:
        rec = self.department_svc.get_one(company_id=company_id, id=department_id, eager_load=["faculty"])
        if rec and isinstance(rec.get("faculty"), dict):
            rec["faculty_name"] = rec["faculty"].get("name")
        return rec

    # =========================================================
    # YEAR / SEMESTER / COURSE / CHAPTER
    # =========================================================
    # Same pattern as above (business rules) — kept compact by implementing
    # full CRUD + list/get below.

    def create_year(self, *, company_id: int, data: Dict[str, Any]):
        name = require_text(data.get("name"), field_label="Academic year name")
        if self.repo.academic_year_name_exists(company_id=company_id, name=name):
            return False, ERR_ACADEMIC_YEAR_EXISTS, None
        return self.year_svc.create(company_id=company_id, data={"name": name, "is_enabled": True})

    def update_year(self, *, company_id: int, year_id: int, data: Dict[str, Any]):
        obj = self.repo.years.get(year_id, company_id=company_id)
        if not obj:
            return False, ERR_ACADEMIC_YEAR_NOT_FOUND, None
        patch: Dict[str, Any] = {}
        if "name" in data and data["name"] is not None:
            name = require_text(data.get("name"), field_label="Academic year name")
            if self.repo.academic_year_name_exists(company_id=company_id, name=name, exclude_id=obj.id):
                return False, ERR_ACADEMIC_YEAR_EXISTS, None
            patch["name"] = name
        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])
        return self.year_svc.update(company_id=company_id, id=year_id, data=patch)

    def delete_year(self, *, company_id: int, year_id: int, soft: bool = True):
        obj = self.repo.years.get(year_id, company_id=company_id)
        if not obj:
            return False, ERR_ACADEMIC_YEAR_NOT_FOUND, None
        linked = self.repo.years_with_semesters([obj.id])
        if obj.id in linked:
            return False, cannot_delete_linked("Academic year", "Semesters"), None
        return self.year_svc.delete(company_id=company_id, id=year_id, soft=soft)

    def bulk_delete_years(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.years_with_semesters(ids)
        return self._bulk_delete_with_link_guard(
            company_id=company_id,
            ids=ids,
            model=AcademicYear,
            base_svc=self.year_svc,
            linked_ids=linked,
            not_found_msg=ERR_ACADEMIC_YEAR_NOT_FOUND,
            linked_msg=cannot_delete_linked("Academic year", "Semesters"),
            soft=soft,
        )



    def list_academic_years_cursor(
        self,
        *,
        company_id: int,
        limit: int,
        cursor: Optional[str],
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:

        limit = max(1, min(int(limit or 20), 100))

        cur = _decode_cursor(cursor or "")
        last_id = cur.get("last_id")
        try:
            last_id = int(last_id) if last_id is not None else None
        except Exception:
            last_id = None

        params = {
            "mode": "cursor",
            "limit": limit,
            "last_id": last_id,
            "filters": filters,
            "is_enabled": is_enabled,
        }

        def builder():
            rows, total_count, has_more = self.repo.list_academic_years_cursor(
                company_id=company_id,
                limit=limit,
                last_id=last_id,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_academic_year_list_row(r) for r in rows]

            next_cursor = None
            if has_more and rows:
                next_cursor = _encode_cursor({"last_id": int(rows[-1].id)})

            return {
                "data": data,
                "pagination": {
                    "limit": limit,
                    "next_cursor": next_cursor,
                    "has_more": bool(has_more),
                },
                "meta": {"total_count": int(total_count)},
            }

        out = cached_list(
            entity="academic_years:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out


    def list_academic_years_page(
        self,
        *,
        company_id: int,
        page: int,
        per_page: int,
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:

        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20
        page = max(int(page or 1), 1)

        params = {
            "mode": "page",
            "page": page,
            "per_page": per_page,
            "filters": filters,
            "is_enabled": is_enabled,
        }

        def builder():
            rows, total_count, pages = self.repo.list_academic_years_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_academic_year_list_row(r) for r in rows]

            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "pages": int(pages),
                    "total_count": int(total_count),
                },
            }

        out = cached_list(
            entity="academic_years:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out


    def get_year(self, *, company_id: int, year_id: int) -> Optional[Dict[str, Any]]:
        return self.year_svc.get_one(company_id=company_id, id=year_id)


    # =========================================================
    # ACADEMIC YEAR: DETAIL
    # =========================================================
    def get_academic_year_detail(
        self,
        *,
        company_id: int,
        academic_year_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        row = self.repo.get_academic_year_detail(
            company_id=company_id,
            academic_year_id=academic_year_id,
        )

        if not row:
            raise NotFoundError("Academic year not found")

        semesters_preview = self.repo.academic_year_semesters_preview(
            company_id=company_id,
            academic_year_id=academic_year_id,
            limit=5,
        )

        data = self.repo.shape_academic_year_detail_row(
            row,
            semesters_preview=semesters_preview,
        )

        return True, "OK", data

    # ----- Semester -----
    def create_semester(self, *, company_id: int, data: Dict[str, Any]):
        academic_year_id = int(data.get("academic_year_id") or 0)
        if not self.repo.years.get(academic_year_id, company_id=company_id):
            return False, ERR_ACADEMIC_YEAR_NOT_FOUND, None

        number = int(data.get("number") or 0)
        if number < 1:
            return False, "Semester number must be at least 1", None

        name = (data.get("name") or "").strip() or None

        if name and self.repo.semester_name_exists(company_id=company_id, name=name):
            return False, ERR_SEMESTER_EXISTS_NAME, None
        if self.repo.semester_number_exists(company_id=company_id, academic_year_id=academic_year_id, number=number):
            return False, ERR_SEMESTER_EXISTS_NUMBER, None

        return self.semester_svc.create(
            company_id=company_id,
            data={"academic_year_id": academic_year_id, "number": number, "name": name, "is_enabled": True},
        )


    def list_semesters_cursor(
        self,
        *,
        company_id: int,
        limit: int,
        cursor: Optional[str],
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        limit = max(1, min(int(limit or 20), 100))

        cur = _decode_cursor(cursor or "")
        last_no = cur.get("last_no")
        try:
            last_no = int(last_no) if last_no is not None else None
        except Exception:
            last_no = None

        params = {
            "mode": "cursor",
            "limit": limit,
            "last_no": last_no,
            "filters": filters,
            "is_enabled": is_enabled,
        }

        def builder():
            rows, total_count, has_more = self.repo.list_semesters_cursor(
                company_id=company_id,
                limit=limit,
                last_no=last_no,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_semester_list_row(r) for r in rows]

            next_cursor = None
            if has_more and rows:
                next_cursor = _encode_cursor({"last_no": int(rows[-1].number)})

            return {
                "data": data,
                "pagination": {
                    "limit": limit,
                    "next_cursor": next_cursor,
                    "has_more": bool(has_more),
                },
                "meta": {"total_count": int(total_count)},
            }

        out = cached_list(
            entity="semesters:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out



    def list_semesters_page(
        self,
        *,
        company_id: int,
        page: int,
        per_page: int,
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20
        page = max(int(page or 1), 1)

        params = {
            "mode": "page",
            "page": page,
            "per_page": per_page,
            "filters": filters,
            "is_enabled": is_enabled,
        }

        def builder():
            rows, total_count, pages = self.repo.list_semesters_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_semester_list_row(r) for r in rows]

            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "pages": int(pages),
                    "total_count": int(total_count),
                },
            }

        out = cached_list(
            entity="semesters:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

    def get_semester_detail(
            self,
            *,
            company_id: int,
            semester_id: int,
    ):

        row = self.repo.get_semester_detail(
            company_id=company_id,
            semester_id=semester_id,
        )

        if not row:
            raise NotFoundError("Semester not found")

        courses_preview = self.repo.semester_courses_preview(
            company_id=company_id,
            semester_id=semester_id,
        )

        data = self.repo.shape_semester_detail_row(
            row,
            courses_preview=courses_preview,
        )

        return True, "OK", data

    def update_semester(self, *, company_id: int, semester_id: int, data: Dict[str, Any]):
        obj = self.repo.semesters.get(semester_id, company_id=company_id)
        if not obj:
            return False, ERR_SEMESTER_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "academic_year_id" in data and data["academic_year_id"] is not None:
            new_year_id = int(data["academic_year_id"])
            if not self.repo.years.get(new_year_id, company_id=company_id):
                return False, ERR_ACADEMIC_YEAR_NOT_FOUND, None
            patch["academic_year_id"] = new_year_id

        if "number" in data and data["number"] is not None:
            number = int(data["number"])
            if number < 1:
                return False, "Semester number must be at least 1", None
            check_year_id = int(patch.get("academic_year_id") or obj.academic_year_id)
            if self.repo.semester_number_exists(company_id=company_id, academic_year_id=check_year_id, number=number, exclude_id=obj.id):
                return False, ERR_SEMESTER_EXISTS_NUMBER, None
            patch["number"] = number

        if "name" in data:
            name = (data.get("name") or "").strip() or None
            if name and self.repo.semester_name_exists(company_id=company_id, name=name, exclude_id=obj.id):
                return False, ERR_SEMESTER_EXISTS_NAME, None
            patch["name"] = name

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        return self.semester_svc.update(company_id=company_id, id=semester_id, data=patch)

    def delete_semester(self, *, company_id: int, semester_id: int, soft: bool = True):
        obj = self.repo.semesters.get(semester_id, company_id=company_id)
        if not obj:
            return False, ERR_SEMESTER_NOT_FOUND, None
        linked = self.repo.semesters_with_courses([obj.id])
        if obj.id in linked:
            return False, cannot_delete_linked("Semester", "Courses"), None
        return self.semester_svc.delete(company_id=company_id, id=semester_id, soft=soft)

    def bulk_delete_semesters(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.semesters_with_courses(ids)
        return self._bulk_delete_with_link_guard(
            company_id=company_id,
            ids=ids,
            model=Semester,
            base_svc=self.semester_svc,
            linked_ids=linked,
            not_found_msg=ERR_SEMESTER_NOT_FOUND,
            linked_msg=cannot_delete_linked("Semester", "Courses"),
            soft=soft,
        )


    def get_semester(self, *, company_id: int, semester_id: int) -> Optional[Dict[str, Any]]:
        rec = self.semester_svc.get_one(company_id=company_id, id=semester_id, eager_load=["academic_year"])
        if rec:
            rec["name"] = (rec.get("name") or f"Semester {rec.get('number')}")
            if isinstance(rec.get("academic_year"), dict):
                rec["academic_year_name"] = rec["academic_year"].get("name")
        return rec

    # ----- Course -----
    def create_course(self, *, company_id: int, data: Dict[str, Any]):
        department_id = int(data.get("department_id") or 0)
        if not self.repo.departments.get(department_id, company_id=company_id):
            return False, ERR_DEPARTMENT_NOT_FOUND, None

        semester_id = int(data.get("semester_id") or 0)
        if not self.repo.semesters.get(semester_id, company_id=company_id):
            return False, ERR_SEMESTER_NOT_FOUND, None

        title = require_text(data.get("title"), field_label="Course title")
        code = normalize_code(data.get("code"))
        description = _safe_desc(data.get("description"))

        if self.repo.course_title_exists(company_id=company_id, department_id=department_id, semester_id=semester_id, title=title):
            return False, ERR_COURSE_EXISTS_TITLE_IN_SCOPE, None
        if code and self.repo.course_code_exists(company_id=company_id, code=code):
            return False, ERR_COURSE_CODE_EXISTS, None

        return self.course_svc.create(
            company_id=company_id,
            data={"department_id": department_id, "semester_id": semester_id, "title": title, "code": code, "description": description, "is_enabled": True},
        )

    def update_course(self, *, company_id: int, course_id: int, data: Dict[str, Any]):
        obj = self.repo.courses.get(course_id, company_id=company_id)
        if not obj:
            return False, ERR_COURSE_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "department_id" in data and data["department_id"] is not None:
            new_department_id = int(data["department_id"])
            if not self.repo.departments.get(new_department_id, company_id=company_id):
                return False, ERR_DEPARTMENT_NOT_FOUND, None
            patch["department_id"] = new_department_id

        if "semester_id" in data and data["semester_id"] is not None:
            new_semester_id = int(data["semester_id"])
            if not self.repo.semesters.get(new_semester_id, company_id=company_id):
                return False, ERR_SEMESTER_NOT_FOUND, None
            patch["semester_id"] = new_semester_id

        if "title" in data and data["title"] is not None:
            title = require_text(data.get("title"), field_label="Course title")
            check_dept = int(patch.get("department_id") or obj.department_id)
            check_sem = int(patch.get("semester_id") or obj.semester_id)
            if self.repo.course_title_exists(company_id=company_id, department_id=check_dept, semester_id=check_sem, title=title, exclude_id=obj.id):
                return False, ERR_COURSE_EXISTS_TITLE_IN_SCOPE, None
            patch["title"] = title

        if "code" in data:
            code = normalize_code(data.get("code"))
            if code and self.repo.course_code_exists(company_id=company_id, code=code, exclude_id=obj.id):
                return False, ERR_COURSE_CODE_EXISTS, None
            patch["code"] = code

        if "description" in data:
            patch["description"] = _safe_desc(data.get("description"))

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        return self.course_svc.update(company_id=company_id, id=course_id, data=patch)

    def delete_course(self, *, company_id: int, course_id: int, soft: bool = True):
        obj = self.repo.courses.get(course_id, company_id=company_id)
        if not obj:
            return False, ERR_COURSE_NOT_FOUND, None
        linked = self.repo.courses_with_chapters([obj.id])
        if obj.id in linked:
            return False, cannot_delete_linked("Course", "Chapters"), None
        return self.course_svc.delete(company_id=company_id, id=course_id, soft=soft)

    def bulk_delete_courses(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.courses_with_chapters(ids)
        return self._bulk_delete_with_link_guard(
            company_id=company_id,
            ids=ids,
            model=Course,
            base_svc=self.course_svc,
            linked_ids=linked,
            not_found_msg=ERR_COURSE_NOT_FOUND,
            linked_msg=cannot_delete_linked("Course", "Chapters"),
            soft=soft,
        )


    def get_course(self, *, company_id: int, course_id: int) -> Optional[Dict[str, Any]]:
        rec = self.course_svc.get_one(company_id=company_id, id=course_id, eager_load=["department", "semester", "chapters"])
        if not rec:
            return None
        if isinstance(rec.get("department"), dict):
            rec["department_name"] = rec["department"].get("name")
        if isinstance(rec.get("semester"), dict):
            sem = rec["semester"]
            rec["semester_name"] = (sem.get("name") or f"Semester {sem.get('number')}")
        if isinstance(rec.get("chapters"), list):
            rec["chapters"] = sorted(rec["chapters"], key=lambda x: int(x.get("number") or 0))
        return rec


    # =========================================================
    # COURSE: DETAIL
    # =========================================================
    def get_course_detail(
        self,
        *,
        company_id: int,
        course_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        row = self.repo.get_course_detail(
            company_id=company_id,
            course_id=course_id,
        )

        if not row:
            raise NotFoundError("Course not found")

        chapters_preview = self.repo.course_chapters_preview(
            company_id=company_id,
            course_id=course_id,
            limit=5,
        )

        data = self.repo.shape_course_detail_row(
            row,
            chapters_preview=chapters_preview,
        )

        return True, "OK", data

    # ----- Chapter -----
    def create_chapter(self, *, company_id: int, data: Dict[str, Any]):
        course_id = int(data.get("course_id") or 0)
        if not self.repo.courses.get(course_id, company_id=company_id):
            return False, ERR_COURSE_NOT_FOUND, None

        number = int(data.get("number") or 0)
        if number < 1:
            return False, "Chapter number must be at least 1", None

        title = require_text(data.get("title"), field_label="Chapter title")
        description = _safe_desc(data.get("description"))

        if self.repo.chapter_title_exists(company_id=company_id, course_id=course_id, title=title):
            return False, ERR_CHAPTER_EXISTS_TITLE, None
        if self.repo.chapter_number_exists(company_id=company_id, course_id=course_id, number=number):
            return False, ERR_CHAPTER_EXISTS_NUMBER, None

        return self.chapter_svc.create(
            company_id=company_id,
            data={"course_id": course_id, "number": number, "title": title, "description": description, "is_enabled": True},
        )

    def update_chapter(self, *, company_id: int, chapter_id: int, data: Dict[str, Any]):
        obj = self.repo.chapters.get(chapter_id, company_id=company_id)
        if not obj:
            return False, ERR_CHAPTER_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "course_id" in data and data["course_id"] is not None:
            new_course_id = int(data["course_id"])
            if not self.repo.courses.get(new_course_id, company_id=company_id):
                return False, ERR_COURSE_NOT_FOUND, None
            patch["course_id"] = new_course_id

        if "number" in data and data["number"] is not None:
            number = int(data["number"])
            if number < 1:
                return False, "Chapter number must be at least 1", None
            check_course = int(patch.get("course_id") or obj.course_id)
            if self.repo.chapter_number_exists(company_id=company_id, course_id=check_course, number=number, exclude_id=obj.id):
                return False, ERR_CHAPTER_EXISTS_NUMBER, None
            patch["number"] = number

        if "title" in data and data["title"] is not None:
            title = require_text(data.get("title"), field_label="Chapter title")
            check_course = int(patch.get("course_id") or obj.course_id)
            if self.repo.chapter_title_exists(company_id=company_id, course_id=check_course, title=title, exclude_id=obj.id):
                return False, ERR_CHAPTER_EXISTS_TITLE, None
            patch["title"] = title

        if "description" in data:
            patch["description"] = _safe_desc(data.get("description"))

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        return self.chapter_svc.update(company_id=company_id, id=chapter_id, data=patch)

    def delete_chapter(self, *, company_id: int, chapter_id: int, soft: bool = True):
        obj = self.repo.chapters.get(chapter_id, company_id=company_id)
        if not obj:
            return False, ERR_CHAPTER_NOT_FOUND, None
        return self.chapter_svc.delete(company_id=company_id, id=chapter_id, soft=soft)

    def bulk_delete_chapters(self, *, company_id: int, ids: List[int], soft: bool = True):
        return self.chapter_svc.bulk_delete(company_id=company_id, ids=ids, soft=soft)


    def get_chapter(self, *, company_id: int, chapter_id: int) -> Optional[Dict[str, Any]]:
        rec = self.chapter_svc.get_one(company_id=company_id, id=chapter_id, eager_load=["course"])
        if rec and isinstance(rec.get("course"), dict):
            rec["course_title"] = rec["course"].get("title")
        return rec
    # ---------- Dropdowns ----------
    def dropdown_faculties(
        self,
        *,
        company_id: int,
        search: str | None,
        limit: int,
        offset: int,
        active_only: bool,
        filters: dict | None,
    ):
        allowed_filters = {"is_enabled": Faculty.is_enabled, "name": Faculty.name, "code": Faculty.code}
        sort_fields = {"id": Faculty.id, "name": Faculty.name, "code": Faculty.code, "created_at": getattr(Faculty, "created_at", Faculty.id)}

        return self.faculty_svc.dropdown(
            company_id=company_id,
            search=search,
            limit=limit,
            offset=offset,
            active_only=active_only,
            search_columns=[Faculty.name, Faculty.code],
            filters=filters,
            allowed_filters=allowed_filters,
            sort_fields=sort_fields,
            default_sort=[Faculty.name.asc()],
            value_field="id",
            label_fields=["code", "name"],
            meta_fields=["code", "is_enabled"],
            strict_label=True,   # <- module controls behavior
        )

    def dropdown_semesters(
        self,
        *,
        company_id: int,
        search: str | None,
        limit: int,
        offset: int,
        active_only: bool,
        filters: dict | None,
    ):
        allowed_filters = {
            "is_enabled": Semester.is_enabled,
            "academic_year_id": Semester.academic_year_id,
            "number": Semester.number,
            "name": Semester.name,
        }
        sort_fields = {"id": Semester.id, "number": Semester.number, "created_at": getattr(Semester, "created_at", Semester.id)}

        def sem_label(s: Semester) -> str:
            nm = (getattr(s, "name", None) or "").strip()
            return nm or f"Semester {int(getattr(s, 'number', 0) or 0)}"

        return self.semester_svc.dropdown(
            company_id=company_id,
            search=search,
            limit=limit,
            offset=offset,
            active_only=active_only,
            search_columns=[Semester.name],
            filters=filters,
            allowed_filters=allowed_filters,
            sort_fields=sort_fields,
            default_sort=[Semester.number.asc()],
            value_field="id",
            label_getter=sem_label,
            meta_fields=["academic_year_id", "number", "name", "is_enabled"],
            strict_label=True,
        )

    def dropdown_departments(
            self,
            *,
            company_id: int,
            faculty_id: int | None,  # ✅ dependent filter
            search: str | None,
            limit: int,
            offset: int,
            active_only: bool,
            filters: dict | None,
    ):
        allowed_filters = {
            "is_enabled": Department.is_enabled,
            "name": Department.name,
            "code": Department.code,
            "faculty_id": Department.faculty_id,  # optional (but we already accept faculty_id param)
        }

        sort_fields = {
            "id": Department.id,
            "name": Department.name,
            "code": Department.code,
            "created_at": getattr(Department, "created_at", Department.id),
        }

        # ✅ enforce faculty_id when provided (strong, explicit)
        extra_where = []
        if faculty_id is not None:
            extra_where.append(Department.faculty_id == int(faculty_id))

        # ---------------- caching ----------------
        params = {
            "search": search,
            "limit": int(limit),
            "offset": int(offset),
            "active_only": bool(active_only),
            "filters": filters or {},
            "faculty_id": int(faculty_id) if faculty_id is not None else None,
        }

        def builder():
            return self.department_svc.dropdown(
                company_id=company_id,
                search=search,
                limit=limit,
                offset=offset,
                active_only=active_only,
                search_columns=[Department.name, Department.code],
                filters=filters,
                allowed_filters=allowed_filters,
                sort_fields=sort_fields,
                default_sort=[Department.name.asc()],
                value_field="id",
                label_fields=["code", "name"],
                meta_fields=["faculty_id", "code", "is_enabled"],
                strict_label=True,
                # ✅ use your NEW HOOK
                extra_where=extra_where,
            )

        return cached_dropdown(
            name="departments",
            company_id=company_id,
            params=params,
            ttl=600,
            builder=builder,
        )
    def dropdown_faculties_with_departments(
            self,
            *,
            company_id: int,
            search: str | None,
            limit: int,
            offset: int,
            active_only: bool,
            filters: dict | None,
    ):
        allowed_filters = {"is_enabled": Faculty.is_enabled, "name": Faculty.name, "code": Faculty.code}
        sort_fields = {"id": Faculty.id, "name": Faculty.name, "code": Faculty.code}

        # condition: faculty has at least one department (optionally enabled only)
        dept_exists = exists(
            select(1).where(
                Department.faculty_id == Faculty.id,
                Department.company_id == Faculty.company_id,  # tenant-safe
                Department.is_enabled.is_(True),  # optional
            )
        )

        return self.faculty_svc.dropdown(
            company_id=company_id,
            search=search,
            limit=limit,
            offset=offset,
            active_only=active_only,
            search_columns=[Faculty.name, Faculty.code],
            filters=filters,
            allowed_filters=allowed_filters,
            sort_fields=sort_fields,
            default_sort=[Faculty.name.asc()],
            value_field="id",
            label_fields=["code", "name"],
            meta_fields=["code", "is_enabled"],
            strict_label=True,
            # ---- NEW HOOK ----
            extra_where=[dept_exists],
        )

    def list_faculties_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            cursor: Optional[str],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        limit = max(1, min(int(limit or 20), 100))

        cur = _decode_cursor(cursor or "")
        last_id = cur.get("last_id")
        try:
            last_id = int(last_id) if last_id is not None else None
        except Exception:
            last_id = None

        user_id = getattr(getattr(g, "auth", None), "user_id", None)

        params = {
            "mode": "cursor",
            "limit": limit,
            "last_id": last_id,
            "filters": filters,
            "is_enabled": is_enabled,
            "user_id": int(user_id) if user_id is not None else None,
        }

        def builder():
            rows, total_count, has_more = self.repo.list_faculties_cursor(
                company_id=company_id,
                limit=limit,
                last_id=last_id,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_faculty_list_row(r) for r in rows]

            next_cursor = None
            if has_more and rows:
                next_cursor = _encode_cursor({"last_id": int(rows[-1].id)})

            return {
                "data": data,
                "pagination": {
                    "limit": limit,
                    "next_cursor": next_cursor,
                    "has_more": bool(has_more),
                },
                "meta": {"total_count": int(total_count)},
            }

        out = cached_list(
            entity="faculties:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

    def list_faculties_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20
        page = max(int(page or 1), 1)

        user_id = getattr(getattr(g, "auth", None), "user_id", None)

        params = {
            "mode": "page",
            "page": page,
            "per_page": per_page,
            "filters": filters,
            "is_enabled": is_enabled,
            "user_id": int(user_id) if user_id is not None else None,
        }

        def builder():
            rows, total_count, pages = self.repo.list_faculties_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_faculty_list_row(r) for r in rows]

            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "pages": int(pages),
                    "total_count": int(total_count),
                },
            }

        out = cached_list(
            entity="faculties:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

    # =========================================================
    # FACULTY: DETAIL
    # =========================================================
    def get_faculty_detail(
        self,
        *,
        company_id: int,
        faculty_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        row = self.repo.get_faculty_detail(
            company_id=company_id,
            faculty_id=faculty_id,
        )

        if not row:
            raise NotFoundError("Faculty not found")

        departments_preview = self.repo.faculty_departments_preview(
            company_id=company_id,
            faculty_id=faculty_id,
            limit=5,
        )

        data = self.repo.shape_faculty_detail_row(
            row,
            departments_preview=departments_preview,
        )
        return True, "OK", data


    def list_departments_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            cursor: Optional[str],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        limit = max(1, min(int(limit or 20), 100))

        cur = _decode_cursor(cursor or "")
        last_id = cur.get("last_id")
        try:
            last_id = int(last_id) if last_id is not None else None
        except Exception:
            last_id = None

        user_id = getattr(getattr(g, "auth", None), "user_id", None)

        params = {
            "mode": "cursor",
            "limit": limit,
            "last_id": last_id,
            "filters": filters,
            "is_enabled": is_enabled,
            "user_id": int(user_id) if user_id is not None else None,
        }

        def builder():
            rows, total_count, has_more = self.repo.list_departments_cursor(
                company_id=company_id,
                limit=limit,
                last_id=last_id,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_department_list_row(r) for r in rows]

            next_cursor = None
            if has_more and rows:
                next_cursor = _encode_cursor({"last_id": int(rows[-1].id)})

            return {
                "data": data,
                "pagination": {
                    "limit": limit,
                    "next_cursor": next_cursor,
                    "has_more": bool(has_more),
                },
                "meta": {"total_count": int(total_count)},
            }

        out = cached_list(
            entity="departments:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

    # =========================================================
    # DEPARTMENT: LIST page (Service)
    # =========================================================
    def list_departments_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20
        page = max(int(page or 1), 1)

        user_id = getattr(getattr(g, "auth", None), "user_id", None)

        params = {
            "mode": "page",
            "page": page,
            "per_page": per_page,
            "filters": filters,
            "is_enabled": is_enabled,
            "user_id": int(user_id) if user_id is not None else None,
        }

        def builder():
            rows, total_count, pages = self.repo.list_departments_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_department_list_row(r) for r in rows]

            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "pages": int(pages),
                    "total_count": int(total_count),
                },
            }

        out = cached_list(
            entity="departments:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out


    # =========================================================
    # DEPARTMENT: DETAIL
    # =========================================================
    def get_department_detail(
        self,
        *,
        company_id: int,
        department_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        row = self.repo.get_department_detail(
            company_id=company_id,
            department_id=department_id,
        )

        if not row:
            raise NotFoundError("Department not found")

        courses_preview = self.repo.department_courses_preview(
            company_id=company_id,
            department_id=department_id,
            limit=5,
        )

        data = self.repo.shape_department_detail_row(
            row,
            courses_preview=courses_preview,
        )

        return True, "OK", data




    def list_courses_cursor(
        self,
        *,
        company_id: int,
        limit: int,
        cursor: Optional[str],
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        limit = max(1, min(int(limit or 20), 100))

        cur = _decode_cursor(cursor or "")
        last_id = cur.get("last_id")
        try:
            last_id = int(last_id) if last_id is not None else None
        except Exception:
            last_id = None

        params = {
            "mode": "cursor",
            "limit": limit,
            "last_id": last_id,
            "filters": filters,
            "is_enabled": is_enabled,
        }

        def builder():
            rows, total_count, has_more = self.repo.list_courses_cursor(
                company_id=company_id,
                limit=limit,
                last_id=last_id,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_course_list_row(r) for r in rows]

            next_cursor = None
            if has_more and rows:
                next_cursor = _encode_cursor({"last_id": int(rows[-1].id)})

            return {
                "data": data,
                "pagination": {
                    "limit": limit,
                    "next_cursor": next_cursor,
                    "has_more": bool(has_more),
                },
                "meta": {"total_count": int(total_count)},
            }

        out = cached_list(
            entity="courses:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out



    def list_courses_page(
        self,
        *,
        company_id: int,
        page: int,
        per_page: int,
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20
        page = max(int(page or 1), 1)

        params = {
            "mode": "page",
            "page": page,
            "per_page": per_page,
            "filters": filters,
            "is_enabled": is_enabled,
        }

        def builder():
            rows, total_count, pages = self.repo.list_courses_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_course_list_row(r) for r in rows]

            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "pages": int(pages),
                    "total_count": int(total_count),
                },
            }

        out = cached_list(
            entity="courses:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        def list_chapters_cursor(
                self,
                *,
                company_id: int,
                limit: int,
                cursor: Optional[str],
                filters: Dict[str, Any],
                is_enabled: Optional[bool],
        ) -> Tuple[bool, str, Dict[str, Any]]:
            limit = max(1, min(int(limit or 20), 100))

            cur = _decode_cursor(cursor or "")
            last_no = cur.get("last_no")
            try:
                last_no = int(last_no) if last_no is not None else None
            except Exception:
                last_no = None

            params = {
                "mode": "cursor",
                "limit": limit,
                "last_no": last_no,
                "filters": filters,
                "is_enabled": is_enabled,
            }

            def builder():
                rows, total_count, has_more = self.repo.list_chapters_cursor(
                    company_id=company_id,
                    limit=limit,
                    last_no=last_no,
                    filters=filters,
                    is_enabled=is_enabled,
                )

                data = [self.repo.shape_chapter_list_row(r) for r in rows]

                next_cursor = None
                if has_more and rows:
                    next_cursor = _encode_cursor({"last_no": int(rows[-1].number)})

                return {
                    "data": data,
                    "pagination": {
                        "limit": limit,
                        "next_cursor": next_cursor,
                        "has_more": bool(has_more),
                    },
                    "meta": {"total_count": int(total_count)},
                }

            out = cached_list(
                entity="chapters:list",
                company_id=company_id,
                params=params,
                scope="default",
                ttl=20,
                builder=builder,
            )

            return True, "OK", out

        def list_chapters_page(
                self,
                *,
                company_id: int,
                page: int,
                per_page: int,
                filters: Dict[str, Any],
                is_enabled: Optional[bool],
        ) -> Tuple[bool, str, Dict[str, Any]]:
            allowed = {10, 20, 50, 500}
            per_page = per_page if int(per_page or 20) in allowed else 20
            page = max(int(page or 1), 1)

            params = {
                "mode": "page",
                "page": page,
                "per_page": per_page,
                "filters": filters,
                "is_enabled": is_enabled,
            }

            def builder():
                rows, total_count, pages = self.repo.list_chapters_page(
                    company_id=company_id,
                    page=page,
                    per_page=per_page,
                    filters=filters,
                    is_enabled=is_enabled,
                )

                data = [self.repo.shape_chapter_list_row(r) for r in rows]

                return {
                    "data": data,
                    "pagination": {
                        "page": page,
                        "per_page": per_page,
                        "pages": int(pages),
                        "total_count": int(total_count),
                    },
                }

            out = cached_list(
                entity="chapters:list",
                company_id=company_id,
                params=params,
                scope="default",
                ttl=20,
                builder=builder,
            )

            return True, "OK", out

        return True, "OK", out



    def list_chapters_cursor(
        self,
        *,
        company_id: int,
        limit: int,
        cursor: Optional[str],
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        limit = max(1, min(int(limit or 20), 100))

        cur = _decode_cursor(cursor or "")
        last_no = cur.get("last_no")
        try:
            last_no = int(last_no) if last_no is not None else None
        except Exception:
            last_no = None

        params = {
            "mode": "cursor",
            "limit": limit,
            "last_no": last_no,
            "filters": filters,
            "is_enabled": is_enabled,
        }

        def builder():
            rows, total_count, has_more = self.repo.list_chapters_cursor(
                company_id=company_id,
                limit=limit,
                last_no=last_no,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_chapter_list_row(r) for r in rows]

            next_cursor = None
            if has_more and rows:
                next_cursor = _encode_cursor({"last_no": int(rows[-1].number)})

            return {
                "data": data,
                "pagination": {
                    "limit": limit,
                    "next_cursor": next_cursor,
                    "has_more": bool(has_more),
                },
                "meta": {"total_count": int(total_count)},
            }

        out = cached_list(
            entity="chapters:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out


    def list_chapters_page(
        self,
        *,
        company_id: int,
        page: int,
        per_page: int,
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20
        page = max(int(page or 1), 1)

        params = {
            "mode": "page",
            "page": page,
            "per_page": per_page,
            "filters": filters,
            "is_enabled": is_enabled,
        }

        def builder():
            rows, total_count, pages = self.repo.list_chapters_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_chapter_list_row(r) for r in rows]

            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "pages": int(pages),
                    "total_count": int(total_count),
                },
            }

        out = cached_list(
            entity="chapters:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out



    # =========================================================
    # CHAPTER: DETAIL
    # =========================================================
    def get_chapter_detail(
        self,
        *,
        company_id: int,
        chapter_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        row = self.repo.get_chapter_detail(
            company_id=company_id,
            chapter_id=chapter_id,
        )

        if not row:
            raise NotFoundError("Chapter not found")

        data = self.repo.shape_chapter_detail_row(row)
        return True, "OK", data




