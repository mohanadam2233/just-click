from __future__ import annotations

from typing import Optional

from sqlalchemy import select, func

from cmcp.config.database import db
from cmcp.modules.education_people.models import Classroom, StudentProfile, StaffProfile


class EducationPeopleRepo:
    def __init__(self):
        self.s = db.session

        # allow: self.repo.classrooms.get(...)
        self.classrooms = _GetById(Classroom, session=self.s)
        self.students = _GetById(StudentProfile, session=self.s)
        self.staff = _GetById(StaffProfile, session=self.s)

    # -------------------------
    # Classroom checks
    # -------------------------
    def classroom_name_exists(self, *, company_id: int, name: str, exclude_id: Optional[int] = None) -> bool:
        stmt = select(func.count()).select_from(Classroom).where(
            Classroom.company_id == company_id,
            Classroom.name == name,
        )
        if exclude_id:
            stmt = stmt.where(Classroom.id != int(exclude_id))
        return (self.s.scalar(stmt) or 0) > 0

    # -------------------------
    # Student checks
    # -------------------------
    def student_user_exists(self, *, company_id: int, user_id: int, exclude_id: Optional[int] = None) -> bool:
        stmt = select(func.count()).select_from(StudentProfile).where(
            StudentProfile.company_id == company_id,
            StudentProfile.user_id == int(user_id),
        )
        if exclude_id:
            stmt = stmt.where(StudentProfile.id != int(exclude_id))
        return (self.s.scalar(stmt) or 0) > 0

    def student_id_exists(self, *, company_id: int, student_id: str, exclude_id: Optional[int] = None) -> bool:
        stmt = select(func.count()).select_from(StudentProfile).where(
            StudentProfile.company_id == company_id,
            StudentProfile.student_id == student_id,
        )
        if exclude_id:
            stmt = stmt.where(StudentProfile.id != int(exclude_id))
        return (self.s.scalar(stmt) or 0) > 0

    # -------------------------
    # Staff checks
    # -------------------------
    def staff_user_exists(self, *, company_id: int, user_id: int, exclude_id: Optional[int] = None) -> bool:
        stmt = select(func.count()).select_from(StaffProfile).where(
            StaffProfile.company_id == company_id,
            StaffProfile.user_id == int(user_id),
        )
        if exclude_id:
            stmt = stmt.where(StaffProfile.id != int(exclude_id))
        return (self.s.scalar(stmt) or 0) > 0

    def staff_id_exists(self, *, company_id: int, staff_id: str, exclude_id: Optional[int] = None) -> bool:
        if not staff_id:
            return False
        stmt = select(func.count()).select_from(StaffProfile).where(
            StaffProfile.company_id == company_id,
            StaffProfile.staff_id == staff_id,
        )
        if exclude_id:
            stmt = stmt.where(StaffProfile.id != int(exclude_id))
        return (self.s.scalar(stmt) or 0) > 0


class _GetById:
    def __init__(self, model, session):
        self.model = model
        self.s = session

    def get(self, _id: int, *, company_id: int):
        return self.s.scalar(
            select(self.model).where(self.model.company_id == company_id, self.model.id == int(_id))
        )
