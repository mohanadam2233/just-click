import logging
from typing import Optional

from flask import g, session, request, abort

from sqlalchemy import select

from cmcp.config.database import db
from cmcp.modules.auth.models import User  # ✅ your new model
from cmcp.modules.auth.service.auth_service import AuthService
from cmcp.common.cache.session_manager import get_cached_user_status, is_session_indexed
from cmcp.security.rbac_guards import attach_auth_context  # ✅ we created this


_auth = AuthService()
log = logging.getLogger(__name__)

AUTH_WHITELIST = {
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/refresh",
}


def _requested_company_id() -> Optional[int]:
    """
    Pick active company for this request.
    Priority:
      1) Header: X-Company-Id
      2) Query: company_id
    """
    raw = request.headers.get("X-Company-Id") or request.args.get("company_id")
    if not raw:
        return None
    try:
        return int(raw)
    except Exception:
        return None


def _db_user_is_enabled(user_id: int) -> Optional[bool]:
    """
    Fallback check if Redis does not have status cached.
    Returns:
      True / False if user exists
      None if user not found
    """
    s = db.session
    # Only fetch one boolean column
    return s.scalar(select(User.is_enabled).where(User.id == int(user_id)))


def _status_allows_access(cached_status: Optional[str], *, user_id: int) -> bool:
    """
    Decide if user is enabled using:
      1) Redis cached value if present
      2) DB fallback if Redis missing
    Accepts common encodings:
      "enabled"/"disabled", "true"/"false", "1"/"0"
    """
    if cached_status is not None:
        v = str(cached_status).strip().lower()
        if v in {"enabled", "true", "1", "yes"}:
            return True
        if v in {"disabled", "false", "0", "no"}:
            return False
        # unknown value => fallback to DB (safe)
        log.warning("Unknown cached user_status=%r for user_id=%s; falling back to DB.", cached_status, user_id)

    enabled = _db_user_is_enabled(user_id)
    if enabled is None:
        # user not found => treat as invalid session
        return False
    return bool(enabled)


def before_request_session_auth():
    """
    Middleware:
      - verifies session user_id exists
      - gates disabled users (User.is_enabled)
      - ensures session is indexed (anti-stolen-cookie)
      - loads cached profile into g.current_user
      - attaches RBAC AuthContext into g.auth (non-fatal)
    """
    g.current_user = None
    g.auth = None

    # Skip preflight (no cookies usually)
    if request.method == "OPTIONS":
        return

    # Public endpoints
    if request.path in AUTH_WHITELIST:
        return

    user_id = session.get("user_id")
    if not user_id:
        return  # global require-login handler will respond

    try:
        uid = int(user_id)
    except Exception:
        session.clear()
        abort(401, description="Invalid session user id.")

    try:
        # --- HARD GATE 1: enabled check (Redis -> DB fallback) ---
        cached_status = get_cached_user_status(uid)
        if not _status_allows_access(cached_status, user_id=uid):
            session.clear()
            abort(403, description="Your account is disabled.")

        # --- HARD GATE 2: session indexing ---
        if not is_session_indexed(uid):
            session.clear()
            abort(401, description="Invalid session. Please log in again.")

        # --- Load profile (cache) ---
        prof = _auth.get_cached_profile(uid)
        if not prof or not prof.get("ok"):
            session.clear()
            abort(401, description="Session expired or invalid. Please log in again.")

        g.current_user = prof.get("profile")

        # --- Attach RBAC context (non-fatal) ---
        try:
            cid = _requested_company_id()
            attach_auth_context(user_id=uid, company_id=cid)
        except Exception as e:
            log.warning("attach_auth_context failed uid=%s err=%s", uid, e, exc_info=True)

    except Exception as e:
        log.error("Session auth middleware error uid=%s err=%s", uid, e, exc_info=True)
        session.clear()
        abort(500)
