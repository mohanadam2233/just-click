from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, List, Set, Type, Any, Dict, Tuple

from sqlalchemy import select, exists, func, and_
from sqlalchemy.orm import Session

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository
from cmcp.modules.academic.models import Faculty, Department, AcademicYear, Semester, Course, Chapter
@dataclass
class FacultyListRow:
    id: int
    name: str
    code: Optional[str]
    is_enabled: bool
    departments_count: int


@dataclass
class FacultyDetailRow:
    id: int
    name: str
    code: Optional[str]
    is_enabled: bool
    departments_count: int
    created_at: Any
    updated_at: Any


@dataclass
class DepartmentListRow:
    id: int
    faculty_id: int
    name: str
    code: Optional[str]
    faculty_name: Optional[str]
    is_enabled: bool
    courses_count: int


@dataclass
class DepartmentDetailRow:
    id: int
    faculty_id: int
    faculty_name: Optional[str]
    faculty_code: Optional[str]
    name: str
    code: Optional[str]
    is_enabled: bool
    courses_count: int
    created_at: Any
    updated_at: Any


@dataclass
class AcademicYearListRow:
    id: int
    name: str
    is_enabled: bool
    semesters_count: int


@dataclass
class AcademicYearDetailRow:
    id: int
    name: str
    is_enabled: bool
    semesters_count: int
    created_at: Any
    updated_at: Any


@dataclass
class SemesterListRow:
    id: int
    number: int
    name: Optional[str]
    academic_year_id: int
    academic_year_name: Optional[str]
    is_enabled: bool
    courses_count: int


@dataclass
class SemesterDetailRow:
    id: int
    number: int
    name: Optional[str]
    academic_year_id: int
    academic_year_name: Optional[str]
    is_enabled: bool
    courses_count: int
    created_at: Any
    updated_at: Any


@dataclass
class CourseListRow:
    id: int
    title: str
    code: Optional[str]
    department_id: int
    department_name: Optional[str]
    semester_id: int
    semester_number: int
    semester_name: Optional[str]
    academic_year_id: int
    academic_year_name: Optional[str]
    is_enabled: bool
    chapters_count: int


@dataclass
class CourseDetailRow:
    id: int
    title: str
    code: Optional[str]
    description: Optional[str]
    department_id: int
    department_name: Optional[str]
    faculty_id: int
    faculty_name: Optional[str]
    semester_id: int
    semester_number: int
    semester_name: Optional[str]
    academic_year_id: int
    academic_year_name: Optional[str]
    is_enabled: bool
    chapters_count: int
    created_at: Any
    updated_at: Any


@dataclass
class ChapterListRow:
    id: int
    course_id: int
    course_title: Optional[str]
    number: int
    title: str
    is_enabled: bool


@dataclass
class ChapterDetailRow:
    id: int
    course_id: int
    course_title: Optional[str]
    number: int
    title: str
    description: Optional[str]
    is_enabled: bool
    created_at: Any
    updated_at: Any
class AcademicRepo:
    def __init__(self, session: Optional[Session] = None):
        self.s: Session = session or db.session
        self.faculties = BaseRepository(Faculty, self.s)
        self.departments = BaseRepository(Department, self.s)
        self.years = BaseRepository(AcademicYear, self.s)
        self.semesters = BaseRepository(Semester, self.s)
        self.courses = BaseRepository(Course, self.s)
        self.chapters = BaseRepository(Chapter, self.s)

    # ----------------------------
    # Exists checks (case-insensitive)
    # ----------------------------
    def faculty_name_exists(self, *, company_id: int, name: str, exclude_id: Optional[int] = None) -> bool:
        conds = [Faculty.company_id == int(company_id), func.lower(Faculty.name) == func.lower(name.strip())]
        if exclude_id:
            conds.append(Faculty.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def faculty_code_exists(self, *, company_id: int, code: str, exclude_id: Optional[int] = None) -> bool:
        if not code:
            return False
        conds = [Faculty.company_id == int(company_id), func.lower(Faculty.code) == func.lower(code.strip())]
        if exclude_id:
            conds.append(Faculty.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def department_name_exists(self, *, company_id: int, faculty_id: int, name: str, exclude_id: Optional[int] = None) -> bool:
        conds = [
            Department.company_id == int(company_id),
            Department.faculty_id == int(faculty_id),
            func.lower(Department.name) == func.lower(name.strip()),
        ]
        if exclude_id:
            conds.append(Department.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def department_code_exists(self, *, company_id: int, code: str, exclude_id: Optional[int] = None) -> bool:
        if not code:
            return False
        conds = [Department.company_id == int(company_id), func.lower(Department.code) == func.lower(code.strip())]
        if exclude_id:
            conds.append(Department.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def academic_year_name_exists(self, *, company_id: int, name: str, exclude_id: Optional[int] = None) -> bool:
        conds = [AcademicYear.company_id == int(company_id), func.lower(AcademicYear.name) == func.lower(name.strip())]
        if exclude_id:
            conds.append(AcademicYear.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    @staticmethod
    def _semester_display_name(number: int, name: Optional[str], academic_year_name: Optional[str]) -> str:
        base = (name or "").strip() or f"Semester {int(number)}"
        if academic_year_name:
            return f"{base} ({academic_year_name})"
        return base

    @staticmethod
    def _semester_name_only(number: int, name: Optional[str]) -> str:
        return (name or "").strip() or f"Semester {int(number)}"
    # =========================================================
    # ACADEMIC YEAR: DETAIL
    # =========================================================
    def get_academic_year_detail(
            self,
            *,
            company_id: int,
            academic_year_id: int,
    ) -> Optional[AcademicYearDetailRow]:
        stmt = (
            select(
                AcademicYear.id.label("id"),
                AcademicYear.name.label("name"),
                AcademicYear.is_enabled.label("is_enabled"),
                func.count(Semester.id).label("semesters_count"),
                AcademicYear.created_at.label("created_at"),
                AcademicYear.updated_at.label("updated_at"),
            )
            .select_from(AcademicYear)
            .outerjoin(
                Semester,
                and_(
                    Semester.academic_year_id == AcademicYear.id,
                    Semester.company_id == int(company_id),
                ),
            )
            .where(
                AcademicYear.company_id == int(company_id),
                AcademicYear.id == int(academic_year_id),
            )
            .group_by(
                AcademicYear.id,
                AcademicYear.name,
                AcademicYear.is_enabled,
                AcademicYear.created_at,
                AcademicYear.updated_at,
            )
        )

        row = self.s.execute(stmt).first()
        return AcademicYearDetailRow(**row._asdict()) if row else None

    def academic_year_semesters_preview(
            self,
            *,
            company_id: int,
            academic_year_id: int,
            limit: int = 5,
    ) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Semester.id.label("id"),
                Semester.number.label("number"),
                Semester.name.label("name"),
                Semester.is_enabled.label("is_enabled"),
            )
            .where(
                Semester.company_id == int(company_id),
                Semester.academic_year_id == int(academic_year_id),
            )
            .order_by(Semester.number.asc())
            .limit(int(limit))
        )

        rows = self.s.execute(stmt).all()

        return [
            {
                "id": int(r.id),
                "number": int(r.number),
                "name": self._semester_name_only(r.number, r.name),
                "is_enabled": bool(r.is_enabled),
            }
            for r in rows
        ]

    def shape_academic_year_detail_row(
            self,
            r: AcademicYearDetailRow,
            *,
            semesters_preview: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "name": r.name,
            "is_enabled": bool(r.is_enabled),
            "semesters_count": int(r.semesters_count or 0),
            "semesters_preview": semesters_preview,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }

    def semester_name_exists(self, *, company_id: int, name: str, exclude_id: Optional[int] = None) -> bool:
        if not name:
            return False
        conds = [Semester.company_id == int(company_id), func.lower(Semester.name) == func.lower(name.strip())]
        if exclude_id:
            conds.append(Semester.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def semester_number_exists(self, *, company_id: int, academic_year_id: int, number: int, exclude_id: Optional[int] = None) -> bool:
        conds = [
            Semester.company_id == int(company_id),
            Semester.academic_year_id == int(academic_year_id),
            Semester.number == int(number),
        ]
        if exclude_id:
            conds.append(Semester.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def course_title_exists(self, *, company_id: int, department_id: int, semester_id: int, title: str, exclude_id: Optional[int] = None) -> bool:
        conds = [
            Course.company_id == int(company_id),
            Course.department_id == int(department_id),
            Course.semester_id == int(semester_id),
            func.lower(Course.title) == func.lower(title.strip()),
        ]
        if exclude_id:
            conds.append(Course.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def course_code_exists(self, *, company_id: int, code: str, exclude_id: Optional[int] = None) -> bool:
        if not code:
            return False
        conds = [Course.company_id == int(company_id), func.lower(Course.code) == func.lower(code.strip())]
        if exclude_id:
            conds.append(Course.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def chapter_title_exists(self, *, company_id: int, course_id: int, title: str, exclude_id: Optional[int] = None) -> bool:
        conds = [
            Chapter.company_id == int(company_id),
            Chapter.course_id == int(course_id),
            func.lower(Chapter.title) == func.lower(title.strip()),
        ]
        if exclude_id:
            conds.append(Chapter.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def chapter_number_exists(self, *, company_id: int, course_id: int, number: int, exclude_id: Optional[int] = None) -> bool:
        conds = [Chapter.company_id == int(company_id), Chapter.course_id == int(course_id), Chapter.number == int(number)]
        if exclude_id:
            conds.append(Chapter.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    # ----------------------------
    # Linked record checks
    # ----------------------------
    def faculties_with_departments(self, ids: List[int]) -> Set[int]:
        if not ids:
            return set()
        stmt = select(Department.faculty_id).where(Department.faculty_id.in_([int(x) for x in ids])).distinct()
        return set(self.s.scalars(stmt).all())

    def departments_with_courses(self, ids: List[int]) -> Set[int]:
        if not ids:
            return set()
        stmt = select(Course.department_id).where(Course.department_id.in_([int(x) for x in ids])).distinct()
        return set(self.s.scalars(stmt).all())

    def years_with_semesters(self, ids: List[int]) -> Set[int]:
        if not ids:
            return set()
        stmt = select(Semester.academic_year_id).where(Semester.academic_year_id.in_([int(x) for x in ids])).distinct()
        return set(self.s.scalars(stmt).all())

    def semesters_with_courses(self, ids: List[int]) -> Set[int]:
        if not ids:
            return set()
        stmt = select(Course.semester_id).where(Course.semester_id.in_([int(x) for x in ids])).distinct()
        return set(self.s.scalars(stmt).all())

    def courses_with_chapters(self, ids: List[int]) -> Set[int]:
        if not ids:
            return set()
        stmt = select(Chapter.course_id).where(Chapter.course_id.in_([int(x) for x in ids])).distinct()
        return set(self.s.scalars(stmt).all())

    # ----------------------------
    # Bulk helper: existing IDs for model
    # ----------------------------
    # ----------------------------
    def existing_ids(self, *, model: Type[Any], company_id: int, ids: List[int]) -> Set[int]:
        if not ids:
            return set()
        stmt = select(model.id).where(model.id.in_([int(x) for x in ids]))
        if hasattr(model, "company_id"):
            stmt = stmt.where(model.company_id == int(company_id))
        return set(self.s.scalars(stmt).all())

    def _faculty_base_stmt(
            self,
            *,
            company_id: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ):
        stmt = (
            select(
                Faculty.id.label("id"),
                Faculty.name.label("name"),
                Faculty.code.label("code"),
                Faculty.is_enabled.label("is_enabled"),
                func.count(Department.id).label("departments_count"),
            )
            .select_from(Faculty)
            .outerjoin(
                Department,
                and_(
                    Department.faculty_id == Faculty.id,
                    Department.company_id == int(company_id),
                ),
            )
            .where(Faculty.company_id == int(company_id))
            .group_by(
                Faculty.id,
                Faculty.name,
                Faculty.code,
                Faculty.is_enabled,
            )
        )

        if is_enabled is True:
            stmt = stmt.where(Faculty.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(Faculty.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(Faculty.name, "")).like(like)
                | func.lower(func.coalesce(Faculty.code, "")).like(like)
            )

        return stmt
    def list_faculties_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            last_id: Optional[int],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[FacultyListRow], int, bool]:
        base = self._faculty_base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        if last_id:
            base = base.where(Faculty.id < int(last_id))

        base = base.order_by(Faculty.id.desc()).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        # total count aligned with filters (NO JOIN needed)
        count_stmt = select(func.count()).select_from(Faculty).where(Faculty.company_id == int(company_id))

        if is_enabled is True:
            count_stmt = count_stmt.where(Faculty.is_enabled.is_(True))
        elif is_enabled is False:
            count_stmt = count_stmt.where(Faculty.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            count_stmt = count_stmt.where(
                func.lower(func.coalesce(Faculty.name, "")).like(like)
                | func.lower(func.coalesce(Faculty.code, "")).like(like)
            )

        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [FacultyListRow(**r._asdict()) for r in rows]
        return shaped, total, has_more

    def list_faculties_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[FacultyListRow], int, int]:
        base = self._faculty_base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        # count (subquery)
        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)
        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = base.order_by(Faculty.id.desc()).offset(offset).limit(per_page)

        rows = list(self.s.execute(base).all())
        shaped = [FacultyListRow(**r._asdict()) for r in rows]
        return shaped, total, pages

            # Shape row (returns your exact JSON)

    def shape_faculty_list_row(self, r: FacultyListRow) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "name": r.name,
            "code": r.code,
            "is_enabled": bool(r.is_enabled),
            "departments_count": int(r.departments_count or 0),
        }

    def faculty_departments_preview(
        self,
        *,
        company_id: int,
        faculty_id: int,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Department.id.label("id"),
                Department.name.label("name"),
                Department.code.label("code"),
                Department.is_enabled.label("is_enabled"),
            )
            .where(
                Department.company_id == int(company_id),
                Department.faculty_id == int(faculty_id),
            )
            .order_by(Department.id.asc())
            .limit(int(limit))
        )

        rows = self.s.execute(stmt).all()

        return [
            {
                "id": int(r.id),
                "name": r.name,
                "code": r.code,
                "is_enabled": bool(r.is_enabled),
            }
            for r in rows
        ]
    # =========================================================
    # FACULTY: DETAIL
    # =========================================================
    def get_faculty_detail(
            self,
            *,
            company_id: int,
            faculty_id: int,
    ) -> Optional[FacultyDetailRow]:
        stmt = (
            select(
                Faculty.id.label("id"),
                Faculty.name.label("name"),
                Faculty.code.label("code"),
                Faculty.is_enabled.label("is_enabled"),
                func.count(Department.id).label("departments_count"),
                Faculty.created_at.label("created_at"),
                Faculty.updated_at.label("updated_at"),
            )
            .select_from(Faculty)
            .outerjoin(
                Department,
                and_(
                    Department.faculty_id == Faculty.id,
                    Department.company_id == int(company_id),
                ),
            )
            .where(
                Faculty.company_id == int(company_id),
                Faculty.id == int(faculty_id),
            )
            .group_by(
                Faculty.id,
                Faculty.name,
                Faculty.code,
                Faculty.is_enabled,
                Faculty.created_at,
                Faculty.updated_at,
            )
        )

        row = self.s.execute(stmt).first()
        return FacultyDetailRow(**row._asdict()) if row else None

    def shape_faculty_detail_row(
            self,
            r: FacultyDetailRow,
            *,
            departments_preview: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "name": r.name,
            "code": r.code,
            "is_enabled": bool(r.is_enabled),
            "departments_count": int(r.departments_count or 0),
            "departments_preview": departments_preview,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }

    def _department_base_stmt(
            self,
            *,
            company_id: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ):
        stmt = (
            select(
                Department.id.label("id"),
                Department.faculty_id.label("faculty_id"),
                Department.name.label("name"),
                Department.code.label("code"),
                Faculty.name.label("faculty_name"),
                Department.is_enabled.label("is_enabled"),
                func.count(Course.id).label("courses_count"),
            )
            .select_from(Department)
            .outerjoin(
                Faculty,
                and_(
                    Faculty.id == Department.faculty_id,
                    Faculty.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Course,
                and_(
                    Course.department_id == Department.id,
                    Course.company_id == int(company_id),
                ),
            )
            .where(Department.company_id == int(company_id))
            .group_by(
                Department.id,
                Department.faculty_id,
                Department.name,
                Department.code,
                Faculty.name,
                Department.is_enabled,
            )
        )

        if is_enabled is True:
            stmt = stmt.where(Department.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(Department.is_enabled.is_(False))

        if filters.get("faculty_id"):
            stmt = stmt.where(Department.faculty_id == int(filters["faculty_id"]))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(Department.name, "")).like(like)
                | func.lower(func.coalesce(Department.code, "")).like(like)
                | func.lower(func.coalesce(Faculty.name, "")).like(like)
            )

        return stmt
        # =========================================================
        # DEPARTMENT: LIST cursor (descending id)
        # =========================================================

    def list_departments_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            last_id: Optional[int],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[DepartmentListRow], int, bool]:
        base = self._department_base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        if last_id:
            base = base.where(Department.id < int(last_id))

        base = base.order_by(Department.id.desc()).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        # total count aligned with filters (NO JOIN needed)
        count_stmt = select(func.count()).select_from(Department).where(Department.company_id == int(company_id))

        if is_enabled is True:
            count_stmt = count_stmt.where(Department.is_enabled.is_(True))
        elif is_enabled is False:
            count_stmt = count_stmt.where(Department.is_enabled.is_(False))

        if filters.get("faculty_id"):
            count_stmt = count_stmt.where(Department.faculty_id == int(filters["faculty_id"]))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            count_stmt = count_stmt.where(
                func.lower(func.coalesce(Department.name, "")).like(like)
                | func.lower(func.coalesce(Department.code, "")).like(like)
            )

        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [DepartmentListRow(**r._asdict()) for r in rows]
        return shaped, total, has_more

        # =========================================================
        # DEPARTMENT: LIST page
        # =========================================================

    def list_departments_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[DepartmentListRow], int, int]:
        base = self._department_base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        # count (subquery)
        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)

        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = base.order_by(Department.id.desc()).offset(offset).limit(per_page)

        rows = list(self.s.execute(base).all())
        shaped = [DepartmentListRow(**r._asdict()) for r in rows]
        return shaped, total, pages

        # =========================================================
        # DEPARTMENT: SHAPER (final JSON row)
        # =========================================================

    def shape_department_list_row(self, r: DepartmentListRow) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "name": r.name,
            "code": r.code,
            "faculty_id": int(r.faculty_id),
            "faculty_name": r.faculty_name,
            "is_enabled": bool(r.is_enabled),
            "courses_count": int(r.courses_count or 0),
        }


    # =========================================================
    # DEPARTMENT: DETAIL
    # =========================================================
    def get_department_detail(
            self,
            *,
            company_id: int,
            department_id: int,
    ) -> Optional[DepartmentDetailRow]:
        stmt = (
            select(
                Department.id.label("id"),
                Department.faculty_id.label("faculty_id"),
                Faculty.name.label("faculty_name"),
                Faculty.code.label("faculty_code"),
                Department.name.label("name"),
                Department.code.label("code"),
                Department.is_enabled.label("is_enabled"),
                func.count(Course.id).label("courses_count"),
                Department.created_at.label("created_at"),
                Department.updated_at.label("updated_at"),
            )
            .select_from(Department)
            .outerjoin(
                Faculty,
                and_(
                    Faculty.id == Department.faculty_id,
                    Faculty.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Course,
                and_(
                    Course.department_id == Department.id,
                    Course.company_id == int(company_id),
                ),
            )
            .where(
                Department.company_id == int(company_id),
                Department.id == int(department_id),
            )
            .group_by(
                Department.id,
                Department.faculty_id,
                Faculty.name,
                Faculty.code,
                Department.name,
                Department.code,
                Department.is_enabled,
                Department.created_at,
                Department.updated_at,
            )
        )

        row = self.s.execute(stmt).first()
        return DepartmentDetailRow(**row._asdict()) if row else None

    def department_courses_preview(
            self,
            *,
            company_id: int,
            department_id: int,
            limit: int = 5,
    ) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Course.id.label("id"),
                Course.title.label("title"),
                Course.code.label("code"),
                Semester.number.label("semester_number"),
                Semester.name.label("semester_name"),
                AcademicYear.name.label("academic_year_name"),
            )
            .select_from(Course)
            .outerjoin(
                Semester,
                and_(
                    Semester.id == Course.semester_id,
                    Semester.company_id == int(company_id),
                ),
            )
            .outerjoin(
                AcademicYear,
                and_(
                    AcademicYear.id == Semester.academic_year_id,
                    AcademicYear.company_id == int(company_id),
                ),
            )
            .where(
                Course.company_id == int(company_id),
                Course.department_id == int(department_id),
            )
            .order_by(Course.id.asc())
            .limit(int(limit))
        )

        rows = self.s.execute(stmt).all()

        return [
            {
                "id": int(r.id),
                "title": r.title,
                "code": r.code,
                "semester_label": self._semester_display_name(
                    r.semester_number,
                    r.semester_name,
                    r.academic_year_name,
                ),
            }
            for r in rows
        ]

    def shape_department_detail_row(
            self,
            r: DepartmentDetailRow,
            *,
            courses_preview: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "name": r.name,
            "code": r.code,
            "is_enabled": bool(r.is_enabled),
            "faculty": {
                "id": int(r.faculty_id),
                "name": r.faculty_name,
                "code": r.faculty_code,
            },
            "courses_count": int(r.courses_count or 0),
            "courses_preview": courses_preview,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }




    # =========================================================
    # ACADEMIC YEAR: BASE STMT
    # =========================================================
    def _academic_year_base_stmt(
            self,
            *,
            company_id: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ):
        stmt = (
            select(
                AcademicYear.id.label("id"),
                AcademicYear.name.label("name"),
                AcademicYear.is_enabled.label("is_enabled"),
                func.count(Semester.id).label("semesters_count"),
            )
            .select_from(AcademicYear)
            .outerjoin(
                Semester,
                and_(
                    Semester.academic_year_id == AcademicYear.id,
                    Semester.company_id == int(company_id),
                ),
            )
            .where(AcademicYear.company_id == int(company_id))
            .group_by(
                AcademicYear.id,
                AcademicYear.name,
                AcademicYear.is_enabled,
            )
        )

        if is_enabled is True:
            stmt = stmt.where(AcademicYear.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(AcademicYear.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(func.lower(func.coalesce(AcademicYear.name, "")).like(like))

        return stmt


    # =========================================================
    # ACADEMIC YEAR: LIST cursor
    # =========================================================
    def list_academic_years_cursor(
        self,
        *,
        company_id: int,
        limit: int,
        last_id: Optional[int],
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[List[AcademicYearListRow], int, bool]:

        base = self._academic_year_base_stmt(
            company_id=company_id,
            filters=filters,
            is_enabled=is_enabled,
        )

        if last_id:
            base = base.where(AcademicYear.id < int(last_id))

        base = base.order_by(AcademicYear.id.desc()).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        # total count
        count_stmt = select(func.count()).select_from(AcademicYear).where(
            AcademicYear.company_id == int(company_id)
        )

        if is_enabled is True:
            count_stmt = count_stmt.where(AcademicYear.is_enabled.is_(True))
        elif is_enabled is False:
            count_stmt = count_stmt.where(AcademicYear.is_enabled.is_(False))

        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [AcademicYearListRow(**r._asdict()) for r in rows]
        return shaped, total, has_more



    # =========================================================
    # ACADEMIC YEAR: LIST page
    # =========================================================
    def list_academic_years_page(
        self,
        *,
        company_id: int,
        page: int,
        per_page: int,
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[List[AcademicYearListRow], int, int]:

        base = self._academic_year_base_stmt(
            company_id=company_id,
            filters=filters,
            is_enabled=is_enabled,
        )

        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)

        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = base.order_by(AcademicYear.id.desc()).offset(offset).limit(per_page)

        rows = list(self.s.execute(base).all())
        shaped = [AcademicYearListRow(**r._asdict()) for r in rows]

        return shaped, total, pages

    def shape_academic_year_list_row(self, r: AcademicYearListRow) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "name": r.name,
            "is_enabled": bool(r.is_enabled),
            "semesters_count": int(r.semesters_count or 0),
        }


    # =========================================================
    # SEMESTER: BASE STMT
    # =========================================================
    def _semester_base_stmt(
            self,
            *,
            company_id: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ):
        stmt = (
            select(
                Semester.id.label("id"),
                Semester.number.label("number"),
                Semester.name.label("name"),
                Semester.academic_year_id.label("academic_year_id"),
                AcademicYear.name.label("academic_year_name"),
                Semester.is_enabled.label("is_enabled"),
                func.count(Course.id).label("courses_count"),
            )
            .select_from(Semester)
            .outerjoin(
                AcademicYear,
                and_(
                    AcademicYear.id == Semester.academic_year_id,
                    AcademicYear.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Course,
                and_(
                    Course.semester_id == Semester.id,
                    Course.company_id == int(company_id),
                ),
            )
            .where(Semester.company_id == int(company_id))
            .group_by(
                Semester.id,
                Semester.number,
                Semester.name,
                Semester.academic_year_id,
                AcademicYear.name,
                Semester.is_enabled,
            )
        )

        if filters.get("academic_year_id"):
            stmt = stmt.where(Semester.academic_year_id == int(filters["academic_year_id"]))

        if is_enabled is True:
            stmt = stmt.where(Semester.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(Semester.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(Semester.name, "")).like(like)
                | func.cast(Semester.number, db.String).like(f"%{search}%")
                | func.lower(func.coalesce(AcademicYear.name, "")).like(like)
            )

        return stmt



    # =========================================================
    # SEMESTER: LIST cursor (descending number)
    # =========================================================
    def list_semesters_cursor(
        self,
        *,
        company_id: int,
        limit: int,
        last_no: Optional[int],
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[List[SemesterListRow], int, bool]:
        base = self._semester_base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        if last_no:
            base = base.where(Semester.number < int(last_no))

        base = base.order_by(Semester.number.desc()).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        # total count aligned with filters
        count_stmt = select(func.count()).select_from(Semester).where(Semester.company_id == int(company_id))

        if filters.get("academic_year_id"):
            count_stmt = count_stmt.where(Semester.academic_year_id == int(filters["academic_year_id"]))

        if is_enabled is True:
            count_stmt = count_stmt.where(Semester.is_enabled.is_(True))
        elif is_enabled is False:
            count_stmt = count_stmt.where(Semester.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            count_stmt = count_stmt.where(
                func.lower(func.coalesce(Semester.name, "")).like(like)
                | func.cast(Semester.number, db.String).like(f"%{search}%")
            )

        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [SemesterListRow(**r._asdict()) for r in rows]
        return shaped, total, has_more


    # =========================================================
    # SEMESTER: LIST page
    # =========================================================
    def list_semesters_page(
        self,
        *,
        company_id: int,
        page: int,
        per_page: int,
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[List[SemesterListRow], int, int]:
        base = self._semester_base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)

        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = base.order_by(Semester.number.desc()).offset(offset).limit(per_page)

        rows = list(self.s.execute(base).all())
        shaped = [SemesterListRow(**r._asdict()) for r in rows]
        return shaped, total, pages

    def shape_semester_list_row(self, r: SemesterListRow) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "number": int(r.number),
            "name": self._semester_name_only(r.number, r.name),
            "academic_year_id": int(r.academic_year_id),
            "academic_year_name": r.academic_year_name,
            "display_name": self._semester_display_name(r.number, r.name, r.academic_year_name),
            "is_enabled": bool(r.is_enabled),
            "courses_count": int(r.courses_count or 0),
        }

    def get_semester_detail(
            self,
            *,
            company_id: int,
            semester_id: int,
    ) -> Optional[SemesterDetailRow]:
        stmt = (
            select(
                Semester.id.label("id"),
                Semester.number.label("number"),
                Semester.name.label("name"),
                Semester.academic_year_id.label("academic_year_id"),
                AcademicYear.name.label("academic_year_name"),
                Semester.is_enabled.label("is_enabled"),
                func.count(Course.id).label("courses_count"),
                Semester.created_at.label("created_at"),
                Semester.updated_at.label("updated_at"),
            )
            .select_from(Semester)
            .outerjoin(
                AcademicYear,
                and_(
                    AcademicYear.id == Semester.academic_year_id,
                    AcademicYear.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Course,
                and_(
                    Course.semester_id == Semester.id,
                    Course.company_id == int(company_id),
                ),
            )
            .where(
                Semester.company_id == int(company_id),
                Semester.id == int(semester_id),
            )
            .group_by(
                Semester.id,
                Semester.number,
                Semester.name,
                Semester.academic_year_id,
                AcademicYear.name,
                Semester.is_enabled,
                Semester.created_at,
                Semester.updated_at,
            )
        )

        row = self.s.execute(stmt).first()
        return SemesterDetailRow(**row._asdict()) if row else None

    def semester_courses_preview(
            self,
            *,
            company_id: int,
            semester_id: int,
            limit: int = 5,
    ) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Course.id.label("id"),
                Course.title.label("title"),
                Course.code.label("code"),
                Department.name.label("department_name"),
            )
            .select_from(Course)
            .outerjoin(
                Department,
                and_(
                    Department.id == Course.department_id,
                    Department.company_id == int(company_id),
                ),
            )
            .where(
                Course.company_id == int(company_id),
                Course.semester_id == int(semester_id),
            )
            .order_by(Course.id.asc())
            .limit(int(limit))
        )

        rows = self.s.execute(stmt).all()

        return [
            {
                "id": int(r.id),
                "title": r.title,
                "code": r.code,
                "department_name": r.department_name,
            }
            for r in rows
        ]

    def shape_semester_detail_row(
            self,
            r: SemesterDetailRow,
            *,
            courses_preview: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "number": int(r.number),
            "name": self._semester_name_only(r.number, r.name),
            "is_enabled": bool(r.is_enabled),
            "academic_year": {
                "id": int(r.academic_year_id),
                "name": r.academic_year_name,
            },
            "courses_count": int(r.courses_count or 0),
            "courses_preview": courses_preview,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }



    # =========================================================
    # COURSE: BASE STMT
    # =========================================================
    def _course_base_stmt(
            self,
            *,
            company_id: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ):
        stmt = (
            select(
                Course.id.label("id"),
                Course.title.label("title"),
                Course.code.label("code"),
                Course.department_id.label("department_id"),
                Department.name.label("department_name"),
                Course.semester_id.label("semester_id"),
                Semester.number.label("semester_number"),
                Semester.name.label("semester_name"),
                AcademicYear.id.label("academic_year_id"),
                AcademicYear.name.label("academic_year_name"),
                Course.is_enabled.label("is_enabled"),
                func.count(Chapter.id).label("chapters_count"),
            )
            .select_from(Course)
            .outerjoin(
                Department,
                and_(
                    Department.id == Course.department_id,
                    Department.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Semester,
                and_(
                    Semester.id == Course.semester_id,
                    Semester.company_id == int(company_id),
                ),
            )
            .outerjoin(
                AcademicYear,
                and_(
                    AcademicYear.id == Semester.academic_year_id,
                    AcademicYear.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Chapter,
                and_(
                    Chapter.course_id == Course.id,
                    Chapter.company_id == int(company_id),
                ),
            )
            .where(Course.company_id == int(company_id))
            .group_by(
                Course.id,
                Course.title,
                Course.code,
                Course.department_id,
                Department.name,
                Course.semester_id,
                Semester.number,
                Semester.name,
                AcademicYear.id,
                AcademicYear.name,
                Course.is_enabled,
            )
        )

        if filters.get("department_id"):
            stmt = stmt.where(Course.department_id == int(filters["department_id"]))

        if filters.get("semester_id"):
            stmt = stmt.where(Course.semester_id == int(filters["semester_id"]))

        if is_enabled is True:
            stmt = stmt.where(Course.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(Course.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(Course.title, "")).like(like)
                | func.lower(func.coalesce(Course.code, "")).like(like)
                | func.lower(func.coalesce(Department.name, "")).like(like)
            )

        return stmt



    # =========================================================
    # COURSE: LIST cursor (descending id)
    # =========================================================
    def list_courses_cursor(
        self,
        *,
        company_id: int,
        limit: int,
        last_id: Optional[int],
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[List[CourseListRow], int, bool]:
        base = self._course_base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        if last_id:
            base = base.where(Course.id < int(last_id))

        base = base.order_by(Course.id.desc()).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        # total count aligned with filters
        count_stmt = select(func.count()).select_from(Course).where(Course.company_id == int(company_id))

        if filters.get("department_id"):
            count_stmt = count_stmt.where(Course.department_id == int(filters["department_id"]))
        if filters.get("semester_id"):
            count_stmt = count_stmt.where(Course.semester_id == int(filters["semester_id"]))

        if is_enabled is True:
            count_stmt = count_stmt.where(Course.is_enabled.is_(True))
        elif is_enabled is False:
            count_stmt = count_stmt.where(Course.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            count_stmt = count_stmt.where(
                func.lower(func.coalesce(Course.title, "")).like(like)
                | func.lower(func.coalesce(Course.code, "")).like(like)
            )

        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [CourseListRow(**r._asdict()) for r in rows]
        return shaped, total, has_more



    # =========================================================
    # COURSE: LIST page
    # =========================================================
    def list_courses_page(
        self,
        *,
        company_id: int,
        page: int,
        per_page: int,
        filters: Dict[str, Any],
        is_enabled: Optional[bool],
    ) -> Tuple[List[CourseListRow], int, int]:
        base = self._course_base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)

        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = base.order_by(Course.id.desc()).offset(offset).limit(per_page)

        rows = list(self.s.execute(base).all())
        shaped = [CourseListRow(**r._asdict()) for r in rows]
        return shaped, total, pages

    def shape_course_list_row(self, r: CourseListRow) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "title": r.title,
            "code": r.code,
            "department_id": int(r.department_id),
            "department_name": r.department_name,
            "semester_id": int(r.semester_id),
            "semester_label": self._semester_display_name(
                r.semester_number,
                r.semester_name,
                r.academic_year_name,
            ),
            "is_enabled": bool(r.is_enabled),
            "chapters_count": int(r.chapters_count or 0),
        }


    # =========================================================
    # COURSE: DETAIL
    # =========================================================
    def get_course_detail(
            self,
            *,
            company_id: int,
            course_id: int,
    ) -> Optional[CourseDetailRow]:
        stmt = (
            select(
                Course.id.label("id"),
                Course.title.label("title"),
                Course.code.label("code"),
                Course.description.label("description"),
                Course.department_id.label("department_id"),
                Department.name.label("department_name"),
                Faculty.id.label("faculty_id"),
                Faculty.name.label("faculty_name"),
                Course.semester_id.label("semester_id"),
                Semester.number.label("semester_number"),
                Semester.name.label("semester_name"),
                AcademicYear.id.label("academic_year_id"),
                AcademicYear.name.label("academic_year_name"),
                Course.is_enabled.label("is_enabled"),
                func.count(Chapter.id).label("chapters_count"),
                Course.created_at.label("created_at"),
                Course.updated_at.label("updated_at"),
            )
            .select_from(Course)
            .outerjoin(
                Department,
                and_(
                    Department.id == Course.department_id,
                    Department.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Faculty,
                and_(
                    Faculty.id == Department.faculty_id,
                    Faculty.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Semester,
                and_(
                    Semester.id == Course.semester_id,
                    Semester.company_id == int(company_id),
                ),
            )
            .outerjoin(
                AcademicYear,
                and_(
                    AcademicYear.id == Semester.academic_year_id,
                    AcademicYear.company_id == int(company_id),
                ),
            )
            .outerjoin(
                Chapter,
                and_(
                    Chapter.course_id == Course.id,
                    Chapter.company_id == int(company_id),
                ),
            )
            .where(
                Course.company_id == int(company_id),
                Course.id == int(course_id),
            )
            .group_by(
                Course.id,
                Course.title,
                Course.code,
                Course.description,
                Course.department_id,
                Department.name,
                Faculty.id,
                Faculty.name,
                Course.semester_id,
                Semester.number,
                Semester.name,
                AcademicYear.id,
                AcademicYear.name,
                Course.is_enabled,
                Course.created_at,
                Course.updated_at,
            )
        )

        row = self.s.execute(stmt).first()
        return CourseDetailRow(**row._asdict()) if row else None

    def course_chapters(
            self,
            *,
            company_id: int,
            course_id: int,
    ) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Chapter.id.label("id"),
                Chapter.number.label("number"),
                Chapter.title.label("title"),
                Chapter.is_enabled.label("is_enabled"),
            )
            .where(
                Chapter.company_id == int(company_id),
                Chapter.course_id == int(course_id),
            )
            .order_by(Chapter.number.asc())
        )

        rows = self.s.execute(stmt).all()

        return [
            {
                "id": int(r.id),
                "number": int(r.number),
                "title": r.title,
                "is_enabled": bool(r.is_enabled),
            }
            for r in rows
        ]
    def course_chapters_preview(
        self,
        *,
        company_id: int,
        course_id: int,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Chapter.number.label("number"),
                Chapter.title.label("title"),
                Chapter.is_enabled.label("is_enabled"),
            )
            .where(
                Chapter.company_id == int(company_id),
                Chapter.course_id == int(course_id),
            )
            .order_by(Chapter.number.asc())
            .limit(int(limit))
        )

        rows = self.s.execute(stmt).all()

        return [
            {
                "no": int(r.number),
                "title": r.title,
                "active": bool(r.is_enabled),
            }
            for r in rows
        ]

    def shape_course_detail_row(
            self,
            r: CourseDetailRow,
            *,
            chapters: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "title": r.title,
            "code": r.code,
            "description": r.description,
            "is_enabled": bool(r.is_enabled),
            "faculty": {
                "id": int(r.faculty_id),
                "name": r.faculty_name,
            },
            "department": {
                "id": int(r.department_id),
                "name": r.department_name,
            },
            "semester": {
                "id": int(r.semester_id),
                "number": int(r.semester_number),
                "name": self._semester_name_only(r.semester_number, r.semester_name),
            },
            "academic_year": {
                "id": int(r.academic_year_id),
                "name": r.academic_year_name,
            },
            "chapters_count": int(r.chapters_count or 0),
            "chapters": chapters,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }

    # =========================================================
    # CHAPTER: BASE STMT
    # =========================================================
    def _chapter_base_stmt(
            self,
            *,
            company_id: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ):
        stmt = (
            select(
                Chapter.id.label("id"),
                Chapter.course_id.label("course_id"),
                Course.title.label("course_title"),
                Chapter.number.label("number"),
                Chapter.title.label("title"),
                Chapter.is_enabled.label("is_enabled"),
            )
            .select_from(Chapter)
            .outerjoin(
                Course,
                and_(
                    Course.id == Chapter.course_id,
                    Course.company_id == int(company_id),
                ),
            )
            .where(Chapter.company_id == int(company_id))
        )

        if filters.get("course_id"):
            stmt = stmt.where(Chapter.course_id == int(filters["course_id"]))

        if is_enabled is True:
            stmt = stmt.where(Chapter.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(Chapter.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(Chapter.title, "")).like(like)
                | func.cast(Chapter.number, db.String).like(f"%{search}%")
                | func.lower(func.coalesce(Course.title, "")).like(like)
            )

        return stmt


    # =========================================================
    # CHAPTER: LIST cursor (descending number)
    # =========================================================
    def list_chapters_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            last_no: Optional[int],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[ChapterListRow], int, bool]:
        base = self._chapter_base_stmt(
            company_id=company_id,
            filters=filters,
            is_enabled=is_enabled,
        )

        if last_no:
            base = base.where(Chapter.number < int(last_no))

        base = base.order_by(Chapter.number.desc(), Chapter.id.desc()).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        count_stmt = select(func.count()).select_from(Chapter).where(
            Chapter.company_id == int(company_id)
        )

        if filters.get("course_id"):
            count_stmt = count_stmt.where(Chapter.course_id == int(filters["course_id"]))

        if is_enabled is True:
            count_stmt = count_stmt.where(Chapter.is_enabled.is_(True))
        elif is_enabled is False:
            count_stmt = count_stmt.where(Chapter.is_enabled.is_(False))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            count_stmt = count_stmt.where(
                func.lower(func.coalesce(Chapter.title, "")).like(like)
                | func.cast(Chapter.number, db.String).like(f"%{search}%")
            )

        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [ChapterListRow(**r._asdict()) for r in rows]
        return shaped, total, has_more



    # =========================================================
    # CHAPTER: LIST page
    # =========================================================
    def list_chapters_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[ChapterListRow], int, int]:
        base = self._chapter_base_stmt(
            company_id=company_id,
            filters=filters,
            is_enabled=is_enabled,
        )

        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)

        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = base.order_by(Chapter.number.desc(), Chapter.id.desc()).offset(offset).limit(per_page)

        rows = list(self.s.execute(base).all())
        shaped = [ChapterListRow(**r._asdict()) for r in rows]
        return shaped, total, pages

    def shape_chapter_list_row(self, r: ChapterListRow) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "course_id": int(r.course_id),
            "course_title": r.course_title,
            "number": int(r.number),
            "title": r.title,
            "is_enabled": bool(r.is_enabled),
        }

    # =========================================================
    # CHAPTER: DETAIL
    # =========================================================
    def get_chapter_detail(
            self,
            *,
            company_id: int,
            chapter_id: int,
    ) -> Optional[ChapterDetailRow]:
        stmt = (
            select(
                Chapter.id.label("id"),
                Chapter.course_id.label("course_id"),
                Course.title.label("course_title"),
                Chapter.number.label("number"),
                Chapter.title.label("title"),
                Chapter.description.label("description"),
                Chapter.is_enabled.label("is_enabled"),
                Chapter.created_at.label("created_at"),
                Chapter.updated_at.label("updated_at"),
            )
            .select_from(Chapter)
            .outerjoin(
                Course,
                and_(
                    Course.id == Chapter.course_id,
                    Course.company_id == int(company_id),
                ),
            )
            .where(
                Chapter.company_id == int(company_id),
                Chapter.id == int(chapter_id),
            )
            .limit(1)
        )

        row = self.s.execute(stmt).first()
        return ChapterDetailRow(**row._asdict()) if row else None

    def shape_chapter_detail_row(self, r: ChapterDetailRow) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "course": {
                "id": int(r.course_id),
                "title": r.course_title,
            },
            "number": int(r.number),
            "title": r.title,
            "description": r.description,
            "is_enabled": bool(r.is_enabled),
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }



