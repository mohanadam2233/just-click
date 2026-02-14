from __future__ import annotations

import os
from datetime import timedelta
from typing import Any, Dict, Optional, Tuple, List

from sqlalchemy.orm import Session

from cmcp.config.database import db
from cmcp.core.base_service import BaseService

from cmcp.modules.auth.models import User, UserAffiliation, UserStatusEnum, UserTypeEnum, LinkedEntityTypeEnum
from cmcp.modules.education_people.models import StudentProfile, Classroom, StaffProfile
from cmcp.modules.academic.models import Faculty, Department

from cmcp.common.email.service import EmailService, _utcnow
from cmcp.common.security.tokens import generate_email_verify_token, verify_token
from cmcp.common.security.passwords import generate_temp_password, hash_password

from cmcp.modules.education_people.repository import EducationPeopleRepo
from cmcp.modules.education_people.validation import (
    require_text,
    ERR_CLASSROOM_NOT_FOUND,
    ERR_CLASSROOM_EXISTS,
    ERR_ADMIN_REJECTED,
    ERR_DEPARTMENT_NOT_FOUND,
    ERR_EMAIL_EXISTS,
    ERR_FACULTY_NOT_FOUND,
    ERR_PENDING_APPROVAL,
    ERR_STUDENT_ID_EXISTS,
    ERR_VERIFY_EXPIRED,
    normalize_email,
)




class EducationPeopleService:
    """
     Same architecture as AcademicService:
     - Repo for existence checks / uniqueness validations
     - BaseService for create/update/delete/list/get (Classroom etc)
     - Custom business methods for registration + verification + approval
     """

    def __init__(self, repo: Optional[EducationPeopleRepo] = None, session: Optional[Session] = None):
        self.repo = repo or EducationPeopleRepo(session=session)
        self.s: Session = self.repo.s

        self.classroom_svc = BaseService(Classroom, session=self.s)
        self.student_svc = BaseService(StudentProfile, session=self.s)
        self.staff_svc = BaseService(StaffProfile, session=self.s)

        self.email_svc = EmailService(
            session=self.s,
            provider=os.getenv("MAIL_PROVIDER", "smtp"),
            from_email=os.getenv("MAIL_FROM_EMAIL", ""),
            from_name=os.getenv("MAIL_FROM_NAME", "Jamhuriya University"),
            max_tries=int(os.getenv("EMAIL_OUTBOX_MAX_TRIES", "5")),
        )
    # =========================================================
    # CLASSROOM
    # =========================================================
    def create_classroom(self, *, company_id: int, data: Dict[str, Any]):
        name = require_text(data.get("name"), field_label="Classroom name")

        if self.repo.classroom_name_exists(company_id=company_id, name=name):
            return False, ERR_CLASSROOM_EXISTS, None

        payload = {
            "name": name,
            "room_number": (data.get("room_number") or "").strip() or None,
            "is_enabled": bool(data.get("is_enabled", True)),
        }
        return self.classroom_svc.create(company_id=company_id, data=payload)

    def update_classroom(self, *, company_id: int, classroom_id: int, data: Dict[str, Any]):
        obj = self.repo.classrooms.get(int(classroom_id), company_id=int(company_id))
        if not obj:
            return False, ERR_CLASSROOM_NOT_FOUND, None

        patch: Dict[str, Any] = {}
        if "name" in data and data["name"] is not None:
            name = require_text(data.get("name"), field_label="Classroom name")
            if self.repo.classroom_name_exists(company_id=company_id, name=name, exclude_id=obj.id):
                return False, ERR_CLASSROOM_EXISTS, None
            patch["name"] = name

        if "room_number" in data:
            patch["room_number"] = (data.get("room_number") or "").strip() or None

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        return self.classroom_svc.update(company_id=company_id, id=classroom_id, data=patch)

    def delete_classroom(self, *, company_id: int, classroom_id: int, soft: bool = True):
        obj = self.repo.classrooms.get(int(classroom_id), company_id=int(company_id))
        if not obj:
            return False, ERR_CLASSROOM_NOT_FOUND, None
        return self.classroom_svc.delete(company_id=company_id, id=classroom_id, soft=soft)

    def bulk_delete_classrooms(self, *, company_id: int, ids: List[int], soft: bool = True):
        return self.classroom_svc.bulk_delete(company_id=company_id, ids=ids, soft=soft)

    def list_classrooms(self, *, company_id: int, mode: str, args: Dict[str, Any]) -> Dict[str, Any]:
        allowed_filters = {"is_enabled": Classroom.is_enabled, "name": Classroom.name}
        sort_fields = {"id": Classroom.id, "name": Classroom.name, "created_at": getattr(Classroom, "created_at", Classroom.id)}

        if mode == "scroll":
            return self.classroom_svc.list_scroll(
                company_id=company_id,
                limit=args["limit"],
                offset=args["offset"],
                search=args.get("q"),
                search_columns=[Classroom.name, Classroom.room_number],
                filters=args.get("filters"),
                allowed_filters=allowed_filters,
                sort_key=args.get("sort_key"),
                sort_order=args.get("sort_order"),
                sort_fields=sort_fields,
                default_sort=[Classroom.name.asc()],
                only_enabled=False,
            )

        return self.classroom_svc.list_page(
            company_id=company_id,
            page=args["page"],
            per_page=args["per_page"],
            search=args.get("q"),
            search_columns=[Classroom.name, Classroom.room_number],
            filters=args.get("filters"),
            allowed_filters=allowed_filters,
            sort_key=args.get("sort_key"),
            sort_order=args.get("sort_order"),
            sort_fields=sort_fields,
            default_sort=[Classroom.name.asc()],
            only_enabled=False,
        )

    def get_classroom(self, *, company_id: int, classroom_id: int) -> Optional[Dict[str, Any]]:
        return self.classroom_svc.get_one(company_id=company_id, id=classroom_id)

        # =========================================================
        # STEP 1-3: Register student -> enqueue verify email
        # =========================================================

    def register_student(self, *, company_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        student_id = require_text(data.get("student_id"), field_label="Student ID")
        email = normalize_email(data.get("email"))
        full_name = require_text(data.get("full_name"), field_label="Full Name")

        faculty_id = int(data.get("faculty_id") or 0)
        department_id = int(data.get("department_id") or 0)

        classroom_id = data.get("classroom_id")
        classroom_id = int(classroom_id) if classroom_id else None

        # faculty exists
        if not self.repo.faculty_exists(company_id=company_id, faculty_id=faculty_id):
            return False, ERR_FACULTY_NOT_FOUND, None

        # department exists + belongs to faculty
        if not self.repo.department_exists(company_id=company_id, department_id=department_id, faculty_id=faculty_id):
            return False, ERR_DEPARTMENT_NOT_FOUND, None

        # classroom optional
        if classroom_id and not self.repo.classroom_exists(company_id=company_id, classroom_id=classroom_id):
            return False, ERR_CLASSROOM_NOT_FOUND, None

        # duplicates
        if self.repo.user_by_username(student_id=student_id) or self.repo.student_profile_by_student_id(
                company_id=company_id, student_id=student_id):
            return False, ERR_STUDENT_ID_EXISTS, None

        if self.repo.user_by_email(email=email):
            return False, ERR_EMAIL_EXISTS, None

        # create user (no login until approved)
        user = User(
            username=student_id,
            password_hash="!",
            email=email,
            user_type=UserTypeEnum.STUDENT,
            status=UserStatusEnum.PENDING_EMAIL,
            is_enabled=False,
            must_change_password=False,
        )
        self.s.add(user)
        self.s.flush()

        prof = StudentProfile(
            user_id=user.id,
            company_id=int(company_id),
            full_name=full_name,
            student_id=student_id,
            faculty_id=faculty_id,
            department_id=department_id,
            classroom_id=classroom_id,
            semester_id=None,
            is_enabled=True,
        )
        self.s.add(prof)
        self.s.flush()

        aff = UserAffiliation(
            user_id=user.id,
            company_id=int(company_id),
            is_primary=True,
            is_enabled=False,
            linked_entity_type=LinkedEntityTypeEnum.STUDENT_PROFILE,
            linked_entity_id=prof.id,
        )
        self.s.add(aff)

        # token
        ttl = int(os.getenv("EMAIL_VERIFY_TOKEN_TTL_MINUTES", "30"))
        tok = generate_email_verify_token(ttl_minutes=ttl)
        user.email_verify_token_hash = tok.token_hash
        user.email_verify_expires_at = tok.expires_at

        self.s.commit()

        # enqueue email
        base_url = (os.getenv("APP_BASE_URL", "").rstrip("/")) or "http://localhost:5000"
        verify_link = f"{base_url}/verify-email?username={student_id}&token={tok.token}"

        self.email_svc.enqueue(
            to_email=user.email,
            subject="Verify Your Jamhuriya University Account",
            template="verify_email",
            payload={
                "full_name": prof.full_name,
                "student_id": student_id,
                "verify_link": verify_link,
                "expires_minutes": ttl,
            },
            # recommended references (if your EmailService supports it, otherwise remove)
            ref_type="User",
            ref_id=user.id,
        )

        return True, "Registration submitted. Please check your email to verify your address.", {
            "student_id": student_id,
            "email": email,
            "status": user.status.value,
        }

        # =========================================================
        # STEP 4: Verify email
        # =========================================================

    def verify_email(self, *, username: str, token: str) -> Tuple[bool, str]:
        username = (username or "").strip()
        token = (token or "").strip()
        if not username or not token:
            return False, "Invalid verification request."

        user = self.s.query(User).filter(User.username == username).first()
        if not user:
            return False, "Invalid verification request."

        if user.status == UserStatusEnum.REJECTED:
            return False, ERR_ADMIN_REJECTED

        if user.status == UserStatusEnum.PENDING_APPROVAL:
            return False, ERR_PENDING_APPROVAL

        if user.status != UserStatusEnum.PENDING_EMAIL:
            return True, "Email already verified."

        if not user.email_verify_token_hash or not user.email_verify_expires_at:
            return False, ERR_VERIFY_EXPIRED

        if _utcnow() > user.email_verify_expires_at:
            return False, ERR_VERIFY_EXPIRED

        if not verify_token(token, user.email_verify_token_hash):
            return False, "Invalid verification token."

        user.email_verified_at = _utcnow()
        user.email_verify_token_hash = None
        user.email_verify_expires_at = None
        user.status = UserStatusEnum.PENDING_APPROVAL
        self.s.commit()

        return True, "✅ Email Verified Successfully! Your account is now pending admin approval."

        # =========================================================
        # STEP 6: Admin approve (temp password length 6)
        # =========================================================

    def admin_approve(self, *, user_id: int, admin_user_id: int) -> Tuple[bool, str]:
        user = self.s.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return False, "User not found."

        if user.status != UserStatusEnum.PENDING_APPROVAL:
            return False, "User is not pending approval."

        temp_pw = generate_temp_password(6)
        user.password_hash = hash_password(temp_pw)
        user.must_change_password = True
        user.temp_password_expires_at = _utcnow() + timedelta(hours=int(os.getenv("TEMP_PASSWORD_TTL_HOURS", "24")))

        user.is_enabled = True
        user.status = UserStatusEnum.ACTIVE
        user.approved_at = _utcnow()
        user.approved_by = int(admin_user_id)

        for aff in (user.affiliations or []):
            aff.is_enabled = True

        # load profile + names
        prof = self.s.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        faculty_name = ""
        department_name = ""
        if prof:
            fac = self.s.query(Faculty).filter(Faculty.id == prof.faculty_id).first()
            dep = self.s.query(Department).filter(Department.id == prof.department_id).first()
            faculty_name = fac.name if fac else ""
            department_name = dep.name if dep else ""

        self.s.commit()

        base_url = (os.getenv("APP_BASE_URL", "").rstrip("/")) or "http://localhost:5000"
        login_link = f"{base_url}/login"

        self.email_svc.enqueue(
            to_email=user.email,
            subject="Your Jamhuriya University Portal Account is Approved!",
            template="approved",
            payload={
                "full_name": (prof.full_name if prof else ""),
                "student_id": user.username,
                "temp_password": temp_pw,
                "login_link": login_link,
                "expires_hours": int(os.getenv("TEMP_PASSWORD_TTL_HOURS", "24")),
                "faculty_name": faculty_name,
                "department_name": department_name,
            },
            ref_type="User",
            ref_id=user.id,
        )

        return True, "Approved and email queued."