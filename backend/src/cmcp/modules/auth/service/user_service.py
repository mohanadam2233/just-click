from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import NotFound, Unauthorized, BadRequest

from cmcp.config.database import db
from cmcp.modules.auth.repo.auth_repository import AuthRepository
from cmcp.common.security.passwords import hash_password, verify_password
from cmcp.common.security.password_rules import ensure_password_ok
from cmcp.common.cache.cache_invalidator import bump_user_profile
from cmcp.common.cache.session_manager import remove_session, set_cached_user_status

from cmcp.security.rbac_context import AuthContext
from cmcp.security.rbac_guards import ensure_company_scope

log = logging.getLogger(__name__)


def _pick_target_primary_company_id(target_user) -> Optional[int]:
    affs = [a for a in (target_user.affiliations or []) if a.is_enabled]
    if not affs:
        return None
    primary = next((a for a in affs if a.is_primary), None)
    picked = primary or affs[0]
    return int(picked.company_id)


class UserService:
    def __init__(self, repo: Optional[AuthRepository] = None):
        self.repo = repo or AuthRepository()

    def change_my_password(self, *, user_id: int, old_password: str, new_password: str) -> str:
        user = self.repo.get_user_by_id(int(user_id))
        if not user:
            raise NotFound("User not found.")

        if not verify_password(old_password, user.password_hash):
            raise Unauthorized("Incorrect old password.")

        ensure_password_ok(new_password)

        try:
            user.password_hash = hash_password(new_password)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            log.error("DB error changing password for user %s: %s", user_id, e)
            raise BadRequest("Failed to change password due to a server error.")

        try:
            bump_user_profile(int(user.id))
            remove_session(int(user.id))
        except Exception:
            log.exception("Post-change hooks failed for user_id=%s", user.id)

        return "Password updated successfully."

    def reset_user_password(self, *, target_user_id: int, new_password: str, ctx: AuthContext) -> str:
        target = self.repo.get_user_by_id(int(target_user_id))
        if not target:
            raise NotFound("User not found.")

        # scope: admin must be in same company as target (unless system owner)
        target_company_id = _pick_target_primary_company_id(target)
        if target_company_id is None:
            raise BadRequest("Target user has no active company affiliation.")
        ensure_company_scope(company_id=int(target_company_id))  # uses g.auth inside guards (see deps)

        ensure_password_ok(new_password)

        try:
            target.password_hash = hash_password(new_password)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            log.error("DB error resetting password for user %s: %s", target_user_id, e)
            raise BadRequest("Failed to reset password due to a server error.")

        try:
            bump_user_profile(int(target.id))
            remove_session(int(target.id))
        except Exception:
            log.exception("Post-reset hooks failed for user_id=%s", target.id)

        return "Password reset successfully."

    def update_user_enabled(self, *, target_user_id: int, is_enabled: bool, ctx: AuthContext) -> str:
        target = self.repo.get_user_by_id(int(target_user_id))
        if not target:
            raise NotFound("User not found.")

        target_company_id = _pick_target_primary_company_id(target)
        if target_company_id is None:
            raise BadRequest("Target user has no active company affiliation.")
        ensure_company_scope(company_id=int(target_company_id))

        try:
            target.is_enabled = bool(is_enabled)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            log.error("DB error updating user %s enabled=%s: %s", target_user_id, is_enabled, e)
            raise BadRequest("Failed to update user due to a server error.")

        try:
            bump_user_profile(int(target.id))
            set_cached_user_status(int(target.id), "enabled" if is_enabled else "disabled")
            if not is_enabled:
                remove_session(int(target.id))
        except Exception:
            log.exception("Post-status hooks failed for user_id=%s", target.id)

        return "User updated successfully."
