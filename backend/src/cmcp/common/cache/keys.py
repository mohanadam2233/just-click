from __future__ import annotations

import json
import hashlib
from typing import Any, Mapping, Optional


def _hash_params(params: Mapping[str, Any]) -> str:
    s = json.dumps(params or {}, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


# -------------------
# Versions / Epoch
# -------------------
def epoch_key() -> str:
    return "v:epoch:global"


def list_vkey(entity: str, company_id: Optional[int], scope: str = "default") -> str:
    c = int(company_id) if company_id is not None else 0
    return f"v:list:{entity}:c{c}:s{scope}"


def detail_vkey(entity: str, company_id: Optional[int], record_id: Any) -> str:
    c = int(company_id) if company_id is not None else 0
    return f"v:detail:{entity}:c{c}:{record_id}"


def user_profile_vkey(user_id: int, company_id: Optional[int]) -> str:
    c = int(company_id) if company_id is not None else 0
    return f"v:profile:u{int(user_id)}:c{c}"


# -------------------
# Concrete cache keys
# -------------------
def list_key(entity: str, *, epoch: int, version: int, company_id: Optional[int], scope: str, params: Mapping[str, Any]) -> str:
    c = int(company_id) if company_id is not None else 0
    return f"cache:list:{entity}:c{c}:s{scope}:e{int(epoch)}:v{int(version)}:{_hash_params(params)}"


def detail_key(entity: str, *, epoch: int, version: int, company_id: Optional[int], record_id: Any) -> str:
    c = int(company_id) if company_id is not None else 0
    return f"cache:detail:{entity}:c{c}:e{int(epoch)}:v{int(version)}:{record_id}"


def dropdown_key(name: str, *, epoch: int, version: int, company_id: Optional[int], params: Mapping[str, Any]) -> str:
    c = int(company_id) if company_id is not None else 0
    return f"cache:dropdown:{name}:c{c}:e{int(epoch)}:v{int(version)}:{_hash_params(params)}"


def user_profile_key(user_id: int, *, epoch: int, version: int, company_id: Optional[int]) -> str:
    c = int(company_id) if company_id is not None else 0
    return f"cache:profile:u{int(user_id)}:c{c}:e{int(epoch)}:v{int(version)}"
