from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional, Tuple

from flask import Blueprint, request

from cmcp.common.api_response import api_success, api_error
from cmcp.common.decorators import rate_limit
from cmcp.common.email.outbox_model import EmailOutboxStatus, EmailOutbox
from cmcp.common.email.service import EmailService
from cmcp.config.database import db
from cmcp.core.auth import public
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.core.tenant_resolver import resolve_company_id_for_public
from cmcp.modules.auth.deps import get_current_user
from cmcp.security.rbac_guards import require_company_and_permission, require_permission

from cmcp.modules.education_people.schemas import (
    BulkDeleteIn,
    ClassroomCreate, ClassroomUpdate, StudentRegisterIn, BulkApproveIn,

)
from cmcp.modules.education_people.service import EducationPeopleService

bp = Blueprint("education_people", __name__, url_prefix="/api/education_people")
svc = EducationPeopleService()


def _as_bool(v: Any) -> bool:
    if isinstance(v, bool):
        return v
    if isinstance(v, str):
        return v.strip().lower() in ("1", "true", "yes", "y", "on")
    return bool(v)


def _parse_filters() -> Dict[str, Any] | None:
    raw = request.args.get("filters")
    if raw:
        try:
            obj = json.loads(raw)
            return obj if isinstance(obj, dict) else None
        except Exception:
            return None

    filters: Dict[str, Any] = {}
    if "is_enabled" in request.args:
        filters["is_enabled"] = _as_bool(request.args.get("is_enabled"))
    return filters or None


def _list_args() -> Tuple[str | None, str | None, str | None, int, int, Optional[int], Optional[int], Dict[str, Any] | None]:
    q = request.args.get("q")
    sort_key = request.args.get("sort_key")
    sort_order = request.args.get("sort_order")

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    limit = request.args.get("limit", type=int)
    offset = request.args.get("offset", type=int)

    return q, sort_key, sort_order, page, per_page, limit, offset, _parse_filters()


def _list_mode(limit: Optional[int], offset: Optional[int]) -> str:
    return "scroll" if (limit is not None or offset is not None) else "page"


def _commit_ok(ok: bool):
    if ok:
        db.session.commit()
    else:
        db.session.rollback()


def _handle_error(e: Exception):
    db.session.rollback()
    # your validation layer now throws these (like academic)
    if isinstance(e, NotFoundError):
        return api_error(str(e), status_code=404)
    if isinstance(e, BusinessValidationError):
        return api_error(str(e), status_code=400)
    return api_error(str(e), status_code=400)


# =========================================================
# CLASSROOM
# =========================================================
@bp.post("/classrooms/create")
@require_company_and_permission(doctype="Classroom", action="CREATE")
def create_classroom(company_id: int):
    try:
        payload = ClassroomCreate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.create_classroom(company_id=company_id, data=payload.model_dump())
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.put("/classrooms/<int:classroom_id>/update")
@require_company_and_permission(doctype="Classroom", action="UPDATE")
def update_classroom(company_id: int, classroom_id: int):
    try:
        payload = ClassroomUpdate.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.update_classroom(
            company_id=company_id,
            classroom_id=classroom_id,
            data=payload.model_dump(exclude_unset=True),
        )
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.delete("/classrooms/<int:classroom_id>/delete")
@require_company_and_permission(doctype="Classroom", action="DELETE")
def delete_classroom(company_id: int, classroom_id: int):
    try:
        ok, msg, out = svc.delete_classroom(company_id=company_id, classroom_id=classroom_id, soft=True)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.post("/classrooms/bulk-delete")
@require_company_and_permission(doctype="Classroom", action="DELETE")
def bulk_delete_classrooms(company_id: int):
    try:
        payload = BulkDeleteIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.bulk_delete_classrooms(company_id=company_id, ids=payload.ids, soft=True)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


@bp.get("/classrooms/list")
@require_company_and_permission(doctype="Classroom", action="READ")
def list_classrooms(company_id: int):
    try:
        q, sort_key, sort_order, page, per_page, limit, offset, filters = _list_args()
        mode = _list_mode(limit, offset)

        args = {
            "q": q,
            "sort_key": sort_key,
            "sort_order": sort_order,
            "page": page,
            "per_page": per_page,
            "limit": int(limit or 20),
            "offset": int(offset or 0),
            "filters": filters,
        }
        data = svc.list_classrooms(company_id=company_id, mode=mode, args=args)
        return api_success(message="OK", data=data, status_code=200)
    except Exception as e:
        return _handle_error(e)


@bp.get("/classrooms/<int:classroom_id>/get")
@require_company_and_permission(doctype="Classroom", action="READ")
def get_classroom(company_id: int, classroom_id: int):
    try:
        rec = svc.get_classroom(company_id=company_id, classroom_id=classroom_id)
        return api_success(message="OK", data=rec, status_code=200) if rec else api_error("Classroom not found.", status_code=404)
    except Exception as e:
        return _handle_error(e)


@bp.post("/public/students/register")
@public
@rate_limit(key_prefix="student_register", limit=10, window=60)
def public_student_register():
    try:
        company_id = resolve_company_id_for_public()

        payload = StudentRegisterIn.model_validate(request.get_json(silent=True) or {})
        ok, msg, out = svc.register_student(company_id=company_id, data=payload.model_dump())

        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)
@bp.post("/students/<int:user_id>/approve")
@require_company_and_permission(doctype="Student", action="APPROVE")  # or doctype="User"
def approve_student(company_id: int, user_id: int):
    try:
        admin = get_current_user()  # must exist for admin session
        ok, msg = svc.admin_approve(user_id=int(user_id), admin_user_id=int(admin["user_id"]))

        _commit_ok(ok)
        return api_success(message=msg, data={"user_id": user_id}, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)
@bp.post("/students/bulk-approve")
@require_company_and_permission(doctype="Student", action="APPROVE")
def bulk_approve_students(company_id: int):
    try:
        admin = get_current_user()
        payload = BulkApproveIn.model_validate(request.get_json(silent=True) or {})

        results = []
        ok_all = True

        for uid in payload.user_ids:
            ok, msg = svc.admin_approve(user_id=int(uid), admin_user_id=int(admin["user_id"]))
            results.append({"user_id": int(uid), "ok": ok, "message": msg})
            if not ok:
                ok_all = False

        # Commit once for all (better UX)
        if ok_all:
            db.session.commit()
        else:
            # optional: still commit successes, but keep consistent:
            db.session.commit()

        return api_success("Bulk approve done.", data={"results": results}, status_code=200)

    except Exception as e:
        return _handle_error(e)

@bp.post("/email/outbox/<int:outbox_id>/resend")
@require_company_and_permission("EmailOutbox", "MANAGE")
def resend_outbox(outbox_id: int):
    row = db.session.query(EmailOutbox).get(outbox_id)
    if not row:
        return api_error("Outbox not found", 404)

    if row.status == EmailOutboxStatus.SENT:
        return api_error("Already sent.", 400)

    # unlock it (optional)
    row.locked_at = None
    row.status = EmailOutboxStatus.PENDING
    db.session.flush()

    svc = EmailService(
        session=db.session,
        provider=os.getenv("MAIL_PROVIDER", "smtp"),
        from_email=os.getenv("MAIL_FROM_EMAIL", ""),
        from_name=os.getenv("MAIL_FROM_NAME", ""),
    )
    svc.send_outbox_row_now(row)
    db.session.commit()
    return api_success("Resent", data={"outbox_id": outbox_id, "status": row.status})