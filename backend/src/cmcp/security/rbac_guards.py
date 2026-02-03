from __future__ import annotations

from functools import wraps
from typing import Optional, Callable, Any

from flask import g, jsonify, request

from cmcp.security.rbac_context import AuthContext, build_auth_context


def attach_auth_context_to_g(*, user_id: int, company_id: Optional[int] = None) -> None:
    g.auth = build_auth_context(user_id=user_id, company_id=company_id)


def _ctx() -> Optional[AuthContext]:
    return getattr(g, "auth", None)


# -------------------------
# Scope checks (company)
# -------------------------
def ensure_company_scope(*, company_id: int) -> None:
    ctx = _ctx()
    if not ctx:
        raise PermissionError("Unauthorized")

    # system owner bypass
    if ctx.is_system_owner:
        return

    allowed = {int(c.company_id) for c in (ctx.companies or [])}
    if int(company_id) not in allowed:
        raise PermissionError("Out of scope (company).")


# -------------------------
# Permission checks
# -------------------------
def has_permission(*, doctype: str, action: str) -> bool:
    ctx = _ctx()
    if not ctx:
        return False

    perms = set(ctx.permissions or [])
    if "*" in perms:
        return True

    key = f"{doctype}:{str(action).upper()}".strip()
    return key in perms


def require_permission(doctype: str, action: str):
    def _dec(fn: Callable[..., Any]):
        @wraps(fn)
        def _wrapped(*args, **kwargs):
            if not _ctx():
                return jsonify({"message": "Unauthorized"}), 401
            if not has_permission(doctype=doctype, action=action):
                return jsonify({"message": f"Forbidden: {doctype}:{action}"}), 403
            return fn(*args, **kwargs)
        return _wrapped
    return _dec


def require_company_and_permission(
    *,
    doctype: str,
    action: str,
    company_param: str = "company_id",
):
    def _dec(fn: Callable[..., Any]):
        @wraps(fn)
        def _wrapped(*args, **kwargs):
            if not _ctx():
                return jsonify({"message": "Unauthorized"}), 401

            cid = kwargs.get(company_param) or request.args.get(company_param)
            if cid is None:
                return jsonify({"message": "company_id is required"}), 400

            try:
                ensure_company_scope(company_id=int(cid))
            except PermissionError as e:
                return jsonify({"message": str(e)}), 403

            if not has_permission(doctype=doctype, action=action):
                return jsonify({"message": f"Forbidden: {doctype}:{action}"}), 403

            return fn(*args, **kwargs)
        return _wrapped
    return _dec
