from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Set, List, Dict, Any, Tuple

from sqlalchemy import exists, func, select, and_
from sqlalchemy.orm import Session

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository

from cmcp.modules.auth.models import User
from cmcp.modules.education_people.models import StudentProfile, Classroom, StaffProfile
from cmcp.modules.academic.models import Faculty, Department

@dataclass
class StudentListRow:
    id: int
    full_name: str
    student_id: str
    department_name: Optional[str]
    is_enabled: bool
class EducationPeopleRepo:
    def __init__(self, session: Optional[Session] = None):
        self.s: Session = session or db.session

        # same as AcademicRepo
        self.classrooms = BaseRepository(Classroom, self.s)
        self.students = BaseRepository(StudentProfile, self.s)
        self.staff = BaseRepository(StaffProfile, self.s)

    # -------------------------
    # Classroom uniqueness
    # -------------------------
    def classroom_name_exists(self, *, company_id: int, name: str, exclude_id: Optional[int] = None) -> bool:
        conds = [
            Classroom.company_id == int(company_id),
            func.lower(Classroom.name) == func.lower(name.strip()),
        ]
        if exclude_id:
            conds.append(Classroom.id != int(exclude_id))
        return bool(self.s.scalar(select(exists().where(*conds))))

    # -------------------------
    # Registration duplicate checks
    # -------------------------
    def user_by_username(self, *, student_id: str) -> Optional[User]:
        return self.s.query(User).filter(User.username == student_id.strip()).first()

    def user_by_email(self, *, email: str) -> Optional[User]:
        return self.s.query(User).filter(func.lower(User.email) == func.lower(email.strip())).first()

    def student_profile_by_student_id(self, *, company_id: int, student_id: str) -> Optional[StudentProfile]:
        return self.s.query(StudentProfile).filter(
            StudentProfile.company_id == int(company_id),
            StudentProfile.student_id == student_id.strip(),
        ).first()

    # -------------------------
    # Foreign-key existence checks
    # -------------------------
    def faculty_exists(self, *, company_id: int, faculty_id: int) -> bool:
        return bool(
            self.s.scalar(
                select(exists().where(
                    Faculty.company_id == int(company_id),
                    Faculty.id == int(faculty_id),
                ))
            )
        )

    def department_exists(self, *, company_id: int, department_id: int, faculty_id: int) -> bool:
        return bool(
            self.s.scalar(
                select(exists().where(
                    Department.company_id == int(company_id),
                    Department.id == int(department_id),
                    Department.faculty_id == int(faculty_id),
                ))
            )
        )

    def classroom_exists(self, *, company_id: int, classroom_id: int) -> bool:
        return bool(
            self.s.scalar(
                select(exists().where(
                    Classroom.company_id == int(company_id),
                    Classroom.id == int(classroom_id),
                ))
            )
        )

    # -------------------------
    # Pending approvals (for admin dashboard)
    # -------------------------
    def pending_approval_user_ids(self, *, company_id: int) -> List[int]:
        # optional helper if you need it later
        # NOTE: User is not tenant-aware in your schema, so we join through profiles/affiliations when needed.
        stmt = select(StudentProfile.user_id).where(StudentProfile.company_id == int(company_id)).distinct()
        return list(self.s.scalars(stmt).all())

        # =========================================================
        # BASE STMT
        # =========================================================

    def _base_stmt(
            self,
            *,
            company_id: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ):
        stmt = (
            select(
                StudentProfile.id.label("id"),
                StudentProfile.full_name.label("full_name"),
                StudentProfile.student_id.label("student_id"),
                Department.name.label("department_name"),
                StudentProfile.is_enabled.label("is_enabled"),
            )
            .select_from(StudentProfile)
            .outerjoin(
                Department,
                and_(
                    Department.id == StudentProfile.department_id,
                    Department.company_id == int(company_id),
                ),
            )
            .where(StudentProfile.company_id == int(company_id))
        )

        # enabled filter
        if is_enabled is True:
            stmt = stmt.where(StudentProfile.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(StudentProfile.is_enabled.is_(False))

        # filters
        if filters.get("department_id"):
            stmt = stmt.where(StudentProfile.department_id == int(filters["department_id"]))

        # search
        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(StudentProfile.full_name, "")).like(like)
                | func.lower(func.coalesce(StudentProfile.student_id, "")).like(like)
            )

        return stmt

        # =========================================================
        # LIST cursor (descending id)
        # =========================================================

    def list_students_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            last_id: Optional[int],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[StudentListRow], int, bool]:
        base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        if last_id:
            base = base.where(StudentProfile.id < int(last_id))

        base = base.order_by(StudentProfile.id.desc()).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        # total count aligned with filters
        count_stmt = select(func.count()).select_from(StudentProfile).where(
            StudentProfile.company_id == int(company_id))

        if is_enabled is True:
            count_stmt = count_stmt.where(StudentProfile.is_enabled.is_(True))
        elif is_enabled is False:
            count_stmt = count_stmt.where(StudentProfile.is_enabled.is_(False))

        if filters.get("department_id"):
            count_stmt = count_stmt.where(StudentProfile.department_id == int(filters["department_id"]))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            count_stmt = count_stmt.where(
                func.lower(func.coalesce(StudentProfile.full_name, "")).like(like)
                | func.lower(func.coalesce(StudentProfile.student_id, "")).like(like)
            )

        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [StudentListRow(**r._asdict()) for r in rows]
        return shaped, total, has_more

        # =========================================================
        # LIST page
        # =========================================================

    def list_students_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[StudentListRow], int, int]:
        base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        # count (subquery)
        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)
        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = base.order_by(StudentProfile.id.desc()).offset(offset).limit(per_page)
        rows = list(self.s.execute(base).all())
        shaped = [StudentListRow(**r._asdict()) for r in rows]
        return shaped, total, pages

        # optional: if you want to add external_base later (like materials)

    def shape_student_list_row(self, r: StudentListRow, *, external_base: str) -> Dict[str, Any]:
        return {
            "id": int(r.id),
            "full_name": r.full_name,
            "student_id": r.student_id,
            "department_name": r.department_name,
            "is_enabled": bool(r.is_enabled),
        }
