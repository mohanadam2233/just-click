# from __future__ import annotations
#
# import logging
# from typing import Optional
#
# from cmcp.common.cache.redis_client import redis_kv
#
# log = logging.getLogger(__name__)
#
# # Keys
# def _user_sessions_key(user_id: int) -> str:
#     return f"sessions:u{int(user_id)}"
#
# def _user_status_key(user_id: int) -> str:
#     return f"user_status:u{int(user_id)}"
#
#
# def index_current_session(user_id: int, session_id: Optional[str] = None, ttl_seconds: int = 60 * 60 * 24) -> None:
#     """
#     Optional helper for Redis-backed "session indexing".
#     With cookie sessions you may not have a server session_id; you can pass None.
#     This is BEST-EFFORT (fail-open).
#     """
#     try:
#         r = redis_kv.raw_client()
#         if not r:
#             return
#
#         sid = session_id or "cookie"  # we don't rely on it, just a marker
#         key = _user_sessions_key(user_id)
#
#         # Use a set so multiple sessions/devices can exist
#         r.sadd(key, sid)
#         r.expire(key, int(ttl_seconds))
#     except Exception:
#         log.warning("index_current_session failed (ignored)", exc_info=True)
#
#
# def remove_session(user_id: int, session_id: Optional[str] = None) -> None:
#     """
#     Optional: remove a user's sessions from Redis index.
#     With cookie sessions, you can't truly kill browser cookies server-side,
#     so this is only useful if later you switch to Redis sessions or add other tracking.
#     """
#     try:
#         r = redis_kv.raw_client()
#         if not r:
#             return
#
#         key = _user_sessions_key(user_id)
#         if session_id:
#             r.srem(key, session_id)
#         else:
#             # remove all tracked sessions for that user
#             r.delete(key)
#     except Exception:
#         log.warning("remove_session failed (ignored)", exc_info=True)
#
#
# def set_cached_user_status(user_id: int, status: str, ttl_seconds: int = 60 * 60) -> None:
#     """
#     Optional: cache user status (enabled/disabled).
#     BEST-EFFORT. Safe if Redis is down.
#     """
#     try:
#         r = redis_kv.raw_client()
#         if not r:
#             return
#
#         key = _user_status_key(user_id)
#         r.setex(key, int(ttl_seconds), str(status))
#     except Exception:
#         log.warning("set_cached_user_status failed (ignored)", exc_info=True)
#
#
# def get_cached_user_status(user_id: int) -> Optional[str]:
#     try:
#         r = redis_kv.raw_client()
#         if not r:
#             return None
#         v = r.get(_user_status_key(user_id))
#         return str(v) if v is not None else None
#     except Exception:
#         return None
from __future__ import annotations

import logging
from typing import Optional

from cmcp.common.cache.redis_client import redis_kv

log = logging.getLogger(__name__)

# Keys
def _user_sessions_key(user_id: int) -> str:
    return f"sessions:u{int(user_id)}"

def _user_status_key(user_id: int) -> str:
    return f"user_status:u{int(user_id)}"


def index_current_session(
    user_id: int,
    session_id: Optional[str] = None,
    ttl_seconds: int = 60 * 60 * 24,
) -> None:
    """
    BEST-EFFORT Redis index of "active sessions" for the user.
    With cookie sessions, there is no real server-side session id, so we use a marker.
    If Redis is down -> no-op.
    """
    try:
        r = redis_kv.raw_client()
        if not r:
            return

        sid = session_id or "cookie"
        key = _user_sessions_key(user_id)

        r.sadd(key, sid)
        r.expire(key, int(ttl_seconds))
    except Exception:
        log.warning("index_current_session failed (ignored)", exc_info=True)


def is_session_indexed(user_id: int, session_id: Optional[str] = None) -> bool:
    """
    IMPORTANT: Redis is optional, so this must be FAIL-OPEN.

    - If Redis is down: return True (do not block logins)
    - If Redis is up:
        - if key doesn't exist yet: return True (don't lock out users)
        - else: verify session marker exists
    """
    try:
        r = redis_kv.raw_client()
        if not r:
            return True  # ✅ fail-open

        key = _user_sessions_key(user_id)
        if not r.exists(key):
            return True  # ✅ fail-open (no lockouts)

        sid = session_id or "cookie"
        return bool(r.sismember(key, sid))
    except Exception:
        return True  # ✅ fail-open


def remove_session(user_id: int, session_id: Optional[str] = None) -> None:
    """
    BEST-EFFORT cleanup. With cookie sessions you cannot kill browser cookies server-side.
    So this is optional and safe to ignore when Redis is down.
    """
    try:
        r = redis_kv.raw_client()
        if not r:
            return

        key = _user_sessions_key(user_id)
        if session_id:
            r.srem(key, session_id)
        else:
            r.delete(key)
    except Exception:
        log.warning("remove_session failed (ignored)", exc_info=True)


def set_cached_user_status(user_id: int, status: str, ttl_seconds: int = 60 * 60) -> None:
    """
    BEST-EFFORT user enabled/disabled cache.
    """
    try:
        r = redis_kv.raw_client()
        if not r:
            return

        r.setex(_user_status_key(user_id), int(ttl_seconds), str(status))
    except Exception:
        log.warning("set_cached_user_status failed (ignored)", exc_info=True)


def get_cached_user_status(user_id: int) -> Optional[str]:
    """
    BEST-EFFORT read. Return None if Redis is down.
    """
    try:
        r = redis_kv.raw_client()
        if not r:
            return None
        v = r.get(_user_status_key(user_id))
        return str(v) if v is not None else None
    except Exception:
        return None
