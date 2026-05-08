# src/cmcp/modules/academic/service.py
from __future__ import annotations

from typing import Any, Dict, Optional, Tuple, List, Set

from flask import g
from sqlalchemy import exists, select

from cmcp.common.cache import cached_dropdown, cached_list, cached_detail
from cmcp.core.base_service import BaseService
from cmcp.core.exceptions import NotFoundError
from cmcp.modules.academic.academic_repo import AcademicRepo
from cmcp.modules.academic.models import (
    Faculty, Department, AcademicYear, Semester,
    Course, CourseOffering, CourseChapter
)
from cmcp.modules.academic.validation import (
    cannot_delete_linked,
    require_text,
    normalize_code,
    ERR_FACULTY_NOT_FOUND,
    ERR_DEPARTMENT_NOT_FOUND,
    ERR_ACADEMIC_YEAR_NOT_FOUND,
    ERR_SEMESTER_NOT_FOUND,
    ERR_COURSE_NOT_FOUND,
    ERR_COURSE_OFFERING_NOT_FOUND,
    ERR_CHAPTER_NOT_FOUND,
    ERR_FACULTY_EXISTS,
    ERR_FACULTY_CODE_EXISTS,
    ERR_DEPARTMENT_EXISTS_IN_FACULTY,
    ERR_DEPARTMENT_CODE_EXISTS,
    ERR_ACADEMIC_YEAR_EXISTS,
    ERR_SEMESTER_EXISTS_NAME,
    ERR_SEMESTER_EXISTS_NUMBER,
    ERR_COURSE_EXISTS_TITLE,
    ERR_COURSE_CODE_EXISTS,
    ERR_COURSE_OFFERING_EXISTS_IN_SCOPE,
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
        self.course_offering_svc = BaseService(CourseOffering, session=self.s)
        self.chapter_svc = BaseService(CourseChapter, session=self.s)

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
            self.faculty_svc.update(
                company_id=company_id,
                id=obj.id,
                data={"is_enabled": False}
            )
            return True, "Faculty archived because it has linked departments.", {"id": obj.id}

        return self.faculty_svc.delete(company_id=company_id, id=faculty_id, soft=False)

    def bulk_delete_faculties(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.faculties_with_departments(ids)

        deleted = []
        failed = []

        for _id in ids:
            obj = self.repo.faculties.get(_id, company_id=company_id)

            if not obj:
                failed.append({"id": _id, "error": ERR_FACULTY_NOT_FOUND})
                continue

            if _id in linked:
                self.faculty_svc.update(
                    company_id=company_id,
                    id=_id,
                    data={"is_enabled": False}
                )
                deleted.append(_id)
            else:
                self.faculty_svc.delete(
                    company_id=company_id,
                    id=_id,
                    soft=False
                )
                deleted.append(_id)

        return True, "Bulk delete processed.", {"deleted": deleted, "failed": failed}

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

        linked = self.repo.departments_with_course_offerings([obj.id])

        if obj.id in linked:
            self.department_svc.update(
                company_id=company_id,
                id=obj.id,
                data={"is_enabled": False}
            )
            return True, "Department archived because it has linked course offerings.", {"id": obj.id}

        return self.department_svc.delete(company_id=company_id, id=department_id, soft=False)

    def bulk_delete_departments(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.departments_with_course_offerings(ids)

        deleted = []
        failed = []

        for _id in ids:
            obj = self.repo.departments.get(_id, company_id=company_id)

            if not obj:
                failed.append({"id": _id, "error": ERR_DEPARTMENT_NOT_FOUND})
                continue

            if _id in linked:
                self.department_svc.update(
                    company_id=company_id,
                    id=_id,
                    data={"is_enabled": False}
                )
                deleted.append(_id)
            else:
                self.department_svc.delete(
                    company_id=company_id,
                    id=_id,
                    soft=False
                )
                deleted.append(_id)

        return True, "Bulk delete processed.", {"deleted": deleted, "failed": failed}

    # =========================================================
    # ACADEMIC YEAR
    # =========================================================
    def create_academic_year(self, *, company_id: int, data: Dict[str, Any]):
        name = require_text(data.get("name"), field_label="Academic year name")
        if self.repo.academic_year_name_exists(company_id=company_id, name=name):
            return False, ERR_ACADEMIC_YEAR_EXISTS, None
        return self.year_svc.create(company_id=company_id, data={"name": name, "is_enabled": True})

    def update_academic_year(self, *, company_id: int, year_id: int, data: Dict[str, Any]):
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

    def delete_academic_year(self, *, company_id: int, year_id: int, soft: bool = True):
        obj = self.repo.years.get(year_id, company_id=company_id)
        if not obj:
            return False, ERR_ACADEMIC_YEAR_NOT_FOUND, None
        linked = self.repo.years_with_semesters([obj.id])
        if obj.id in linked:
            return False, cannot_delete_linked("Academic year", "Semesters"), None
        return self.year_svc.delete(company_id=company_id, id=year_id, soft=soft)

    def bulk_delete_academic_years(self, *, company_id: int, ids: List[int], soft: bool = True):
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

    def get_academic_year_detail(
            self,
            *,
            company_id: int,
            academic_year_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            row = self.repo.get_academic_year_detail(
                company_id=company_id,
                academic_year_id=academic_year_id,
            )
            if not row:
                return None

            semesters_preview = self.repo.academic_year_semesters_preview(
                company_id=company_id,
                academic_year_id=academic_year_id,
                limit=5,
            )

            return self.repo.shape_academic_year_detail_row(
                row,
                semesters_preview=semesters_preview,
            )

        data = cached_detail(
            entity="academic_years:detail",
            company_id=company_id,
            record_id=academic_year_id,
            ttl=30,
            builder=builder,
        )

        if data is None:
            return False, "Academic year not found.", {}

        return True, "OK", {"data": data}

    # =========================================================
    # SEMESTER
    # =========================================================
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

        linked = self.repo.semesters_with_offerings([obj.id])

        if obj.id in linked:
            self.semester_svc.update(
                company_id=company_id,
                id=obj.id,
                data={"is_enabled": False}
            )
            return True, "Semester archived because it has linked course offerings.", {"id": obj.id}

        return self.semester_svc.delete(company_id=company_id, id=semester_id, soft=False)

    def bulk_delete_semesters(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.semesters_with_offerings(ids)

        deleted = []
        failed = []

        for _id in ids:
            obj = self.repo.semesters.get(_id, company_id=company_id)

            if not obj:
                failed.append({"id": _id, "error": ERR_SEMESTER_NOT_FOUND})
                continue

            if _id in linked:
                self.semester_svc.update(
                    company_id=company_id,
                    id=_id,
                    data={"is_enabled": False}
                )
                deleted.append(_id)
            else:
                self.semester_svc.delete(
                    company_id=company_id,
                    id=_id,
                    soft=False
                )
                deleted.append(_id)

        return True, "Bulk delete processed.", {"deleted": deleted, "failed": failed}

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
    ) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            row = self.repo.get_semester_detail(
                company_id=company_id,
                semester_id=semester_id,
            )
            if not row:
                return None

            offerings_preview = self.repo.semester_offerings_preview(
                company_id=company_id,
                semester_id=semester_id,
                limit=5,
            )

            return self.repo.shape_semester_detail_row(
                row,
                offerings_preview=offerings_preview,
            )

        data = cached_detail(
            entity="semesters:detail",
            company_id=company_id,
            record_id=semester_id,
            ttl=30,
            builder=builder,
        )

        if data is None:
            return False, "Semester not found.", {}

        return True, "OK", {"data": data}

    # =========================================================
    # COURSE (Base Course Definition)
    # =========================================================
    def create_course(self, *, company_id: int, data: Dict[str, Any]):
        title = require_text(data.get("title"), field_label="Course title")
        code = normalize_code(data.get("code"))
        description = _safe_desc(data.get("description"))

        if self.repo.course_title_exists(company_id=company_id, title=title):
            return False, ERR_COURSE_EXISTS_TITLE, None
        if code and self.repo.course_code_exists(company_id=company_id, code=code):
            return False, ERR_COURSE_CODE_EXISTS, None

        return self.course_svc.create(
            company_id=company_id,
            data={"title": title, "code": code, "description": description, "is_enabled": True},
        )

    def update_course(self, *, company_id: int, course_id: int, data: Dict[str, Any]):
        obj = self.repo.courses.get(course_id, company_id=company_id)
        if not obj:
            return False, ERR_COURSE_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "title" in data and data["title"] is not None:
            title = require_text(data.get("title"), field_label="Course title")
            if self.repo.course_title_exists(company_id=company_id, title=title, exclude_id=obj.id):
                return False, ERR_COURSE_EXISTS_TITLE, None
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

        linked = self.repo.courses_with_offerings([obj.id])

        if obj.id in linked:
            self.course_svc.update(
                company_id=company_id,
                id=obj.id,
                data={"is_enabled": False}
            )
            return True, "Course archived because it has linked offerings.", {"id": obj.id}

        return self.course_svc.delete(company_id=company_id, id=course_id, soft=False)

    def bulk_delete_courses(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.courses_with_offerings(ids)

        deleted = []
        failed = []

        for _id in ids:
            obj = self.repo.courses.get(_id, company_id=company_id)

            if not obj:
                failed.append({"id": _id, "error": ERR_COURSE_NOT_FOUND})
                continue

            if _id in linked:
                self.course_svc.update(
                    company_id=company_id,
                    id=_id,
                    data={"is_enabled": False}
                )
                deleted.append(_id)
            else:
                self.course_svc.delete(
                    company_id=company_id,
                    id=_id,
                    soft=False
                )
                deleted.append(_id)

        return True, "Bulk delete processed.", {"deleted": deleted, "failed": failed}

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
        return True, "OK", out

    def get_course_detail(
            self,
            *,
            company_id: int,
            course_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            row = self.repo.get_course_detail(
                company_id=company_id,
                course_id=course_id,
            )
            if not row:
                return None

            offerings = self.repo.course_offerings_list(
                company_id=company_id,
                course_id=course_id,
            )

            return self.repo.shape_course_detail_row(
                row,
                offerings=offerings,
            )

        data = cached_detail(
            entity="courses:detail",
            company_id=company_id,
            record_id=course_id,
            ttl=30,
            builder=builder,
        )

        if data is None:
            return False, "Course not found.", {}

        return True, "OK", {"data": data}

    # =========================================================
    # COURSE OFFERING (NEW)
    # =========================================================
    def create_course_offering(self, *, company_id: int, data: Dict[str, Any]):
        course_id = int(data.get("course_id") or 0)
        if not self.repo.courses.get(course_id, company_id=company_id):
            return False, ERR_COURSE_NOT_FOUND, None

        department_id = int(data.get("department_id") or 0)
        if not self.repo.departments.get(department_id, company_id=company_id):
            return False, ERR_DEPARTMENT_NOT_FOUND, None

        semester_id = int(data.get("semester_id") or 0)
        if not self.repo.semesters.get(semester_id, company_id=company_id):
            return False, ERR_SEMESTER_NOT_FOUND, None

        custom_title = (data.get("custom_title") or "").strip() or None
        credit_hours = data.get("credit_hours")
        if credit_hours is not None:
            credit_hours = int(credit_hours)
            if credit_hours < 0 or credit_hours > 30:
                return False, "Credit hours must be between 0 and 30", None

        if self.repo.course_offering_exists_in_scope(
            company_id=company_id,
            course_id=course_id,
            department_id=department_id,
            semester_id=semester_id
        ):
            return False, ERR_COURSE_OFFERING_EXISTS_IN_SCOPE, None

        return self.course_offering_svc.create(
            company_id=company_id,
            data={
                "course_id": course_id,
                "department_id": department_id,
                "semester_id": semester_id,
                "custom_title": custom_title,
                "credit_hours": credit_hours,
                "is_enabled": True
            },
        )

    def update_course_offering(self, *, company_id: int, offering_id: int, data: Dict[str, Any]):
        obj = self.repo.course_offerings.get(offering_id, company_id=company_id)
        if not obj:
            return False, ERR_COURSE_OFFERING_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "course_id" in data and data["course_id"] is not None:
            new_course_id = int(data["course_id"])
            if not self.repo.courses.get(new_course_id, company_id=company_id):
                return False, ERR_COURSE_NOT_FOUND, None
            patch["course_id"] = new_course_id

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

        if "custom_title" in data:
            patch["custom_title"] = (data.get("custom_title") or "").strip() or None

        if "credit_hours" in data:
            credit_hours = data.get("credit_hours")
            if credit_hours is not None:
                credit_hours = int(credit_hours)
                if credit_hours < 0 or credit_hours > 30:
                    return False, "Credit hours must be between 0 and 30", None
            patch["credit_hours"] = credit_hours

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        # Check uniqueness if scope changed
        check_course = int(patch.get("course_id") or obj.course_id)
        check_dept = int(patch.get("department_id") or obj.department_id)
        check_sem = int(patch.get("semester_id") or obj.semester_id)

        if (patch.get("course_id") or patch.get("department_id") or patch.get("semester_id")):
            if self.repo.course_offering_exists_in_scope(
                company_id=company_id,
                course_id=check_course,
                department_id=check_dept,
                semester_id=check_sem,
                exclude_id=obj.id
            ):
                return False, ERR_COURSE_OFFERING_EXISTS_IN_SCOPE, None

        return self.course_offering_svc.update(company_id=company_id, id=offering_id, data=patch)

    def delete_course_offering(self, *, company_id: int, offering_id: int, soft: bool = True):
        obj = self.repo.course_offerings.get(offering_id, company_id=company_id)
        if not obj:
            return False, ERR_COURSE_OFFERING_NOT_FOUND, None

        linked = self.repo.offerings_with_chapters([obj.id])

        if obj.id in linked:
            self.course_offering_svc.update(
                company_id=company_id,
                id=obj.id,
                data={"is_enabled": False}
            )
            return True, "Course offering archived because it has linked chapters.", {"id": obj.id}

        return self.course_offering_svc.delete(company_id=company_id, id=offering_id, soft=soft)

    def bulk_delete_course_offerings(self, *, company_id: int, ids: List[int], soft: bool = True):
        linked = self.repo.offerings_with_chapters(ids)

        deleted = []
        failed = []

        for _id in ids:
            obj = self.repo.course_offerings.get(_id, company_id=company_id)

            if not obj:
                failed.append({"id": _id, "error": ERR_COURSE_OFFERING_NOT_FOUND})
                continue

            if _id in linked:
                self.course_offering_svc.update(
                    company_id=company_id,
                    id=_id,
                    data={"is_enabled": False}
                )
                deleted.append(_id)
            else:
                self.course_offering_svc.delete(
                    company_id=company_id,
                    id=_id,
                    soft=False
                )
                deleted.append(_id)

        return True, "Bulk delete processed.", {"deleted": deleted, "failed": failed}

    def list_course_offerings_cursor(
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
            rows, total_count, has_more = self.repo.list_course_offerings_cursor(
                company_id=company_id,
                limit=limit,
                last_id=last_id,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_course_offering_list_row(r) for r in rows]

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
            entity="course_offerings:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

    def list_course_offerings_page(
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
            rows, total_count, pages = self.repo.list_course_offerings_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_course_offering_list_row(r) for r in rows]

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
            entity="course_offerings:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

    def get_course_offering_detail(
            self,
            *,
            company_id: int,
            offering_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            row = self.repo.get_course_offering_detail(
                company_id=company_id,
                offering_id=offering_id,
            )
            if not row:
                return None

            chapters = self.repo.offering_chapters_list(
                company_id=company_id,
                offering_id=offering_id,
            )

            return self.repo.shape_course_offering_detail_row(
                row,
                chapters=chapters,
            )

        data = cached_detail(
            entity="course_offerings:detail",
            company_id=company_id,
            record_id=offering_id,
            ttl=30,
            builder=builder,
        )

        if data is None:
            return False, "Course offering not found.", {}

        return True, "OK", {"data": data}

    # =========================================================
    # COURSE CHAPTER
    # =========================================================
    def create_chapter(self, *, company_id: int, data: Dict[str, Any]):
        course_offering_id = int(data.get("course_offering_id") or 0)
        if not self.repo.course_offerings.get(course_offering_id, company_id=company_id):
            return False, ERR_COURSE_OFFERING_NOT_FOUND, None

        number = int(data.get("number") or 0)
        if number < 1:
            return False, "Chapter number must be at least 1", None

        title = require_text(data.get("title"), field_label="Chapter title")
        description = _safe_desc(data.get("description"))

        if self.repo.chapter_title_exists(company_id=company_id, course_offering_id=course_offering_id, title=title):
            return False, ERR_CHAPTER_EXISTS_TITLE, None
        if self.repo.chapter_number_exists(company_id=company_id, course_offering_id=course_offering_id, number=number):
            return False, ERR_CHAPTER_EXISTS_NUMBER, None

        return self.chapter_svc.create(
            company_id=company_id,
            data={
                "course_offering_id": course_offering_id,
                "number": number,
                "title": title,
                "description": description,
                "is_enabled": True
            },
        )

    def update_chapter(self, *, company_id: int, chapter_id: int, data: Dict[str, Any]):
        obj = self.repo.chapters.get(chapter_id, company_id=company_id)
        if not obj:
            return False, ERR_CHAPTER_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "course_offering_id" in data and data["course_offering_id"] is not None:
            new_offering_id = int(data["course_offering_id"])
            if not self.repo.course_offerings.get(new_offering_id, company_id=company_id):
                return False, ERR_COURSE_OFFERING_NOT_FOUND, None
            patch["course_offering_id"] = new_offering_id

        if "number" in data and data["number"] is not None:
            number = int(data["number"])
            if number < 1:
                return False, "Chapter number must be at least 1", None
            check_offering = int(patch.get("course_offering_id") or obj.course_offering_id)
            if self.repo.chapter_number_exists(company_id=company_id, course_offering_id=check_offering, number=number, exclude_id=obj.id):
                return False, ERR_CHAPTER_EXISTS_NUMBER, None
            patch["number"] = number

        if "title" in data and data["title"] is not None:
            title = require_text(data.get("title"), field_label="Chapter title")
            check_offering = int(patch.get("course_offering_id") or obj.course_offering_id)
            if self.repo.chapter_title_exists(company_id=company_id, course_offering_id=check_offering, title=title, exclude_id=obj.id):
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

    def get_chapter_detail(
        self,
        *,
        company_id: int,
        chapter_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            row = self.repo.get_chapter_detail(
                company_id=company_id,
                chapter_id=chapter_id,
            )
            if not row:
                return None
            return self.repo.shape_chapter_detail_row(row)

        data = cached_detail(
            entity="chapters:detail",
            company_id=company_id,
            record_id=chapter_id,
            ttl=30,
            builder=builder,
        )

        if data is None:
            return False, "Chapter not found.", {}

        return True, "OK", {"data": data}

    # =========================================================
    # FACULTY LIST METHODS
    # =========================================================
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

    def get_faculty_detail(
            self,
            *,
            company_id: int,
            faculty_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            row = self.repo.get_faculty_detail(
                company_id=company_id,
                faculty_id=faculty_id,
            )
            if not row:
                return None

            departments_preview = self.repo.faculty_departments_preview(
                company_id=company_id,
                faculty_id=faculty_id,
                limit=5,
            )

            return self.repo.shape_faculty_detail_row(
                row,
                departments_preview=departments_preview,
            )

        data = cached_detail(
            entity="faculties:detail",
            company_id=company_id,
            record_id=faculty_id,
            ttl=30,
            builder=builder,
        )

        if data is None:
            return False, "Faculty not found.", {}

        return True, "OK", {"data": data}

    # =========================================================
    # DEPARTMENT LIST METHODS
    # =========================================================
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

    def get_department_detail(
            self,
            *,
            company_id: int,
            department_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            row = self.repo.get_department_detail(
                company_id=company_id,
                department_id=department_id,
            )
            if not row:
                return None

            courses_preview = self.repo.department_courses_preview(
                company_id=company_id,
                department_id=department_id,
                limit=5,
            )

            return self.repo.shape_department_detail_row(
                row,
                courses_preview=courses_preview,
            )

        data = cached_detail(
            entity="departments:detail",
            company_id=company_id,
            record_id=department_id,
            ttl=30,
            builder=builder,
        )

        if data is None:
            return False, "Department not found.", {}

        return True, "OK", {"data": data}

    # =========================================================
    # DROPDOWNS
    # =========================================================
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
            strict_label=True,
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

    def dropdown_courses(
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
            "is_enabled": Course.is_enabled,
            "code": Course.code,
        }

        sort_fields = {
            "id": Course.id,
            "title": Course.title,
            "code": Course.code,
            "created_at": getattr(Course, "created_at", Course.id),
        }

        return self.course_svc.dropdown(
            company_id=company_id,
            search=search,
            limit=limit,
            offset=offset,
            active_only=active_only,
            search_columns=[Course.title, Course.code],
            filters=filters,
            allowed_filters=allowed_filters,
            sort_fields=sort_fields,
            default_sort=[Course.title.asc()],
            value_field="id",
            label_fields=["code", "title"],
            meta_fields=["code", "is_enabled"],
            strict_label=True,
        )

    def dropdown_departments(
            self,
            *,
            company_id: int,
            faculty_id: int | None,
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
            "faculty_id": Department.faculty_id,
        }

        sort_fields = {
            "id": Department.id,
            "name": Department.name,
            "code": Department.code,
            "created_at": getattr(Department, "created_at", Department.id),
        }

        extra_where = []
        if faculty_id is not None:
            extra_where.append(Department.faculty_id == int(faculty_id))

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
                extra_where=extra_where,
            )

        return cached_dropdown(
            name="departments",
            company_id=company_id,
            params=params,
            ttl=600,
            builder=builder,
        )

    def dropdown_course_offerings(
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
            "is_enabled": CourseOffering.is_enabled,
            "department_id": CourseOffering.department_id,
            "semester_id": CourseOffering.semester_id,
            "course_id": CourseOffering.course_id,
        }

        sort_fields = {
            "id": CourseOffering.id,
            "created_at": getattr(CourseOffering, "created_at", CourseOffering.id),
        }

        def offering_label(o: CourseOffering) -> str:
            if o.custom_title:
                return o.custom_title
            course_title = getattr(o, "course_title", None) or f"Course {o.course_id}"
            return course_title

        return self.course_offering_svc.dropdown(
            company_id=company_id,
            search=search,
            limit=limit,
            offset=offset,
            active_only=active_only,
            search_columns=[],
            filters=filters,
            allowed_filters=allowed_filters,
            sort_fields=sort_fields,
            default_sort=[CourseOffering.id.desc()],
            value_field="id",
            label_getter=offering_label,
            meta_fields=["course_id", "department_id", "semester_id", "custom_title", "credit_hours", "is_enabled"],
            strict_label=True,
        )