from pydantic import BaseModel
from typing import Optional

class OnboardingFilterIn(BaseModel):
    search: Optional[str] = None
    user_type: Optional[str] = None
    status: Optional[str] = None
    faculty_id: Optional[int] = None
    department_id: Optional[int] = None
    email_outbox_status: Optional[str] = None
