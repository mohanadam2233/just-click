from __future__ import annotations

import json
import random
from typing import Any, Callable, Mapping, Optional

from .redis_client import redis_kv
from .keys import (
    list_vkey, detail_vkey, user_profile_vkey,
    list_key, detail_key, dropdown_key, user_profile_key,
)
from .version import get_int, get_epoch


def _loads(raw: Any) -> Optional[Any]:
    if raw is None:
        return None
    try:
        if isinstance(raw, (bytes, bytearray)):
            raw = raw.decode("utf-8")
        return json.loads(raw)
    except Exception:
        return None


def _dumps(v: Any) -> str:
    return json.dumps(v, default=str, separators=(",", ":"))


def _set_json(key: str, value: Any, ttl: int, jitter: int) -> None:
    redis_kv.setex(key, int(ttl) + random.randint(0, max(0, int(jitter))), _dumps(value))


def cached_detail(
    *,
    entity: str,
    company_id: Optional[int],
    record_id: Any,
    builder: Callable[[], Any],
    ttl: int = 120,
) -> Any:
    epoch = get_epoch()
    v = get_int(detail_vkey(entity, company_id, record_id), default=1)
    k = detail_key(entity, epoch=epoch, version=v, company_id=company_id, record_id=record_id)

    hit = _loads(redis_kv.get(k))
    if hit is not None:
        return hit

    data = builder()
    if data is not None:
        _set_json(k, data, ttl=ttl, jitter=30)
    return data


def cached_list(
    *,
    entity: str,
    company_id: Optional[int],
    params: Mapping[str, Any],
    builder: Callable[[], Any],
    ttl: int = 60,
    scope: str = "default",
) -> Any:
    epoch = get_epoch()
    v = get_int(list_vkey(entity, company_id, scope=scope), default=1)
    k = list_key(entity, epoch=epoch, version=v, company_id=company_id, scope=scope, params=params)

    hit = _loads(redis_kv.get(k))
    if hit is not None:
        return hit

    data = builder()
    _set_json(k, data, ttl=ttl, jitter=30)
    return data


def cached_dropdown(
    *,
    name: str,
    company_id: Optional[int],
    params: Mapping[str, Any],
    builder: Callable[[], Any],
    ttl: int = 600,
) -> Any:
    epoch = get_epoch()
    v = get_int(list_vkey(f"dropdown:{name}", company_id, scope="dropdown"), default=1)
    k = dropdown_key(name, epoch=epoch, version=v, company_id=company_id, params=params)

    hit = _loads(redis_kv.get(k))
    if hit is not None:
        return hit

    data = builder()
    _set_json(k, data, ttl=ttl, jitter=120)
    return data


def cached_user_profile(
    *,
    user_id: int,
    company_id: Optional[int],
    builder: Callable[[], Any],
    ttl: int = 3 * 3600,
) -> Any:
    epoch = get_epoch()
    v = get_int(user_profile_vkey(user_id, company_id), default=1)
    k = user_profile_key(user_id, epoch=epoch, version=v, company_id=company_id)

    hit = _loads(redis_kv.get(k))
    if hit is not None:
        return hit

    data = builder()
    _set_json(k, data, ttl=ttl, jitter=300)
    return data
