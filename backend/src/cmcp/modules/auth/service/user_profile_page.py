from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.exceptions import NotFound, BadRequest

from cmcp.modules.auth.models import LinkedEntityTypeEnum
from cmcp.modules.auth.repo.user_profile import UserProfileRepository

log = logging.getLogger(__name__)


class UserProfilePageService:
    """
    UI profile page service:
    - get my profile page
    - update my profile page

    NOTE:
    id in response = profile table id (student_profiles.id or staff_profiles.id)
    user_id in response = users.id
    """

    def __init__(self, repo: Optional[UserProfileRepository] = None):
        self.repo = repo or UserProfileRepository()

    def _resolve_current_profile(self, *, user_id: int, active_company_id: Optional[int]) -> tuple:
        user = self.repo.get_user_with_affiliations(int(user_id))
        if not user:
            raise NotFound("User not found.")

        aff = self.repo.pick_affiliation(user=user, active_company_id=active_company_id)
        if not aff:
            raise BadRequest("User has no affiliation.")

        profile_kind = None
        profile = None

        if aff.linked_entity_type == LinkedEntityTypeEnum.STUDENT_PROFILE and aff.linked_entity_id:
            profile_kind = "student"
            profile = self.repo.get_student_profile(
                profile_id=int(aff.linked_entity_id),
                company_id=int(aff.company_id),
            )

        elif aff.linked_entity_type == LinkedEntityTypeEnum.STAFF_PROFILE and aff.linked_entity_id:
            profile_kind = "staff"
            profile = self.repo.get_staff_profile(
                profile_id=int(aff.linked_entity_id),
                company_id=int(aff.company_id),
            )

        else:
            profile_kind = (
                "student"
                if str(getattr(user.user_type, "value", user.user_type)) == "student"
                else "staff"
            )

        return user, aff, profile_kind, profile

    def _faculty_out(self, faculty):
        if not faculty:
            return None
        return {
            "id": int(faculty.id),
            "name": faculty.name,
        }

    def _department_out(self, department):
        if not department:
            return None
        return {
            "id": int(department.id),
            "name": department.name,
        }

    def _classroom_out(self, classroom):
        if not classroom:
            return None
        return {
            "id": int(classroom.id),
            "name": classroom.name,
            "room_number": classroom.room_number,
        }

    def get_my_profile_page(
        self,
        *,
        user_id: int,
        active_company_id: Optional[int] = None,
        roles: Optional[list[str]] = None,
    ) -> dict:
        user, aff, profile_kind, profile = self._resolve_current_profile(
            user_id=int(user_id),
            active_company_id=active_company_id,
        )

        faculty_data = None
        department_data = None
        classroom_data = None
        full_name = None
        student_id = None
        staff_id = None
        profile_id = None
        profile_is_enabled = None

        if profile_kind == "student" and profile:
            profile_id = int(profile.id)
            profile_is_enabled = bool(profile.is_enabled)
            full_name = profile.full_name
            student_id = profile.student_id

            faculty = self.repo.get_faculty(
                faculty_id=profile.faculty_id,
                company_id=int(aff.company_id),
            )
            department = self.repo.get_department(
                department_id=profile.department_id,
                company_id=int(aff.company_id),
            )
            classroom = self.repo.get_classroom(
                classroom_id=profile.classroom_id,
                company_id=int(aff.company_id),
            )

            faculty_data = self._faculty_out(faculty)
            department_data = self._department_out(department)
            classroom_data = self._classroom_out(classroom)

        elif profile_kind == "staff" and profile:
            profile_id = int(profile.id)
            profile_is_enabled = bool(profile.is_enabled)
            full_name = profile.full_name
            staff_id = profile.staff_id

            faculty = self.repo.get_faculty(
                faculty_id=profile.faculty_id,
                company_id=int(aff.company_id),
            )
            department = self.repo.get_department(
                department_id=profile.department_id,
                company_id=int(aff.company_id),
            )

            faculty_data = self._faculty_out(faculty)
            department_data = self._department_out(department)
            classroom_data = None

        return {
            "id": profile_id,              # profile table id
            "user_id": int(user.id),       # users.id
            "username": user.username,
            "email": user.email,
            "status": getattr(user.status, "value", str(user.status)),
            "user_is_enabled": bool(user.is_enabled),
            "profile_is_enabled": profile_is_enabled,
            "profile_type": profile_kind,
            "full_name": full_name,
            "student_id": student_id,
            "staff_id": staff_id,
            "faculty": faculty_data,
            "department": department_data,
            "classroom": classroom_data,
            "roles": roles or [],
        }

    def update_my_profile_page(
        self,
        *,
        user_id: int,
        active_company_id: Optional[int] = None,
        data: dict,
        roles: Optional[list[str]] = None,
    ) -> dict:
        user, aff, profile_kind, profile = self._resolve_current_profile(
            user_id=int(user_id),
            active_company_id=active_company_id,
        )

        if not profile:
            raise BadRequest("No linked profile found for this user.")

        payload = dict(data or {})

        # -------- user table updates --------
        if "email" in payload and payload["email"] is not None:
            email = str(payload["email"]).strip().lower()
            if not email:
                raise BadRequest("Email cannot be empty.")
            if self.repo.email_exists_for_other_user(email=email, exclude_user_id=int(user.id)):
                raise BadRequest("Email is already in use by another user.")
            user.email = email

        if "status" in payload and payload["status"] is not None:
            status = str(payload["status"]).strip()
            if not status:
                raise BadRequest("Status cannot be empty.")
            user.status = status

        if "user_is_enabled" in payload and payload["user_is_enabled"] is not None:
            user.is_enabled = bool(payload["user_is_enabled"])

        # -------- shared profile updates --------
        if "full_name" in payload and payload["full_name"] is not None:
            full_name = str(payload["full_name"]).strip()
            if not full_name:
                raise BadRequest("Full name cannot be empty.")
            profile.full_name = full_name

        if "profile_is_enabled" in payload and payload["profile_is_enabled"] is not None:
            profile.is_enabled = bool(payload["profile_is_enabled"])

        # -------- student-specific --------
        if profile_kind == "student":
            if "student_id" in payload and payload["student_id"] is not None:
                student_id = str(payload["student_id"]).strip()
                if not student_id:
                    raise BadRequest("student_id cannot be empty.")
                profile.student_id = student_id

            if "faculty_id" in payload and payload["faculty_id"] is not None:
                faculty = self.repo.get_faculty(
                    faculty_id=int(payload["faculty_id"]),
                    company_id=int(aff.company_id),
                )
                if not faculty:
                    raise BadRequest("Faculty not found.")
                profile.faculty_id = int(payload["faculty_id"])

            if "department_id" in payload and payload["department_id"] is not None:
                department = self.repo.get_department(
                    department_id=int(payload["department_id"]),
                    company_id=int(aff.company_id),
                )
                if not department:
                    raise BadRequest("Department not found.")
                profile.department_id = int(payload["department_id"])

            if "classroom_id" in payload:
                classroom_id = payload["classroom_id"]
                if classroom_id is None:
                    profile.classroom_id = None
                else:
                    classroom = self.repo.get_classroom(
                        classroom_id=int(classroom_id),
                        company_id=int(aff.company_id),
                    )
                    if not classroom:
                        raise BadRequest("Classroom not found.")
                    profile.classroom_id = int(classroom_id)

        # -------- staff-specific --------
        elif profile_kind == "staff":
            if "staff_id" in payload and payload["staff_id"] is not None:
                staff_id = str(payload["staff_id"]).strip()
                profile.staff_id = staff_id or None

            if "faculty_id" in payload:
                faculty_id = payload["faculty_id"]
                if faculty_id is None:
                    profile.faculty_id = None
                else:
                    faculty = self.repo.get_faculty(
                        faculty_id=int(faculty_id),
                        company_id=int(aff.company_id),
                    )
                    if not faculty:
                        raise BadRequest("Faculty not found.")
                    profile.faculty_id = int(faculty_id)

            if "department_id" in payload:
                department_id = payload["department_id"]
                if department_id is None:
                    profile.department_id = None
                else:
                    department = self.repo.get_department(
                        department_id=int(department_id),
                        company_id=int(aff.company_id),
                    )
                    if not department:
                        raise BadRequest("Department not found.")
                    profile.department_id = int(department_id)

            # classroom must not be updated for staff
            if "classroom_id" in payload and payload["classroom_id"] is not None:
                raise BadRequest("classroom_id is only allowed for student profiles.")

        try:
            self.repo.flush()
            self.repo.commit()
        except IntegrityError:
            self.repo.rollback()
            raise BadRequest("Database constraint error.")
        except SQLAlchemyError as e:
            self.repo.rollback()
            log.exception("Profile update failed: %s", e)
            raise BadRequest("Failed to update profile.")

        return self.get_my_profile_page(
            user_id=int(user.id),
            active_company_id=int(aff.company_id),
            roles=roles or [],
        )