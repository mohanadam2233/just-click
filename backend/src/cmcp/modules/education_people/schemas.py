from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

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





class _BaseIn(BaseModel):
    model_config = ConfigDict(extra="forbid")


class StudentRegisterIn(_BaseIn):
    student_id: str = Field(..., min_length=3, max_length=60)
    email: str
    full_name: str = Field(..., min_length=2, max_length=200)
    faculty_id: int
    department_id: int
    classroom_id: Optional[int] = None
    room_number: Optional[str] = None  # if you want to store separately (optional)


class BulkApproveIn(BaseModel):
    user_ids: List[int]