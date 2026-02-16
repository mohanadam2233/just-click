from __future__ import annotations

import logging
from typing import Tuple, Dict, Any, Optional

from flask import session
from sqlalchemy.exc import SQLAlchemyError

from cmcp.config.database import db
from cmcp.modules.auth.repo.auth_repository import AuthRepository
from cmcp.common.security.passwords import verify_password

from cmcp.common.cache import cached_user_profile, bump_user_profile
from cmcp.common.cache.session_manager import (
    index_current_session,
    set_cached_user_status,
    remove_session,
)

from cmcp.security.rbac_context import build_auth_context

log = logging.getLogger(__name__)


class AuthService:
    def __init__(self, repo: Optional[AuthRepository] = None):
        self.repo = repo or AuthRepository()

    def login(
        self, *, username: str, password: str, company_id: Optional[int] = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        user = self.repo.get_user_by_username(username)
        if not user or not verify_password(password, user.password_hash):
            return False, "Username or password is incorrect.", None

        if not user.is_enabled:
            return False, "Your account is disabled.", None

        try:
            self.repo.update_last_login(user)
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            return False, "A database error occurred during login.", None

        # bust profile cache (company-aware)
        bump_user_profile(int(user.id), company_id)

        prof_wrap = self.get_cached_profile(int(user.id), company_id=company_id)
        if not prof_wrap.get("ok"):
            return False, prof_wrap.get("message", "Profile error."), None

        profile = prof_wrap["profile"]

        # session set (cookie session is default now)
        session.clear()
        session["user_id"] = int(user.id)
        session["company_id"] = int(company_id) if company_id is not None else None

        # ✅ session_version support (safe if column not yet added)
        # if you add User.session_version later, it starts working automatically
        sv = int(getattr(user, "session_version", 0) or 0)
        session["sv"] = sv

        session.permanent = True

        # best-effort session indexing (should be Redis-optional too)
        try:
            index_current_session(int(user.id))
            set_cached_user_status(int(user.id), "enabled")
        except Exception:
            log.warning("Failed to index session / set status.", exc_info=True)

        return True, "Login successful.", profile

    def logout(self) -> Tuple[bool, str]:
        uid = session.get("user_id")
        if uid:
            try:
                remove_session(int(uid))
            except Exception:
                log.warning("Failed to remove session.", exc_info=True)

        session.clear()
        session.permanent = False
        return True, "Logout successful."

    def build_user_profile_dict(self, user_id: int, company_id: Optional[int]) -> Dict[str, Any]:
        user = self.repo.get_user_by_id(int(user_id))
        if not user:
            return {"ok": False, "message": "User not found"}

        ctx = build_auth_context(user_id=int(user.id), company_id=company_id)

        affiliations = []
        for a in (user.affiliations or []):
            affiliations.append(
                {
                    "id": int(a.id),
                    "company_id": int(a.company_id),
                    "is_primary": bool(a.is_primary),
                    "is_enabled": bool(a.is_enabled),
                    "is_company_owner": bool(getattr(a, "is_company_owner", False)),
                    "linked_entity_type": a.linked_entity_type.value if a.linked_entity_type else None,
                    "linked_entity_id": int(a.linked_entity_id) if a.linked_entity_id is not None else None,
                }
            )

        return {
            "ok": True,
            "profile": {
                "user_id": int(user.id),
                "username": str(user.username),
                "user_type": str(user.user_type.value),
                "is_system_owner": bool(getattr(user, "is_system_owner", False)),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "affiliations": affiliations,
                "active_company_id": ctx.active_company_id,
                "roles": ctx.roles,
                "permissions": sorted(list(ctx.permissions or [])),
                "is_company_admin": bool(ctx.is_company_admin),
            },
        }

    def get_cached_profile(self, user_id: int, company_id: Optional[int] = None) -> Dict[str, Any]:
        return cached_user_profile(
            user_id=int(user_id),
            company_id=company_id,
            builder=lambda: self.build_user_profile_dict(int(user_id), company_id),
            ttl=3 * 3600,
        )
