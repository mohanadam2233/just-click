from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from cmcp.config.database import db
from cmcp.modules.auth.models import User, UserAffiliation
from cmcp.modules.education_people.models import StudentProfile, StaffProfile, Classroom
from cmcp.modules.academic.models import Faculty, Department


class UserProfileRepository:
    """
    Dedicated repository for profile-page read/update operations.
    """

    def get_user_with_affiliations(self, user_id: int) -> Optional[User]:
        stmt = (
            select(User)
            .options(selectinload(User.affiliations))
            .where(User.id == int(user_id))
        )
        return db.session.scalar(stmt)

    def pick_affiliation(
        self,
        *,
        user: User,
        active_company_id: Optional[int] = None,
    ) -> Optional[UserAffiliation]:
        affs = list(user.affiliations or [])
        if not affs:
            return None

        if active_company_id is not None:
            exact = next(
                (a for a in affs if int(a.company_id) == int(active_company_id)),
                None,
            )
            if exact:
                return exact

        enabled_affs = [a for a in affs if bool(a.is_enabled)]
        primary = next((a for a in enabled_affs if bool(a.is_primary)), None)
        if primary:
            return primary

        if enabled_affs:
            return enabled_affs[0]

        return affs[0]

    def get_student_profile(self, *, profile_id: int, company_id: int) -> Optional[StudentProfile]:
        stmt = (
            select(StudentProfile)
            .where(
                StudentProfile.id == int(profile_id),
                StudentProfile.company_id == int(company_id),
            )
        )
        return db.session.scalar(stmt)

    def get_staff_profile(self, *, profile_id: int, company_id: int) -> Optional[StaffProfile]:
        stmt = (
            select(StaffProfile)
            .where(
                StaffProfile.id == int(profile_id),
                StaffProfile.company_id == int(company_id),
            )
        )
        return db.session.scalar(stmt)

    def get_faculty(self, *, faculty_id: Optional[int], company_id: Optional[int] = None) -> Optional[Faculty]:
        if not faculty_id:
            return None

        stmt = select(Faculty).where(Faculty.id == int(faculty_id))
        if company_id is not None and hasattr(Faculty, "company_id"):
            stmt = stmt.where(Faculty.company_id == int(company_id))
        return db.session.scalar(stmt)

    def get_department(self, *, department_id: Optional[int], company_id: Optional[int] = None) -> Optional[Department]:
        if not department_id:
            return None

        stmt = select(Department).where(Department.id == int(department_id))
        if company_id is not None and hasattr(Department, "company_id"):
            stmt = stmt.where(Department.company_id == int(company_id))
        return db.session.scalar(stmt)

    def get_classroom(self, *, classroom_id: Optional[int], company_id: Optional[int] = None) -> Optional[Classroom]:
        if not classroom_id:
            return None

        stmt = select(Classroom).where(Classroom.id == int(classroom_id))
        if company_id is not None:
            stmt = stmt.where(Classroom.company_id == int(company_id))
        return db.session.scalar(stmt)

    def email_exists_for_other_user(self, *, email: str, exclude_user_id: int) -> bool:
        stmt = select(User.id).where(
            User.email == email,
            User.id != int(exclude_user_id),
        )
        return db.session.scalar(stmt) is not None

    def flush(self) -> None:
        db.session.flush()

    def commit(self) -> None:
        db.session.commit()

    def rollback(self) -> None:
        db.session.rollback()