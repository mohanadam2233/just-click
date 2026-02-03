from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel


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
