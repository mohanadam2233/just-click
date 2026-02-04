from __future__ import annotations

from flask import Blueprint, request, session, make_response, current_app, g
from werkzeug.exceptions import HTTPException
from pydantic import ValidationError

from cmcp.common.api_response import api_error, api_success
from cmcp.common.decorators import rate_limit
from cmcp.core.auth import public

from cmcp.modules.auth.deps import get_current_user
from cmcp.modules.auth.schemas import (
    LoginRequest,
    ChangeMyPasswordRequest,
    ResetPasswordRequest,
)
from cmcp.modules.auth.service.auth_service import AuthService
from cmcp.modules.auth.service.user_service import UserService
from cmcp.security.rbac_guards import require_permission

bp = Blueprint("auth", __name__, url_prefix="/api/auth")
auth_svc = AuthService()
user_svc = UserService()


@bp.post("/login")
@public
@rate_limit(key_prefix="login", limit=5, window=60, include_username=True)
def login():
    payload = request.get_json(silent=True) or {}
    try:
        req = LoginRequest(**payload)
    except ValidationError as e:
        return api_error(f"Invalid request: {e}", status_code=400)

    ok, msg, profile = auth_svc.login(username=req.username, password=req.password, company_id=req.company_id)
    if not ok:
        return api_error(msg, status_code=401)

    # store chosen company in session for next requests
    session["company_id"] = req.company_id

    return api_success(message=msg, data={"user": profile})


@bp.post("/logout")
@public
@rate_limit(key_prefix="logout", limit=10, window=60)
def logout():
    ok, message = auth_svc.logout()

    session.clear()
    session.permanent = False

    resp = make_response(
        api_success(message=message, data={}) if ok else api_error(message=message, status_code=500)
    )

    cookie_name = current_app.config.get("SESSION_COOKIE_NAME", "session")
    cookie_domain = current_app.config.get("SESSION_COOKIE_DOMAIN", None)
    cookie_path = current_app.config.get("SESSION_COOKIE_PATH", "/")
    resp.delete_cookie(cookie_name, domain=cookie_domain, path=cookie_path)

    return resp


@bp.get("/me")
def me():
    user_profile = get_current_user()
    return api_success(data={"user": user_profile})


@bp.patch("/me/password/change")
@rate_limit(key_prefix="change_my_password", limit=5, window=60)
def change_my_password():
    user = get_current_user()
    payload = request.get_json(silent=True) or {}
    try:
        req = ChangeMyPasswordRequest(**payload)
        msg = user_svc.change_my_password(
            user_id=int(user["user_id"]),
            old_password=req.old_password,
            new_password=req.new_password,
        )
        return api_success(message=msg, data={})
    except HTTPException as e:
        return api_error(e.description or str(e), status_code=e.code or 400)
    except Exception as e:
        return api_error(f"Unexpected error: {e}", status_code=500)


# Admin: reset user password (permission only; scope is validated inside service)
@bp.patch("/users/<int:user_id>/password/reset")
@require_permission("User", "MANAGE_PASSWORD")
def reset_user_password(user_id: int):
    _ = get_current_user()
    payload = request.get_json(silent=True) or {}
    try:
        req = ResetPasswordRequest(**payload)
        msg = user_svc.reset_user_password(
            target_user_id=int(user_id),
            new_password=req.new_password,
            ctx=g.auth,
        )
        return api_success(message=msg, data={})
    except HTTPException as e:
        return api_error(e.description or str(e), status_code=e.code or 400)
    except Exception as e:
        return api_error(f"Unexpected error: {e}", status_code=500)




# @bp.get("/materials")
# @require_company_and_permission(doctype="Material", action="READ")
# def list_materials():
#     ...