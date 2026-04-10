import json
from flask import Blueprint, request
from typing import Dict, Any

from cmcp.common.api_response import api_success, api_error
from cmcp.security.rbac_guards import require_company_and_permission
from cmcp.modules.admin_onboarding.service import AdminOnboardingService
from cmcp.core.exceptions import NotFoundError, BusinessValidationError

bp = Blueprint("admin_onboarding", __name__, url_prefix="/api/admin/onboarding")
svc = AdminOnboardingService()

def _handle_error(e: Exception):
    if isinstance(e, NotFoundError):
        return api_error(str(e), status_code=404)
    if isinstance(e, BusinessValidationError):
        return api_error(str(e), status_code=400)
    return api_error(str(e), status_code=400)

@bp.get("/list")
@require_company_and_permission(doctype="User", action="READ")
def list_onboarding(company_id: int):
    try:
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 20, type=int)
        
        filters = {
            "search": request.args.get("search", ""),
            "user_type": request.args.get("user_type"),
            "status": request.args.get("status", "pending_email|pending_approval"),
            "faculty_id": request.args.get("faculty_id", type=int),
            "department_id": request.args.get("department_id", type=int),
            "email_outbox_status": request.args.get("email_outbox_status")
        }

        ok, msg, data = svc.list_onboarding(company_id, page, limit, filters)
        return api_success(message=msg, data=data, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)

@bp.get("/<int:outbox_id>")
@require_company_and_permission(doctype="User", action="READ")
def get_onboarding(company_id: int, outbox_id: int):
    try:
        ok, msg, data = svc.get_onboarding(company_id, outbox_id)
        return api_success(message=msg, data=data, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)
