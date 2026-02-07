from __future__ import annotations

import logging
from typing import Any, Dict, Optional, Tuple, List

from sqlalchemy.exc import IntegrityError

from cmcp.config.database import db
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.modules.academic.academic_repo import AcademicRepo
from cmcp.modules.academic.models import Faculty, Department, AcademicYear, Semester, Course, Chapter
from cmcp.modules.academic.validation import (
    cannot_delete_linked,
    require_text,
    normalize_code,
    ensure_found,
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
    ERR_CHAPTER_EXISTS_NUMBER, ERR_COURSE_EXISTS_TITLE,
)

log = logging.getLogger(__name__)


def _safe_desc(v: Any) -> str | None:
    s = (v or "").strip()
    return s or None


def _semester_display_name(s: Semester) -> str:
    n = (getattr(s, "name", None) or "").strip()
    return n or f"Semester {int(s.number)}"


class AcademicService:
    """
    Clean ERP-style service.
    - company scoped
    - business validation messages
    - minimal create/update responses (frontend-friendly)
    """

    def __init__(self, repo: Optional[AcademicRepo] = None):
        self.repo = repo or AcademicRepo()
        self.s = self.repo.s

    # ----------------------------
    # Faculty
    # ----------------------------
    def create_faculty(self, *, company_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            name = require_text(data.get("name"), field_label="Faculty name")
            code = normalize_code(data.get("code"))

            if self.repo.faculty_name_exists(company_id=company_id, name=name):
                raise BusinessValidationError(ERR_FACULTY_EXISTS)
            if code and self.repo.faculty_code_exists(company_id=company_id, code=code):
                raise BusinessValidationError(ERR_FACULTY_CODE_EXISTS)

            obj = self.repo.faculties.create({"company_id": company_id, "name": name, "code": code, "is_enabled": True})
            return True, "Faculty created.", {"id": obj.id, "name": obj.name}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("create_faculty failed: %s", e)
            return False, "Unexpected error creating faculty.", None

    def update_faculty(self, *, company_id: int, faculty_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.faculties.get(int(faculty_id), company_id=company_id)
            ensure_found(obj, message=ERR_FACULTY_NOT_FOUND)

            if "name" in data and data["name"] is not None:
                name = require_text(data.get("name"), field_label="Faculty name")
                if self.repo.faculty_name_exists(company_id=company_id, name=name, exclude_id=obj.id):
                    raise BusinessValidationError(ERR_FACULTY_EXISTS)
                obj.name = name

            if "code" in data:
                code = normalize_code(data.get("code"))
                if code and self.repo.faculty_code_exists(company_id=company_id, code=code, exclude_id=obj.id):
                    raise BusinessValidationError(ERR_FACULTY_CODE_EXISTS)
                obj.code = code

            if "is_enabled" in data:
                obj.is_enabled = bool(data["is_enabled"])

            self.s.flush([obj])
            return True, "Faculty updated.", {"id": obj.id, "name": obj.name}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("update_faculty failed: %s", e)
            return False, "Unexpected error updating faculty.", None

    def delete_faculty(self, *, company_id: int, faculty_id: int, soft: bool = True) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.faculties.get(int(faculty_id), company_id=company_id)
            ensure_found(obj, message=ERR_FACULTY_NOT_FOUND)

            # prevent delete if linked
            linked = self.repo.faculties_with_departments([obj.id])
            if obj.id in linked:
                raise BusinessValidationError(cannot_delete_linked("Faculty", "Departments"))

            if soft and hasattr(obj, "is_enabled"):
                obj.is_enabled = False
            else:
                self.s.delete(obj)

            self.s.flush()
            return True, "Faculty deleted.", {"id": int(faculty_id)}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except Exception as e:
            log.exception("delete_faculty failed: %s", e)
            return False, "Unexpected error deleting faculty.", None

    def bulk_delete_faculties(self, *, company_id: int, ids: List[int], soft: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ids = [int(x) for x in (ids or []) if x]
            if not ids:
                return True, "Nothing to delete.", {"deleted": [], "failed": []}

            linked = self.repo.faculties_with_departments(ids)
            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            for fid in ids:
                obj = self.repo.faculties.get(fid, company_id=company_id)
                if not obj:
                    failed.append({"id": fid, "error": ERR_FACULTY_NOT_FOUND})
                    continue
                if fid in linked:
                    failed.append({"id": fid, "error": cannot_delete_linked("Faculty", "Departments")})
                    continue

                if soft and hasattr(obj, "is_enabled"):
                    obj.is_enabled = False
                else:
                    self.s.delete(obj)
                deleted.append(fid)

            self.s.flush()
            return True, f"Deleted {len(deleted)} faculty(s).", {"deleted": deleted, "failed": failed}

        except Exception as e:
            log.exception("bulk_delete_faculties failed: %s", e)
            return False, "Bulk delete failed.", {"deleted": [], "failed": [{"error": str(e)}]}

    # ----------------------------
    # Department
    # ----------------------------
    def create_department(self, *, company_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            faculty_id = int(data.get("faculty_id") or 0)
            faculty = self.repo.faculties.get(faculty_id, company_id=company_id)
            ensure_found(faculty, message=ERR_FACULTY_NOT_FOUND)

            name = require_text(data.get("name"), field_label="Department name")
            code = normalize_code(data.get("code"))

            if self.repo.department_name_exists(company_id=company_id, faculty_id=faculty_id, name=name):
                raise BusinessValidationError(ERR_DEPARTMENT_EXISTS_IN_FACULTY)
            if code and self.repo.department_code_exists(company_id=company_id, code=code):
                raise BusinessValidationError(ERR_DEPARTMENT_CODE_EXISTS)

            obj = self.repo.departments.create(
                {"company_id": company_id, "faculty_id": faculty_id, "name": name, "code": code, "is_enabled": True}
            )
            return True, "Department created.", {"id": obj.id, "name": obj.name}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("create_department failed: %s", e)
            return False, "Unexpected error creating department.", None

    def update_department(self, *, company_id: int, department_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.departments.get(int(department_id), company_id=company_id)
            ensure_found(obj, message=ERR_DEPARTMENT_NOT_FOUND)

            # allow changing faculty
            if "faculty_id" in data and data["faculty_id"] is not None:
                new_faculty_id = int(data["faculty_id"])
                faculty = self.repo.faculties.get(new_faculty_id, company_id=company_id)
                ensure_found(faculty, message=ERR_FACULTY_NOT_FOUND)
                obj.faculty_id = new_faculty_id

            if "name" in data and data["name"] is not None:
                name = require_text(data.get("name"), field_label="Department name")
                if self.repo.department_name_exists(
                    company_id=company_id, faculty_id=obj.faculty_id, name=name, exclude_id=obj.id
                ):
                    raise BusinessValidationError("Department already exists with this name in this faculty.")
                obj.name = name

            if "code" in data:
                code = normalize_code(data.get("code"))
                if code and self.repo.department_code_exists(company_id=company_id, code=code, exclude_id=obj.id):
                    raise BusinessValidationError(ERR_DEPARTMENT_CODE_EXISTS)
                obj.code = code

            if "is_enabled" in data:
                obj.is_enabled = bool(data["is_enabled"])

            self.s.flush([obj])
            return True, "Department updated.", {"id": obj.id, "name": obj.name}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("update_department failed: %s", e)
            return False, "Unexpected error updating department.", None

    def delete_department(self, *, company_id: int, department_id: int, soft: bool = True) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.departments.get(int(department_id), company_id=company_id)
            ensure_found(obj, message=ERR_DEPARTMENT_NOT_FOUND)

            linked = self.repo.departments_with_courses([obj.id])
            if obj.id in linked:
                raise BusinessValidationError(cannot_delete_linked("Department", "Courses"))

            if soft and hasattr(obj, "is_enabled"):
                obj.is_enabled = False
            else:
                self.s.delete(obj)

            self.s.flush()
            return True, "Department deleted.", {"id": int(department_id)}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except Exception as e:
            log.exception("delete_department failed: %s", e)
            return False, "Unexpected error deleting department.", None

    def bulk_delete_departments(self, *, company_id: int, ids: List[int], soft: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ids = [int(x) for x in (ids or []) if x]
            if not ids:
                return True, "Nothing to delete.", {"deleted": [], "failed": []}

            linked = self.repo.departments_with_courses(ids)
            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            for did in ids:
                obj = self.repo.departments.get(did, company_id=company_id)
                if not obj:
                    failed.append({"id": did, "error": ERR_DEPARTMENT_NOT_FOUND})
                    continue
                if did in linked:
                    failed.append({"id": did, "error": cannot_delete_linked("Department", "Courses")})
                    continue

                if soft and hasattr(obj, "is_enabled"):
                    obj.is_enabled = False
                else:
                    self.s.delete(obj)
                deleted.append(did)

            self.s.flush()
            return True, f"Deleted {len(deleted)} department(s).", {"deleted": deleted, "failed": failed}

        except Exception as e:
            log.exception("bulk_delete_departments failed: %s", e)
            return False, "Bulk delete failed.", {"deleted": [], "failed": [{"error": str(e)}]}

    # ----------------------------
    # Academic Year
    # ----------------------------
    def create_year(self, *, company_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            name = require_text(data.get("name"), field_label="Academic year name")

            if self.repo.academic_year_name_exists(company_id=company_id, name=name):
                raise BusinessValidationError(ERR_ACADEMIC_YEAR_EXISTS)

            obj = self.repo.years.create({"company_id": company_id, "name": name, "is_enabled": True})
            return True, "Academic year created.", {"id": obj.id, "name": obj.name}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("create_year failed: %s", e)
            return False, "Unexpected error creating academic year.", None

    def update_year(self, *, company_id: int, year_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.years.get(int(year_id), company_id=company_id)
            ensure_found(obj, message=ERR_ACADEMIC_YEAR_NOT_FOUND)

            if "name" in data and data["name"] is not None:
                name = require_text(data.get("name"), field_label="Academic year name")
                if self.repo.academic_year_name_exists(company_id=company_id, name=name, exclude_id=obj.id):
                    raise BusinessValidationError(ERR_ACADEMIC_YEAR_EXISTS)
                obj.name = name

            if "is_enabled" in data:
                obj.is_enabled = bool(data["is_enabled"])

            self.s.flush([obj])
            return True, "Academic year updated.", {"id": obj.id, "name": obj.name}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("update_year failed: %s", e)
            return False, "Unexpected error updating academic year.", None

    def delete_year(self, *, company_id: int, year_id: int, soft: bool = True) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.years.get(int(year_id), company_id=company_id)
            ensure_found(obj, message=ERR_ACADEMIC_YEAR_NOT_FOUND)

            linked = self.repo.years_with_semesters([obj.id])
            if obj.id in linked:
                raise BusinessValidationError(cannot_delete_linked("Academic year", "Semesters"))

            if soft and hasattr(obj, "is_enabled"):
                obj.is_enabled = False
            else:
                self.s.delete(obj)

            self.s.flush()
            return True, "Academic year deleted.", {"id": int(year_id)}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except Exception as e:
            log.exception("delete_year failed: %s", e)
            return False, "Unexpected error deleting academic year.", None

    def bulk_delete_years(self, *, company_id: int, ids: List[int], soft: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ids = [int(x) for x in (ids or []) if x]
            if not ids:
                return True, "Nothing to delete.", {"deleted": [], "failed": []}

            linked = self.repo.years_with_semesters(ids)
            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            for yid in ids:
                obj = self.repo.years.get(yid, company_id=company_id)
                if not obj:
                    failed.append({"id": yid, "error": ERR_ACADEMIC_YEAR_NOT_FOUND})
                    continue
                if yid in linked:
                    failed.append({"id": yid, "error": cannot_delete_linked("Academic year", "Semesters")})
                    continue

                if soft and hasattr(obj, "is_enabled"):
                    obj.is_enabled = False
                else:
                    self.s.delete(obj)
                deleted.append(yid)

            self.s.flush()
            return True, f"Deleted {len(deleted)} academic year(s).", {"deleted": deleted, "failed": failed}

        except Exception as e:
            log.exception("bulk_delete_years failed: %s", e)
            return False, "Bulk delete failed.", {"deleted": [], "failed": [{"error": str(e)}]}

    # ----------------------------
    # Semester
    # ----------------------------
    def create_semester(self, *, company_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            academic_year_id = int(data.get("academic_year_id") or 0)
            year = self.repo.years.get(academic_year_id, company_id=company_id)
            ensure_found(year, message=ERR_ACADEMIC_YEAR_NOT_FOUND)

            number = int(data.get("number") or 0)
            if number < 1:
                raise BusinessValidationError("Semester number must be at least 1")

            name = (data.get("name") or "").strip() or None

            # uniqueness
            if name and self.repo.semester_name_exists(company_id=company_id, name=name):
                raise BusinessValidationError(ERR_SEMESTER_EXISTS_NAME)
            if self.repo.semester_number_exists(company_id=company_id, academic_year_id=academic_year_id, number=number):
                raise BusinessValidationError(ERR_SEMESTER_EXISTS_NUMBER)

            obj = self.repo.semesters.create(
                {
                    "company_id": company_id,
                    "academic_year_id": academic_year_id,
                    "number": number,
                    "name": name,
                    "is_enabled": True,
                }
            )
            return True, "Semester created.", {"id": obj.id, "name": _semester_display_name(obj)}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("create_semester failed: %s", e)
            return False, "Unexpected error creating semester.", None

    def update_semester(self, *, company_id: int, semester_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.semesters.get(int(semester_id), company_id=company_id)
            ensure_found(obj, message=ERR_SEMESTER_NOT_FOUND)

            if "academic_year_id" in data and data["academic_year_id"] is not None:
                new_year_id = int(data["academic_year_id"])
                year = self.repo.years.get(new_year_id, company_id=company_id)
                ensure_found(year, message=ERR_ACADEMIC_YEAR_NOT_FOUND)
                obj.academic_year_id = new_year_id

            if "number" in data and data["number"] is not None:
                number = int(data["number"])
                if number < 1:
                    raise BusinessValidationError("Semester number must be at least 1")
                if self.repo.semester_number_exists(
                    company_id=company_id,
                    academic_year_id=int(obj.academic_year_id),
                    number=number,
                    exclude_id=obj.id,
                ):
                    raise BusinessValidationError(ERR_SEMESTER_EXISTS_NUMBER)
                obj.number = number

            if "name" in data:
                name = (data.get("name") or "").strip() or None
                if name and self.repo.semester_name_exists(company_id=company_id, name=name, exclude_id=obj.id):
                    raise BusinessValidationError(ERR_SEMESTER_EXISTS_NAME)
                obj.name = name

            if "is_enabled" in data:
                obj.is_enabled = bool(data["is_enabled"])

            self.s.flush([obj])
            return True, "Semester updated.", {"id": obj.id, "name": _semester_display_name(obj)}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("update_semester failed: %s", e)
            return False, "Unexpected error updating semester.", None

    def delete_semester(self, *, company_id: int, semester_id: int, soft: bool = True) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.semesters.get(int(semester_id), company_id=company_id)
            ensure_found(obj, message=ERR_SEMESTER_NOT_FOUND)

            linked = self.repo.semesters_with_courses([obj.id])
            if obj.id in linked:
                raise BusinessValidationError(cannot_delete_linked("Semester", "Courses"))

            if soft and hasattr(obj, "is_enabled"):
                obj.is_enabled = False
            else:
                self.s.delete(obj)

            self.s.flush()
            return True, "Semester deleted.", {"id": int(semester_id)}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except Exception as e:
            log.exception("delete_semester failed: %s", e)
            return False, "Unexpected error deleting semester.", None

    def bulk_delete_semesters(self, *, company_id: int, ids: List[int], soft: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ids = [int(x) for x in (ids or []) if x]
            if not ids:
                return True, "Nothing to delete.", {"deleted": [], "failed": []}

            linked = self.repo.semesters_with_courses(ids)
            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            for sid in ids:
                obj = self.repo.semesters.get(sid, company_id=company_id)
                if not obj:
                    failed.append({"id": sid, "error": ERR_SEMESTER_NOT_FOUND})
                    continue
                if sid in linked:
                    failed.append({"id": sid, "error": cannot_delete_linked("Semester", "Courses")})
                    continue

                if soft and hasattr(obj, "is_enabled"):
                    obj.is_enabled = False
                else:
                    self.s.delete(obj)
                deleted.append(sid)

            self.s.flush()
            return True, f"Deleted {len(deleted)} semester(s).", {"deleted": deleted, "failed": failed}

        except Exception as e:
            log.exception("bulk_delete_semesters failed: %s", e)
            return False, "Bulk delete failed.", {"deleted": [], "failed": [{"error": str(e)}]}

    # ----------------------------
    # Course
    # ----------------------------
    def create_course(self, *, company_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            department_id = int(data.get("department_id") or 0)
            department = self.repo.departments.get(department_id, company_id=company_id)
            ensure_found(department, message=ERR_DEPARTMENT_NOT_FOUND)

            semester_id = int(data.get("semester_id") or 0)
            semester = self.repo.semesters.get(semester_id, company_id=company_id, eager_load=["academic_year"])
            ensure_found(semester, message=ERR_SEMESTER_NOT_FOUND)

            # extra safety: semester must have year in same company (covers your "academic year not found/belong" request)
            year = getattr(semester, "academic_year", None)
            if not year or int(getattr(year, "company_id", -1)) != int(company_id):
                raise NotFoundError(ERR_ACADEMIC_YEAR_NOT_FOUND)

            title = require_text(data.get("title"), field_label="Course title")
            code = normalize_code(data.get("code"))
            description = _safe_desc(data.get("description"))

            if self.repo.course_title_exists(
                company_id=company_id, department_id=department_id, semester_id=semester_id, title=title
            ):
                raise BusinessValidationError(ERR_COURSE_EXISTS_TITLE_IN_SCOPE)
            if code and self.repo.course_code_exists(company_id=company_id, code=code):
                raise BusinessValidationError(ERR_COURSE_CODE_EXISTS)

            obj = self.repo.courses.create(
                {
                    "company_id": company_id,
                    "department_id": department_id,
                    "semester_id": semester_id,
                    "title": title,
                    "code": code,
                    "description": description,
                    "is_enabled": True,
                }
            )
            return True, "Course created.", {"id": obj.id, "title": obj.title, "code": obj.code}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("create_course failed: %s", e)
            return False, "Unexpected error creating course.", None

    def update_course(self, *, company_id: int, course_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.courses.get(int(course_id), company_id=company_id)
            ensure_found(obj, message=ERR_COURSE_NOT_FOUND)

            # optional move
            if "department_id" in data and data["department_id"] is not None:
                new_department_id = int(data["department_id"])
                dept = self.repo.departments.get(new_department_id, company_id=company_id)
                ensure_found(dept, message=ERR_DEPARTMENT_NOT_FOUND)
                obj.department_id = new_department_id

            if "semester_id" in data and data["semester_id"] is not None:
                new_semester_id = int(data["semester_id"])
                sem = self.repo.semesters.get(new_semester_id, company_id=company_id, eager_load=["academic_year"])
                ensure_found(sem, message=ERR_SEMESTER_NOT_FOUND)
                year = getattr(sem, "academic_year", None)
                if not year or int(getattr(year, "company_id", -1)) != int(company_id):
                    raise NotFoundError(ERR_ACADEMIC_YEAR_NOT_FOUND)
                obj.semester_id = new_semester_id

            if "title" in data and data["title"] is not None:
                title = require_text(data.get("title"), field_label="Course title")
                if self.repo.course_title_exists(
                    company_id=company_id,
                    department_id=int(obj.department_id),
                    semester_id=int(obj.semester_id),
                    title=title,
                    exclude_id=obj.id,
                ):
                    raise BusinessValidationError(ERR_COURSE_EXISTS_TITLE)
                obj.title = title

            if "code" in data:
                code = normalize_code(data.get("code"))
                if code and self.repo.course_code_exists(company_id=company_id, code=code, exclude_id=obj.id):
                    raise BusinessValidationError(ERR_COURSE_CODE_EXISTS)
                obj.code = code

            if "description" in data:
                obj.description = _safe_desc(data.get("description"))

            if "is_enabled" in data:
                obj.is_enabled = bool(data["is_enabled"])

            self.s.flush([obj])
            return True, "Course updated.", {"id": obj.id, "title": obj.title, "code": obj.code}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("update_course failed: %s", e)
            return False, "Unexpected error updating course.", None

    def delete_course(self, *, company_id: int, course_id: int, soft: bool = True) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.courses.get(int(course_id), company_id=company_id)
            ensure_found(obj, message=ERR_COURSE_NOT_FOUND)

            linked = self.repo.courses_with_chapters([obj.id])
            if obj.id in linked:
                raise BusinessValidationError(cannot_delete_linked("Course", "Chapters"))

            if soft and hasattr(obj, "is_enabled"):
                obj.is_enabled = False
            else:
                self.s.delete(obj)

            self.s.flush()
            return True, "Course deleted.", {"id": int(course_id)}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except Exception as e:
            log.exception("delete_course failed: %s", e)
            return False, "Unexpected error deleting course.", None

    def bulk_delete_courses(self, *, company_id: int, ids: List[int], soft: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ids = [int(x) for x in (ids or []) if x]
            if not ids:
                return True, "Nothing to delete.", {"deleted": [], "failed": []}

            linked = self.repo.courses_with_chapters(ids)
            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            for cid in ids:
                obj = self.repo.courses.get(cid, company_id=company_id)
                if not obj:
                    failed.append({"id": cid, "error": ERR_COURSE_NOT_FOUND})
                    continue
                if cid in linked:
                    failed.append({"id": cid, "error": cannot_delete_linked("Course", "Chapters")})
                    continue

                if soft and hasattr(obj, "is_enabled"):
                    obj.is_enabled = False
                else:
                    self.s.delete(obj)
                deleted.append(cid)

            self.s.flush()
            return True, f"Deleted {len(deleted)} course(s).", {"deleted": deleted, "failed": failed}

        except Exception as e:
            log.exception("bulk_delete_courses failed: %s", e)
            return False, "Bulk delete failed.", {"deleted": [], "failed": [{"error": str(e)}]}

    # ----------------------------
    # Chapter
    # ----------------------------
    def create_chapter(self, *, company_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            course_id = int(data.get("course_id") or 0)
            course = self.repo.courses.get(course_id, company_id=company_id)
            ensure_found(course, message=ERR_COURSE_NOT_FOUND)

            number = int(data.get("number") or 0)
            if number < 1:
                raise BusinessValidationError("Chapter number must be at least 1")

            title = require_text(data.get("title"), field_label="Chapter title")
            description = _safe_desc(data.get("description"))

            if self.repo.chapter_title_exists(company_id=company_id, course_id=course_id, title=title):
                raise BusinessValidationError(ERR_CHAPTER_EXISTS_TITLE)
            if self.repo.chapter_number_exists(company_id=company_id, course_id=course_id, number=number):
                raise BusinessValidationError(ERR_CHAPTER_EXISTS_NUMBER)

            obj = self.repo.chapters.create(
                {
                    "company_id": company_id,
                    "course_id": course_id,
                    "number": number,
                    "title": title,
                    "description": description,
                    "is_enabled": True,
                }
            )
            return True, "Chapter created.", {"id": obj.id, "title": obj.title}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("create_chapter failed: %s", e)
            return False, "Unexpected error creating chapter.", None

    def update_chapter(self, *, company_id: int, chapter_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.chapters.get(int(chapter_id), company_id=company_id)
            ensure_found(obj, message=ERR_CHAPTER_NOT_FOUND)

            if "course_id" in data and data["course_id"] is not None:
                new_course_id = int(data["course_id"])
                course = self.repo.courses.get(new_course_id, company_id=company_id)
                ensure_found(course, message=ERR_COURSE_NOT_FOUND)
                obj.course_id = new_course_id

            if "number" in data and data["number"] is not None:
                number = int(data["number"])
                if number < 1:
                    raise BusinessValidationError("Chapter number must be at least 1")
                if self.repo.chapter_number_exists(
                    company_id=company_id, course_id=int(obj.course_id), number=number, exclude_id=obj.id
                ):
                    raise BusinessValidationError(ERR_CHAPTER_EXISTS_NUMBER)
                obj.number = number

            if "title" in data and data["title"] is not None:
                title = require_text(data.get("title"), field_label="Chapter title")
                if self.repo.chapter_title_exists(
                    company_id=company_id, course_id=int(obj.course_id), title=title, exclude_id=obj.id
                ):
                    raise BusinessValidationError(ERR_CHAPTER_EXISTS_TITLE)
                obj.title = title

            if "description" in data:
                obj.description = _safe_desc(data.get("description"))

            if "is_enabled" in data:
                obj.is_enabled = bool(data["is_enabled"])

            self.s.flush([obj])
            return True, "Chapter updated.", {"id": obj.id, "title": obj.title}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("update_chapter failed: %s", e)
            return False, "Unexpected error updating chapter.", None

    def delete_chapter(self, *, company_id: int, chapter_id: int, soft: bool = True) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.chapters.get(int(chapter_id), company_id=company_id)
            ensure_found(obj, message=ERR_CHAPTER_NOT_FOUND)

            if soft and hasattr(obj, "is_enabled"):
                obj.is_enabled = False
            else:
                self.s.delete(obj)

            self.s.flush()
            return True, "Chapter deleted.", {"id": int(chapter_id)}

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except Exception as e:
            log.exception("delete_chapter failed: %s", e)
            return False, "Unexpected error deleting chapter.", None

    def bulk_delete_chapters(self, *, company_id: int, ids: List[int], soft: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ids = [int(x) for x in (ids or []) if x]
            if not ids:
                return True, "Nothing to delete.", {"deleted": [], "failed": []}

            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            for chid in ids:
                obj = self.repo.chapters.get(chid, company_id=company_id)
                if not obj:
                    failed.append({"id": chid, "error": ERR_CHAPTER_NOT_FOUND})
                    continue

                if soft and hasattr(obj, "is_enabled"):
                    obj.is_enabled = False
                else:
                    self.s.delete(obj)
                deleted.append(chid)

            self.s.flush()
            return True, f"Deleted {len(deleted)} chapter(s).", {"deleted": deleted, "failed": failed}

        except Exception as e:
            log.exception("bulk_delete_chapters failed: %s", e)
            return False, "Bulk delete failed.", {"deleted": [], "failed": [{"error": str(e)}]}
