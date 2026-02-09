from __future__ import annotations

from functools import wraps
from typing import Optional, Callable, Any

from flask import g, jsonify, request

from cmcp.security.rbac_context import AuthContext, build_auth_context

WILDCARD = "*"
MANAGE = "MANAGE"
MANAGE_EXPANDS_TO = {"READ", "CREATE", "UPDATE", "DELETE", "UPLOAD", "DOWNLOAD"}


def attach_auth_context(*, user_id: int, company_id: Optional[int] = None) -> None:
    g.auth = build_auth_context(user_id=user_id, company_id=company_id)


def _ctx() -> Optional[AuthContext]:
    return getattr(g, "auth", None)


# -------------------------
# Scope checks (company)
# -------------------------
def ensure_company_scope(*, company_id: int) -> None:
    ctx = _ctx()
    if not ctx:
        raise PermissionError("Unauthorized.")

    # system owner/admin => any company
    if bool(getattr(ctx, "is_system_owner", False)) or bool(getattr(ctx, "is_system_admin", False)):
        return

    allowed = {int(c.company_id) for c in (ctx.companies or [])}
    if int(company_id) not in allowed:
        raise PermissionError("Out of scope. You do not have access to this company.")


# -------------------------
# Permission checks
# -------------------------
def has_permission(*, doctype: str, action: str) -> bool:
    ctx = _ctx()
    if not ctx:
        return False

    perms = set(ctx.permissions or [])

    # global wildcard
    if WILDCARD in perms:
        return True

    dt = str(doctype).strip()
    act = str(action).strip().upper()

    # direct
    if f"{dt}:{act}" in perms:
        return True

    # manage expands
    if f"{dt}:{MANAGE}" in perms and act in MANAGE_EXPANDS_TO:
        return True

    # doctype wildcard: "*:READ" / "*:MANAGE"
    if f"{WILDCARD}:{act}" in perms:
        return True
    if f"{WILDCARD}:{MANAGE}" in perms and act in MANAGE_EXPANDS_TO:
        return True

    # action wildcard: "Faculty:*"
    if f"{dt}:{WILDCARD}" in perms:
        return True

    return False


def require_permission(doctype: str, action: str):
    def _dec(fn: Callable[..., Any]):
        @wraps(fn)
        def _wrapped(*args, **kwargs):
            if not _ctx():
                return jsonify({"message": "Unauthorized"}), 401
            if not has_permission(doctype=doctype, action=action):
                return jsonify({"message": f"You do not have permission to perform this action ({doctype}:{action})."}), 403
            return fn(*args, **kwargs)
        return _wrapped
    return _dec


def require_company_and_permission(*, doctype: str, action: str, company_param: str = "company_id"):
    """
    Standard decorator:
    - resolves company_id from ?company_id= or g.auth.active_company_id
    - enforces scope
    - checks permission
    """
    def _dec(fn: Callable[..., Any]):
        @wraps(fn)
        def _wrapped(*args, **kwargs):
            ctx = _ctx()
            if not ctx:
                return jsonify({"message": "Unauthorized"}), 401

            cid = request.args.get(company_param, type=int)
            if cid is None:
                cid = int(ctx.active_company_id) if ctx.active_company_id else None

            if cid is None:
                return jsonify({"message": "company_id is required."}), 400

            try:
                ensure_company_scope(company_id=int(cid))
            except PermissionError as e:
                return jsonify({"message": str(e)}), 403

            if not has_permission(doctype=doctype, action=action):
                return jsonify({"message": f"You do not have permission to perform this action ({doctype}:{action})."}), 403

            # pass company_id into handler if it accepts it
            kwargs["company_id"] = int(cid)
            return fn(*args, **kwargs)
        return _wrapped
    return _dec
