from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    username: str
    password: str
    company_id: Optional[int] = None  # optional: lets UI choose active company


class ChangeMyPasswordRequest(BaseModel):
    old_password: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    new_password: str


class AffiliationOut(BaseModel):
    id: int
    company_id: int
    is_primary: bool
    is_enabled: bool
    is_company_owner: bool
    linked_entity_type: Optional[str] = None
    linked_entity_id: Optional[int] = None


class UserProfileOut(BaseModel):
    user_id: int
    username: str
    user_type: str
    is_system_owner: bool
    last_login: Optional[str] = None

    affiliations: List[AffiliationOut]

    # RBAC (for frontend)
    active_company_id: Optional[int] = None
    roles: List[str] = []
    permissions: List[str] = []
    is_company_admin: bool = False
class ProfileFacultyOut(BaseModel):
    id: int
    name: str


class ProfileDepartmentOut(BaseModel):
    id: int
    name: str


class ProfileClassroomOut(BaseModel):
    id: int
    name: str
    room_number: Optional[str] = None


class UserProfilePageOut(BaseModel):
    # IMPORTANT:
    # id = profile id (student_profiles.id OR staff_profiles.id)
    id: Optional[int] = None
    user_id: int

    username: str
    email: str
    status: str

    user_is_enabled: bool
    profile_is_enabled: Optional[bool] = None

    profile_type: Optional[str] = None  # "student" | "staff"

    full_name: Optional[str] = None
    student_id: Optional[str] = None
    staff_id: Optional[str] = None

    faculty: Optional[ProfileFacultyOut] = None
    department: Optional[ProfileDepartmentOut] = None
    classroom: Optional[ProfileClassroomOut] = None

    roles: List[str] = []


class UpdateMyProfilePageRequest(BaseModel):
    email: Optional[EmailStr] = None
    status: Optional[str] = None
    user_is_enabled: Optional[bool] = None
    profile_is_enabled: Optional[bool] = None

    full_name: Optional[str] = None
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    classroom_id: Optional[int] = None

    student_id: Optional[str] = None
    staff_id: Optional[str] = None