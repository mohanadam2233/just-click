from __future__ import annotations

from typing import List, Optional
from typing import Any, Dict
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


# -------------------------
# Staff (Admin create)
# -------------------------
class StaffCreateIn(_BaseIn):
    full_name: str = Field(..., min_length=2, max_length=200)
    staff_id: str = Field(..., min_length=3, max_length=60)
    email: str  # required (recommended)
    password: Optional[str] = None  # if missing -> auto generate + must_change_password

    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    is_enabled: bool = True

class StaffUpdateIn(_BaseIn):
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)
    staff_id: Optional[str] = Field(None, min_length=3, max_length=60)

    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    is_enabled: Optional[bool] = None

# -------------------------
# Students updates
# -------------------------
class StudentAdminUpdateIn(_BaseIn):
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)
    student_id: Optional[str] = Field(None, min_length=3, max_length=60)
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    classroom_id: Optional[int] = None
    semester_id: Optional[int] = None
    is_enabled: Optional[bool] = None

class StudentSelfUpdateIn(_BaseIn):
    # safest
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)


# -------------------------
# Dashboard
# -------------------------
class DashboardCardOut(BaseModel):
    value: int
    change_percent: float
    trend: str
    meta: Dict[str, Any] = Field(default_factory=dict)


class UserGrowthPointOut(BaseModel):
    label: str
    new_users: int
    students: int
    lecturers: int
    staff: int
    admins: int


class DashboardSummaryCardsOut(BaseModel):
    total_users: DashboardCardOut
    pending_user_approvals: DashboardCardOut
    total_materials: DashboardCardOut
    global_material_analytics: DashboardCardOut


class DashboardChartsOut(BaseModel):
    user_growth: List[UserGrowthPointOut]


class AdminDashboardDataOut(BaseModel):
    summary_cards: DashboardSummaryCardsOut
    charts: DashboardChartsOut


class AdminDashboardResponseOut(BaseModel):
    data: AdminDashboardDataOut
    generated_at: str