from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.exceptions import NotFound, BadRequest, Forbidden

from cmcp.common.cache import bump_user_profile
from cmcp.common.cache.session_manager import remove_session
from cmcp.common.security.password_rules import ensure_password_ok
from cmcp.common.security.passwords import hash_password
from cmcp.modules.auth.models import LinkedEntityTypeEnum, UserStatusEnum
from cmcp.modules.auth.repo.user_profile import UserProfileRepository

log = logging.getLogger(__name__)


class UserProfilePageService:
    """
    Current-user profile page service.

    Rules:
    - One API works for student / teacher / staff / admin.
    - Student can update only:
        full_name, password
    - Teacher/staff can update only:
        full_name, password
    - Admin-like users can update:
        email, full_name, staff_id, faculty_id, department_id,
        status, user_is_enabled, profile_is_enabled, password
    """

    BASIC_ALLOWED_FIELDS = {
        "full_name",
        "set_new_password",
        "new_password",
        "logout_from_all_devices",
    }

    ADMIN_ALLOWED_FIELDS = {
        "email",
        "full_name",
        "staff_id",
        "faculty_id",
        "department_id",
        "status",
        "user_is_enabled",
        "profile_is_enabled",
        "set_new_password",
        "new_password",
        "logout_from_all_devices",
    }

    PROTECTED_STUDENT_FIELDS = {
        "student_id",
        "faculty_id",
        "department_id",
        "classroom_id",
        "semester_id",
        "email",
        "status",
        "user_is_enabled",
        "profile_is_enabled",
        "staff_id",
    }

    PROTECTED_NON_ADMIN_STAFF_FIELDS = {
        "staff_id",
        "faculty_id",
        "department_id",
        "classroom_id",
        "semester_id",
        "student_id",
        "email",
        "status",
        "user_is_enabled",
        "profile_is_enabled",
    }

    def __init__(self, repo: Optional[UserProfileRepository] = None):
        self.repo = repo or UserProfileRepository()

    # ---------------------------------------------------------------------
    # Resolve helpers
    # ---------------------------------------------------------------------

    def _resolve_current_profile(
        self,
        *,
        user_id: int,
        active_company_id: Optional[int],
    ) -> tuple:
        user = self.repo.get_user_with_affiliations(int(user_id))
        if not user:
            raise NotFound("User not found.")

        aff = self.repo.pick_affiliation(
            user=user,
            active_company_id=active_company_id,
        )
        if not aff:
            raise BadRequest("User has no affiliation.")

        profile_kind = None
        profile = None

        if (
            aff.linked_entity_type == LinkedEntityTypeEnum.STUDENT_PROFILE
            and aff.linked_entity_id
        ):
            profile_kind = "student"
            profile = self.repo.get_student_profile(
                profile_id=int(aff.linked_entity_id),
                company_id=int(aff.company_id),
            )

        elif (
            aff.linked_entity_type == LinkedEntityTypeEnum.STAFF_PROFILE
            and aff.linked_entity_id
        ):
            profile_kind = "staff"
            profile = self.repo.get_staff_profile(
                profile_id=int(aff.linked_entity_id),
                company_id=int(aff.company_id),
            )

        else:
            profile_kind = (
                "student"
                if str(getattr(user.user_type, "value", user.user_type)).lower() == "student"
                else "staff"
            )

        return user, aff, profile_kind, profile

    def _is_admin_like(self, *, user, roles: Optional[list[str]]) -> bool:
        role_names = {str(r).strip().lower() for r in (roles or [])}
        user_type = str(getattr(user.user_type, "value", user.user_type)).lower()

        return (
            bool(getattr(user, "is_system_owner", False))
            or user_type == "admin"
            or "super admin" in role_names
            or "system admin" in role_names
            or "company admin" in role_names
            or "admin" in role_names
        )

    # ---------------------------------------------------------------------
    # Output helpers
    # ---------------------------------------------------------------------

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

    def _semester_out(self, semester):
        if not semester:
            return None
        return {
            "id": int(semester.id),
            "name": semester.name,
            "number": int(semester.number) if getattr(semester, "number", None) is not None else None,
        }

    def _security_out(self, user):
        return {
            "can_change_password": True,
            "must_change_password": bool(getattr(user, "must_change_password", False)),
            "email_verified": bool(getattr(user, "email_verified_at", None)),
        }

    def _editable_fields(self, *, user, profile_kind: str, roles: Optional[list[str]]) -> list[str]:
        if self._is_admin_like(user=user, roles=roles):
            return [
                "email",
                "full_name",
                "staff_id",
                "faculty_id",
                "department_id",
                "status",
                "user_is_enabled",
                "profile_is_enabled",
                "set_new_password",
                "new_password",
                "logout_from_all_devices",
            ]

        return [
            "full_name",
            "set_new_password",
            "new_password",
            "logout_from_all_devices",
        ]

    # ---------------------------------------------------------------------
    # Read profile
    # ---------------------------------------------------------------------

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
        semester_data = None

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

            faculty_data = self._faculty_out(
                self.repo.get_faculty(
                    faculty_id=profile.faculty_id,
                    company_id=int(aff.company_id),
                )
            )
            department_data = self._department_out(
                self.repo.get_department(
                    department_id=profile.department_id,
                    company_id=int(aff.company_id),
                )
            )
            classroom_data = self._classroom_out(
                self.repo.get_classroom(
                    classroom_id=profile.classroom_id,
                    company_id=int(aff.company_id),
                )
            )
            semester_data = self._semester_out(
                self.repo.get_semester(
                    semester_id=profile.semester_id,
                    company_id=int(aff.company_id),
                )
            )

        elif profile_kind == "staff" and profile:
            profile_id = int(profile.id)
            profile_is_enabled = bool(profile.is_enabled)
            full_name = profile.full_name
            staff_id = profile.staff_id

            faculty_data = self._faculty_out(
                self.repo.get_faculty(
                    faculty_id=profile.faculty_id,
                    company_id=int(aff.company_id),
                )
            )
            department_data = self._department_out(
                self.repo.get_department(
                    department_id=profile.department_id,
                    company_id=int(aff.company_id),
                )
            )

        return {
            "id": profile_id,
            "user_id": int(user.id),
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
            "semester": semester_data,
            "roles": roles or [],
            "can_edit": self._editable_fields(
                user=user,
                profile_kind=profile_kind,
                roles=roles or [],
            ),
            "security": self._security_out(user),
        }

    # ---------------------------------------------------------------------
    # Update helpers
    # ---------------------------------------------------------------------

    def _validate_payload_allowed(
        self,
        *,
        payload: dict,
        user,
        profile_kind: str,
        roles: Optional[list[str]],
    ) -> None:
        keys = set(payload.keys())
        is_admin = self._is_admin_like(user=user, roles=roles)

        if is_admin:
            extra = keys.difference(self.ADMIN_ALLOWED_FIELDS)
            if extra:
                raise Forbidden(f"You are not allowed to update: {', '.join(sorted(extra))}.")
            return

        if profile_kind == "student":
            blocked = keys.intersection(self.PROTECTED_STUDENT_FIELDS)
            if blocked:
                raise Forbidden("Students can only update full name and password from this page.")

            extra = keys.difference(self.BASIC_ALLOWED_FIELDS)
            if extra:
                raise Forbidden(f"Students are not allowed to update: {', '.join(sorted(extra))}.")
            return

        # teacher/staff non-admin
        blocked = keys.intersection(self.PROTECTED_NON_ADMIN_STAFF_FIELDS)
        if blocked:
            raise Forbidden("Staff and teachers can only update full name and password from this page.")

        extra = keys.difference(self.BASIC_ALLOWED_FIELDS)
        if extra:
            raise Forbidden(f"You are not allowed to update: {', '.join(sorted(extra))}.")

    def _parse_status(self, value):
        if value is None:
            return None

        raw = str(value).strip()
        if not raw:
            raise BadRequest("Status cannot be empty.")

        try:
            return UserStatusEnum(raw)
        except Exception:
            raise BadRequest(
                "Status must be one of: pending_email, pending_approval, active, rejected."
            )

    def _update_password_if_needed(self, *, user, payload: dict) -> bool:
        set_new_password = bool(payload.get("set_new_password"))
        new_password = payload.get("new_password")

        if not set_new_password and not new_password:
            return False

        if not new_password:
            raise BadRequest("New password is required.")

        ensure_password_ok(str(new_password))
        user.password_hash = hash_password(str(new_password))

        if hasattr(user, "must_change_password"):
            user.must_change_password = False

        if hasattr(user, "session_version"):
            user.session_version = int(getattr(user, "session_version", 0) or 0) + 1

        return True

    # ---------------------------------------------------------------------
    # Update profile
    # ---------------------------------------------------------------------

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

        payload = dict(data or {})
        roles = roles or []

        self._validate_payload_allowed(
            payload=payload,
            user=user,
            profile_kind=profile_kind,
            roles=roles,
        )

        password_changed = self._update_password_if_needed(user=user, payload=payload)

        payload.pop("set_new_password", None)
        payload.pop("new_password", None)
        logout_from_all_devices = bool(payload.pop("logout_from_all_devices", False))

        if not profile and any(
            k in payload
            for k in {
                "full_name",
                "staff_id",
                "faculty_id",
                "department_id",
                "profile_is_enabled",
            }
        ):
            raise BadRequest("No linked profile found for this user.")

        is_admin = self._is_admin_like(user=user, roles=roles)

        # shared basic update
        if profile and "full_name" in payload and payload["full_name"] is not None:
            full_name = str(payload["full_name"]).strip()
            if not full_name:
                raise BadRequest("Full name cannot be empty.")
            profile.full_name = full_name

        # admin-only updates
        if is_admin:
            if "email" in payload and payload["email"] is not None:
                email = str(payload["email"]).strip().lower()
                if not email:
                    raise BadRequest("Email cannot be empty.")
                if self.repo.email_exists_for_other_user(
                    email=email,
                    exclude_user_id=int(user.id),
                ):
                    raise BadRequest("Email is already in use by another user.")
                user.email = email

            if "status" in payload and payload["status"] is not None:
                user.status = self._parse_status(payload["status"])

            if "user_is_enabled" in payload and payload["user_is_enabled"] is not None:
                user.is_enabled = bool(payload["user_is_enabled"])

            if profile and "profile_is_enabled" in payload and payload["profile_is_enabled"] is not None:
                profile.is_enabled = bool(payload["profile_is_enabled"])

            if profile_kind == "staff" and profile:
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

        try:
            bump_user_profile(int(user.id), int(aff.company_id))

            if password_changed and logout_from_all_devices:
                remove_session(int(user.id))
        except Exception:
            log.warning("Profile post-update hooks failed.", exc_info=True)

        profile_out = self.get_my_profile_page(
            user_id=int(user.id),
            active_company_id=int(aff.company_id),
            roles=roles,
        )

        profile_out["_logout_current_session"] = bool(
            password_changed and logout_from_all_devices
        )

        return profile_out