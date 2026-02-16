from __future__ import annotations

from typing import Any, Optional

from .keys import epoch_key, list_vkey, detail_vkey, user_profile_vkey
from .version import bump


def bump_detail(entity: str, company_id: Optional[int], record_id: Any) -> int:
    return bump(detail_vkey(entity, company_id, record_id))


def bump_list(entity: str, company_id: Optional[int], scope: str = "default") -> int:
    return bump(list_vkey(entity, company_id, scope=scope))


def bump_dropdown(name: str, company_id: Optional[int]) -> int:
    return bump(list_vkey(f"dropdown:{name}", company_id, scope="dropdown"))


def bump_user_profile(user_id: int, company_id: Optional[int]) -> int:
    return bump(user_profile_vkey(user_id, company_id))


def bump_all() -> int:
    return bump(epoch_key())
