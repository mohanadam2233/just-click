from __future__ import annotations

import logging
from typing import Dict, Any

from flask import g, session, abort

from cmcp.modules.auth.service.auth_service import AuthService
from cmcp.security.rbac_guards import attach_auth_context_to_g

log = logging.getLogger(__name__)


def get_current_user() -> Dict[str, Any]:
    user_id = session.get("user_id")
    if not user_id:
        abort(401)

    # company selection (optional): stored in session or query/header in your middleware
    company_id = session.get("company_id")

    # attach RBAC context to g.auth (permissions + scope)
    attach_auth_context_to_g(user_id=int(user_id), company_id=int(company_id) if company_id else None)

    try:
        auth = AuthService()
        prof_wrap = auth.get_cached_profile(int(user_id), company_id=int(company_id) if company_id else None)
        if not prof_wrap or not prof_wrap.get("ok"):
            session.clear()
            abort(401, description="Session expired or invalid. Please log in again.")

        g.current_user = prof_wrap["profile"]
        return g.current_user

    except Exception as e:
        log.error("Error loading profile for %s: %s", user_id, e, exc_info=True)
        session.clear()
        abort(500)
