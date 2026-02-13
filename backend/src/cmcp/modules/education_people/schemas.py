from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class BulkDeleteIn(BaseModel):
    ids: List[int]


# -------------------------
# Classroom
# -------------------------
class ClassroomCreate(BaseModel):
    name: str
    room_number: Optional[str] = None
    is_enabled: bool = True


class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    room_number: Optional[str] = None
    is_enabled: Optional[bool] = None


# -------------------------
# Student Profile
# -------------------------
class StudentProfileCreate(BaseModel):
    user_id: int
    full_name: str
    student_id: str
    faculty_id: int
    department_id: int
    classroom_id: Optional[int] = None
    semester_id: Optional[int] = None
    is_enabled: bool = True


class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    student_id: Optional[str] = None
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    classroom_id: Optional[int] = None
    semester_id: Optional[int] = None
    is_enabled: Optional[bool] = None


# -------------------------
# Staff Profile
# -------------------------
class StaffProfileCreate(BaseModel):
    user_id: int
    full_name: str
    staff_id: Optional[str] = None
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    is_enabled: bool = True


class StaffProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    staff_id: Optional[str] = None
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    is_enabled: Optional[bool] = None
