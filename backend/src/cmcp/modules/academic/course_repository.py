from __future__ import annotations

from typing import Any, Dict, List, Optional, Sequence, Set

from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session, selectinload

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository
from cmcp.modules.academic.models import Course, CourseOffering, CourseChapter, Department, Semester

try:
    from cmcp.modules.academic.models import Material  # type: ignore
except Exception:  # pragma: no cover
    Material = None  # type: ignore


class CourseRepository(BaseRepository[Course]):
    """
    Course-specific repository.

    Responsibilities:
    - database reads/writes
    - uniqueness checks
    - eager-loaded parent/child fetching
    - linked-material safety counts

    Business workflow stays in course_service.py.
    """

    def __init__(self, model: Any = None, session: Optional[Session] = None):
        # BaseService passes (model, session). This repository is always rooted at Course.
        super().__init__(Course, session)
        self.s: Session = session or db.session

        self.courses: BaseRepository[Course] = BaseRepository(Course, self.s)
        self.offerings: BaseRepository[CourseOffering] = BaseRepository(CourseOffering, self.s)
        self.chapters: BaseRepository[CourseChapter] = BaseRepository(CourseChapter, self.s)
        self.departments: BaseRepository[Department] = BaseRepository(Department, self.s)
        self.semesters: BaseRepository[Semester] = BaseRepository(Semester, self.s)

    # ------------------------------------------------------------------
    # Basic getters
    # ------------------------------------------------------------------
    def get_course(
        self,
        course_id: int,
        *,
        company_id: int,
        eager_load: Optional[Sequence[str]] = None,
    ) -> Optional[Course]:
        return self.courses.get(int(course_id), company_id=int(company_id), eager_load=eager_load)

    def get_offering(
        self,
        offering_id: int,
        *,
        company_id: int,
        eager_load: Optional[Sequence[str]] = None,
    ) -> Optional[CourseOffering]:
        return self.offerings.get(int(offering_id), company_id=int(company_id), eager_load=eager_load)

    def get_chapter(self, chapter_id: int, *, company_id: int) -> Optional[CourseChapter]:
        return self.chapters.get(int(chapter_id), company_id=int(company_id))

    def get_department(self, department_id: int, *, company_id: int) -> Optional[Department]:
        return self.departments.get(int(department_id), company_id=int(company_id))

    def get_semester(self, semester_id: int, *, company_id: int) -> Optional[Semester]:
        return self.semesters.get(int(semester_id), company_id=int(company_id))

    # ------------------------------------------------------------------
    # Eager-loaded getters for Frappe-style child table sync
    # ------------------------------------------------------------------
    def get_course_with_children(self, *, company_id: int, course_id: int) -> Optional[Course]:
        stmt = (
            select(Course)
            .where(
                Course.company_id == int(company_id),
                Course.id == int(course_id),
            )
            .options(
                selectinload(Course.offerings).selectinload(CourseOffering.chapters)
            )
            .limit(1)
        )
        return self.s.scalar(stmt)

    def get_offering_with_children(self, *, company_id: int, offering_id: int) -> Optional[CourseOffering]:
        stmt = (
            select(CourseOffering)
            .where(
                CourseOffering.company_id == int(company_id),
                CourseOffering.id == int(offering_id),
            )
            .options(selectinload(CourseOffering.chapters))
            .limit(1)
        )
        return self.s.scalar(stmt)

    # ------------------------------------------------------------------
    # Course uniqueness
    # ------------------------------------------------------------------
    def course_title_exists(self, *, company_id: int, title: str, exclude_id: Optional[int] = None) -> bool:
        conds = [
            Course.company_id == int(company_id),
            func.lower(Course.title) == func.lower((title or "").strip()),
        ]
        if exclude_id:
            conds.append(Course.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    def course_code_exists(self, *, company_id: int, code: Optional[str], exclude_id: Optional[int] = None) -> bool:
        code = (code or "").strip()
        if not code:
            return False

        conds = [
            Course.company_id == int(company_id),
            func.lower(Course.code) == func.lower(code),
        ]
        if exclude_id:
            conds.append(Course.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    # ------------------------------------------------------------------
    # Offering uniqueness
    # ------------------------------------------------------------------
    def offering_scope_exists(
        self,
        *,
        company_id: int,
        course_id: int,
        department_id: int,
        semester_id: Optional[int],
        exclude_id: Optional[int] = None,
    ) -> bool:
        conds = [
            CourseOffering.company_id == int(company_id),
            CourseOffering.course_id == int(course_id),
            CourseOffering.department_id == int(department_id),
        ]

        if semester_id is None:
            conds.append(CourseOffering.semester_id.is_(None))
        else:
            conds.append(CourseOffering.semester_id == int(semester_id))

        if exclude_id:
            conds.append(CourseOffering.id != int(exclude_id))

        return bool(self.s.scalar(select(exists().where(*conds))))

    def offering_custom_title_exists(
        self,
        *,
        company_id: int,
        course_id: int,
        custom_title: Optional[str],
        exclude_id: Optional[int] = None,
    ) -> bool:
        title = (custom_title or "").strip()
        if not title:
            return False

        conds = [
            CourseOffering.company_id == int(company_id),
            CourseOffering.course_id == int(course_id),
            func.lower(CourseOffering.custom_title) == func.lower(title),
        ]
        if exclude_id:
            conds.append(CourseOffering.id != int(exclude_id))

        return bool(self.s.scalar(select(exists().where(*conds))))

    # ------------------------------------------------------------------
    # Chapter uniqueness
    # ------------------------------------------------------------------
    def chapter_number_exists(
        self,
        *,
        company_id: int,
        offering_id: int,
        number: int,
        exclude_id: Optional[int] = None,
    ) -> bool:
        conds = [
            CourseChapter.company_id == int(company_id),
            CourseChapter.course_offering_id == int(offering_id),
            CourseChapter.number == int(number),
        ]
        if exclude_id:
            conds.append(CourseChapter.id != int(exclude_id))

        return bool(self.s.scalar(select(exists().where(*conds))))

    def chapter_title_exists(
        self,
        *,
        company_id: int,
        offering_id: int,
        title: str,
        exclude_id: Optional[int] = None,
    ) -> bool:
        title = (title or "").strip()
        if not title:
            return False

        conds = [
            CourseChapter.company_id == int(company_id),
            CourseChapter.course_offering_id == int(offering_id),
            func.lower(CourseChapter.title) == func.lower(title),
        ]
        if exclude_id:
            conds.append(CourseChapter.id != int(exclude_id))

        return bool(self.s.scalar(select(exists().where(*conds))))

    # ------------------------------------------------------------------
    # Linked-material safety counts
    # ------------------------------------------------------------------
    def count_materials_for_offering(self, *, company_id: int, offering_id: int) -> int:
        if Material is None:
            return 0

        stmt = select(func.count()).select_from(Material).where(  # type: ignore[arg-type]
            Material.company_id == int(company_id),  # type: ignore[attr-defined]
            Material.course_offering_id == int(offering_id),  # type: ignore[attr-defined]
        )
        return int(self.s.scalar(stmt) or 0)

    def count_materials_for_chapter(self, *, company_id: int, chapter_id: int) -> int:
        if Material is None:
            return 0

        stmt = select(func.count()).select_from(Material).where(  # type: ignore[arg-type]
            Material.company_id == int(company_id),  # type: ignore[attr-defined]
            Material.chapter_id == int(chapter_id),  # type: ignore[attr-defined]
        )
        return int(self.s.scalar(stmt) or 0)

    # ------------------------------------------------------------------
    # Writes
    # ------------------------------------------------------------------
    def create_course(self, data: Dict[str, Any]) -> Course:
        return self.courses.create(data)

    def create_offering(self, data: Dict[str, Any]) -> CourseOffering:
        return self.offerings.create(data)

    def create_chapter(self, data: Dict[str, Any]) -> CourseChapter:
        return self.chapters.create(data)

    # ------------------------------------------------------------------
    # Child-row list helpers
    # ------------------------------------------------------------------
    def list_offerings_for_course(self, *, company_id: int, course_id: int) -> List[CourseOffering]:
        stmt = (
            select(CourseOffering)
            .where(
                CourseOffering.company_id == int(company_id),
                CourseOffering.course_id == int(course_id),
            )
            .options(selectinload(CourseOffering.chapters))
            .order_by(CourseOffering.id.asc())
        )
        return list(self.s.scalars(stmt).all())

    def list_chapters_for_offering(self, *, company_id: int, offering_id: int) -> List[CourseChapter]:
        stmt = (
            select(CourseChapter)
            .where(
                CourseChapter.company_id == int(company_id),
                CourseChapter.course_offering_id == int(offering_id),
            )
            .order_by(CourseChapter.number.asc(), CourseChapter.id.asc())
        )
        return list(self.s.scalars(stmt).all())

    def existing_chapter_ids_for_offering(self, *, company_id: int, offering_id: int) -> Set[int]:
        stmt = select(CourseChapter.id).where(
            CourseChapter.company_id == int(company_id),
            CourseChapter.course_offering_id == int(offering_id),
        )
        return {int(x) for x in self.s.scalars(stmt).all()}