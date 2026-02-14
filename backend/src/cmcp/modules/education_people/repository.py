from __future__ import annotations

from typing import Optional, Set, List

from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository

from cmcp.modules.auth.models import User
from cmcp.modules.education_people.models import StudentProfile, Classroom, StaffProfile
from cmcp.modules.academic.models import Faculty, Department


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