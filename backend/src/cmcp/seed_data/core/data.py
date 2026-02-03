from __future__ import annotations
from typing import Dict, List

# ------------------------------------------------------------
# System owner accounts (global / platform admins)
# ------------------------------------------------------------
# These users have:
# - is_system_owner=True
# - no affiliations
# - no company roles (UserRole requires company_id)
SYSTEM_OWNER_USERS: List[Dict[str, str]] = [
    {"username": "sys_owner1", "password": "ChangeMe!123"},
    {"username": "sys_owner2", "password": "ChangeMe!123"},
]

