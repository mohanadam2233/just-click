from __future__ import annotations

from typing import Any, Dict, Optional, List

from cmcp.core.base_service import BaseService
from cmcp.modules.education_people.repository import EducationPeopleRepo
from cmcp.modules.education_people.models import Classroom, StudentProfile, StaffProfile
from cmcp.modules.education_people.validation import (
    require_text,
    ensure_found,
    ERR_CLASSROOM_NOT_FOUND,
    ERR_STUDENT_NOT_FOUND,
    ERR_STAFF_NOT_FOUND,
    ERR_CLASSROOM_EXISTS,
    ERR_STUDENT_USER_EXISTS,
    ERR_STUDENT_ID_EXISTS,
    ERR_STAFF_USER_EXISTS,
    ERR_STAFF_ID_EXISTS,
)


class EducationPeopleService:
    """
    Same architecture as AcademicService:
    - Repo for existence checks / uniqueness validations
    - BaseService for create/update/delete/list/get
    """

    def __init__(self, repo: Optional[EducationPeopleRepo] = None):
        self.repo = repo or EducationPeopleRepo()
        self.s = self.repo.s

        self.classroom_svc = BaseService(Classroom, session=self.s)
        self.student_svc = BaseService(StudentProfile, session=self.s)
        self.staff_svc = BaseService(StaffProfile, session=self.s)

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
        obj = self.repo.classrooms.get(classroom_id, company_id=company_id)
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
        obj = self.repo.classrooms.get(classroom_id, company_id=company_id)
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
    # STUDENT PROFILE
    # =========================================================
    def create_student(self, *, company_id: int, data: Dict[str, Any]):
        user_id = int(data.get("user_id") or 0)
        if user_id <= 0:
            return False, "user_id is required.", None

        full_name = require_text(data.get("full_name"), field_label="Full name")
        student_id = require_text(data.get("student_id"), field_label="Student ID")

        if self.repo.student_user_exists(company_id=company_id, user_id=user_id):
            return False, ERR_STUDENT_USER_EXISTS, None
        if self.repo.student_id_exists(company_id=company_id, student_id=student_id):
            return False, ERR_STUDENT_ID_EXISTS, None

        payload = {
            "user_id": user_id,
            "full_name": full_name,
            "student_id": student_id,
            "faculty_id": int(data.get("faculty_id") or 0),
            "department_id": int(data.get("department_id") or 0),
            "classroom_id": int(data["classroom_id"]) if data.get("classroom_id") else None,
            "semester_id": int(data["semester_id"]) if data.get("semester_id") else None,
            "is_enabled": bool(data.get("is_enabled", True)),
        }
        return self.student_svc.create(company_id=company_id, data=payload)

    def update_student(self, *, company_id: int, student_profile_id: int, data: Dict[str, Any]):
        obj = self.repo.students.get(student_profile_id, company_id=company_id)
        if not obj:
            return False, ERR_STUDENT_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "full_name" in data and data["full_name"] is not None:
            patch["full_name"] = require_text(data.get("full_name"), field_label="Full name")

        if "student_id" in data and data["student_id"] is not None:
            student_id = require_text(data.get("student_id"), field_label="Student ID")
            if self.repo.student_id_exists(company_id=company_id, student_id=student_id, exclude_id=obj.id):
                return False, ERR_STUDENT_ID_EXISTS, None
            patch["student_id"] = student_id

        for k in ["faculty_id", "department_id", "classroom_id", "semester_id"]:
            if k in data:
                patch[k] = int(data[k]) if data[k] is not None else None

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        return self.student_svc.update(company_id=company_id, id=student_profile_id, data=patch)

    def delete_student(self, *, company_id: int, student_profile_id: int, soft: bool = True):
        obj = self.repo.students.get(student_profile_id, company_id=company_id)
        if not obj:
            return False, ERR_STUDENT_NOT_FOUND, None
        return self.student_svc.delete(company_id=company_id, id=student_profile_id, soft=soft)

    def bulk_delete_students(self, *, company_id: int, ids: List[int], soft: bool = True):
        return self.student_svc.bulk_delete(company_id=company_id, ids=ids, soft=soft)

    def list_students(self, *, company_id: int, mode: str, args: Dict[str, Any]) -> Dict[str, Any]:
        allowed_filters = {
            "is_enabled": StudentProfile.is_enabled,
            "faculty_id": StudentProfile.faculty_id,
            "department_id": StudentProfile.department_id,
            "classroom_id": StudentProfile.classroom_id,
            "semester_id": StudentProfile.semester_id,
            "student_id": StudentProfile.student_id,
        }
        sort_fields = {"id": StudentProfile.id, "full_name": StudentProfile.full_name, "created_at": getattr(StudentProfile, "created_at", StudentProfile.id)}

        if mode == "scroll":
            return self.student_svc.list_scroll(
                company_id=company_id,
                limit=args["limit"],
                offset=args["offset"],
                search=args.get("q"),
                search_columns=[StudentProfile.full_name, StudentProfile.student_id],
                filters=args.get("filters"),
                allowed_filters=allowed_filters,
                sort_key=args.get("sort_key"),
                sort_order=args.get("sort_order"),
                sort_fields=sort_fields,
                default_sort=[StudentProfile.full_name.asc()],
                only_enabled=False,
            )

        return self.student_svc.list_page(
            company_id=company_id,
            page=args["page"],
            per_page=args["per_page"],
            search=args.get("q"),
            search_columns=[StudentProfile.full_name, StudentProfile.student_id],
            filters=args.get("filters"),
            allowed_filters=allowed_filters,
            sort_key=args.get("sort_key"),
            sort_order=args.get("sort_order"),
            sort_fields=sort_fields,
            default_sort=[StudentProfile.full_name.asc()],
            only_enabled=False,
        )

    def get_student(self, *, company_id: int, student_profile_id: int) -> Optional[Dict[str, Any]]:
        return self.student_svc.get_one(company_id=company_id, id=student_profile_id)

    # =========================================================
    # STAFF PROFILE
    # =========================================================
    def create_staff(self, *, company_id: int, data: Dict[str, Any]):
        user_id = int(data.get("user_id") or 0)
        if user_id <= 0:
            return False, "user_id is required.", None

        full_name = require_text(data.get("full_name"), field_label="Full name")
        staff_id = (data.get("staff_id") or "").strip() or None

        if self.repo.staff_user_exists(company_id=company_id, user_id=user_id):
            return False, ERR_STAFF_USER_EXISTS, None
        if staff_id and self.repo.staff_id_exists(company_id=company_id, staff_id=staff_id):
            return False, ERR_STAFF_ID_EXISTS, None

        payload = {
            "user_id": user_id,
            "full_name": full_name,
            "staff_id": staff_id,
            "faculty_id": int(data["faculty_id"]) if data.get("faculty_id") else None,
            "department_id": int(data["department_id"]) if data.get("department_id") else None,
            "is_enabled": bool(data.get("is_enabled", True)),
        }
        return self.staff_svc.create(company_id=company_id, data=payload)

    def update_staff(self, *, company_id: int, staff_profile_id: int, data: Dict[str, Any]):
        obj = self.repo.staff.get(staff_profile_id, company_id=company_id)
        if not obj:
            return False, ERR_STAFF_NOT_FOUND, None

        patch: Dict[str, Any] = {}

        if "full_name" in data and data["full_name"] is not None:
            patch["full_name"] = require_text(data.get("full_name"), field_label="Full name")

        if "staff_id" in data:
            staff_id = (data.get("staff_id") or "").strip() or None
            if staff_id and self.repo.staff_id_exists(company_id=company_id, staff_id=staff_id, exclude_id=obj.id):
                return False, ERR_STAFF_ID_EXISTS, None
            patch["staff_id"] = staff_id

        for k in ["faculty_id", "department_id"]:
            if k in data:
                patch[k] = int(data[k]) if data[k] is not None else None

        if "is_enabled" in data:
            patch["is_enabled"] = bool(data["is_enabled"])

        return self.staff_svc.update(company_id=company_id, id=staff_profile_id, data=patch)

    def delete_staff(self, *, company_id: int, staff_profile_id: int, soft: bool = True):
        obj = self.repo.staff.get(staff_profile_id, company_id=company_id)
        if not obj:
            return False, ERR_STAFF_NOT_FOUND, None
        return self.staff_svc.delete(company_id=company_id, id=staff_profile_id, soft=soft)

    def bulk_delete_staff(self, *, company_id: int, ids: List[int], soft: bool = True):
        return self.staff_svc.bulk_delete(company_id=company_id, ids=ids, soft=soft)

    def list_staff(self, *, company_id: int, mode: str, args: Dict[str, Any]) -> Dict[str, Any]:
        allowed_filters = {
            "is_enabled": StaffProfile.is_enabled,
            "faculty_id": StaffProfile.faculty_id,
            "department_id": StaffProfile.department_id,
            "staff_id": StaffProfile.staff_id,
        }
        sort_fields = {"id": StaffProfile.id, "full_name": StaffProfile.full_name, "created_at": getattr(StaffProfile, "created_at", StaffProfile.id)}

        if mode == "scroll":
            return self.staff_svc.list_scroll(
                company_id=company_id,
                limit=args["limit"],
                offset=args["offset"],
                search=args.get("q"),
                search_columns=[StaffProfile.full_name, StaffProfile.staff_id],
                filters=args.get("filters"),
                allowed_filters=allowed_filters,
                sort_key=args.get("sort_key"),
                sort_order=args.get("sort_order"),
                sort_fields=sort_fields,
                default_sort=[StaffProfile.full_name.asc()],
                only_enabled=False,
            )

        return self.staff_svc.list_page(
            company_id=company_id,
            page=args["page"],
            per_page=args["per_page"],
            search=args.get("q"),
            search_columns=[StaffProfile.full_name, StaffProfile.staff_id],
            filters=args.get("filters"),
            allowed_filters=allowed_filters,
            sort_key=args.get("sort_key"),
            sort_order=args.get("sort_order"),
            sort_fields=sort_fields,
            default_sort=[StaffProfile.full_name.asc()],
            only_enabled=False,
        )

    def get_staff(self, *, company_id: int, staff_profile_id: int) -> Optional[Dict[str, Any]]:
        return self.staff_svc.get_one(company_id=company_id, id=staff_profile_id)
