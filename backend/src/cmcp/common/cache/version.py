from __future__ import annotations

from .redis_client import redis_kv
from .keys import epoch_key


def get_int(key: str, default: int = 1) -> int:
    raw = redis_kv.get(key)
    try:
        return int(raw) if raw is not None else int(default)
    except Exception:
        return int(default)


def bump(key: str) -> int:
    n = redis_kv.incr(key)
    if n is None:
        return 0
    # avoid stored version being 1 (collides with default=1)
    if n == 1:
        n2 = redis_kv.incr(key)
        return int(n2 or 2)
    return int(n)


def get_epoch() -> int:
    return get_int(epoch_key(), default=1)


def bump_epoch() -> int:
    return bump(epoch_key())
