from pydantic import BaseModel
from typing import Optional

class StudentsFilterIn(BaseModel):
    search: Optional[str] = None
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    semester_id: Optional[int] = None
    classroom_id: Optional[int] = None
    status: Optional[str] = None
    is_enabled: Optional[bool] = None
