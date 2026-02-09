from __future__ import annotations

from typing import Optional, List, Set, Type, Any

from sqlalchemy import select, exists, func
from sqlalchemy.orm import Session

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository
from cmcp.modules.academic.models import Faculty, Department, AcademicYear, Semester, Course, Chapter


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
    def existing_ids(self, *, model: Type[Any], company_id: int, ids: List[int]) -> Set[int]:
        if not ids:
            return set()
        stmt = select(model.id).where(model.id.in_([int(x) for x in ids]))
        if hasattr(model, "company_id"):
            stmt = stmt.where(model.company_id == int(company_id))
        return set(self.s.scalars(stmt).all())
