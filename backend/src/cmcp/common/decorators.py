from __future__ import annotations

from functools import wraps
from typing import Callable
import logging
import time

from flask import request, jsonify
from cmcp.config.redis_config import get_redis_kv

log = logging.getLogger(__name__)

# Small Lua to INCR and set TTL only when the key is new; returns [count, ttl]
# This avoids “sliding” window and doesn’t keep extending the TTL on each hit.
_LUA_INCR_WITH_TTL = """
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {count, ttl}
"""

# ---------------------------
# Circuit breaker (log + retry control)
# ---------------------------
_CB_OPEN_UNTIL = 0.0
_CB_SECONDS = 3.0  # how long we pause after a Redis failure

def _cb_open() -> bool:
    return time.time() < _CB_OPEN_UNTIL

def _cb_trip() -> None:
    global _CB_OPEN_UNTIL
    _CB_OPEN_UNTIL = time.time() + _CB_SECONDS


def _client_ip() -> str:
    """
    Best-effort client IP extractor. Works fine behind proxies if your reverse proxy
    sets X-Forwarded-For / X-Real-IP correctly.
    """
    hdr = request.headers.get("X-Forwarded-For", "")
    if hdr:
        ip = hdr.split(",")[0].strip()
        if ip:
            return ip
    ip = request.headers.get("X-Real-IP")
    if ip:
        return ip.strip()
    return (request.remote_addr or "unknown").strip()


def rate_limit(
    *,
    key_prefix: str = "rl",
    limit: int = 10,
    window: int = 60,
    include_username: bool = False,
) -> Callable:
    """
    Simple fixed-window rate limiter.

    - Uses Redis key: rl:{key_prefix}:{client_id}[:u:{username}]
    - `limit` requests per `window` seconds (fixed window).
    - Adds Retry-After header when blocked (HTTP 429).

    FAIL-OPEN RULE:
      If Redis is down/unreachable, allow the request (do not crash).
    """
    def decorator(view_func: Callable):
        @wraps(view_func)
        def wrapper(*args, **kwargs):
            cid = _client_ip()

            # Optionally fold in a username to reduce username spraying from a single IP.
            uname_part = ""
            if include_username:
                try:
                    json_body = request.get_json(silent=True) or {}
                    uname = (json_body.get("username") or "").strip().lower()
                    if uname:
                        uname_part = f":u:{uname}"
                except Exception:
                    pass

            key = f"rl:{key_prefix}:{cid}{uname_part}"

            # ✅ Circuit breaker: if Redis recently failed, skip checks briefly
            if _cb_open():
                return view_func(*args, **kwargs)

            try:
                # ✅ Move client creation inside try so it can't crash request
                r = get_redis_kv()
                if r is None:
                    return view_func(*args, **kwargs)

                res = r.eval(_LUA_INCR_WITH_TTL, 1, key, str(int(window)))
                count, ttl = int(res[0]), int(res[1])

                if count > limit:
                    resp = jsonify({
                        "ok": False,
                        "message": "Too many requests. Please try again later."
                    })
                    if ttl > 0:
                        resp.headers["Retry-After"] = str(ttl)
                    return resp, 429

            except Exception as e:
                # ✅ Fail-open, but don’t spam huge traces every request
                log.warning("Rate limit check failed (key=%s). Allowing request. err=%s", key, e)
                _cb_trip()

            return view_func(*args, **kwargs)

        return wrapper
    return decorator
