from pydantic import BaseModel
from typing import Optional

class StaffFilterIn(BaseModel):
    search: Optional[str] = None
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    user_type: Optional[str] = None
    status: Optional[str] = None
    is_enabled: Optional[bool] = None
