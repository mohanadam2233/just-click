from __future__ import annotations

from functools import wraps
from typing import Any, Callable, Mapping, Optional
from .cached import cached_list

def cache_list(entity: str, *, ttl: int = 60, scope: str = "default"):
    """
    Decorator for pure list builders:
    function must accept company_id and params.
    """
    def deco(fn: Callable[..., Any]):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            company_id = kwargs.get("company_id")
            params: Mapping[str, Any] = kwargs.get("params") or {}
            return cached_list(
                entity=entity,
                company_id=company_id,
                params=params,
                ttl=ttl,
                scope=scope,
                builder=lambda: fn(*args, **kwargs),
            )
        return wrapper
    return deco
