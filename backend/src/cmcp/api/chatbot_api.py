from __future__ import annotations

from flask import Blueprint, request

from cmcp.common.api_response import api_error, api_success
from cmcp.config.database import db
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.modules.chatbot.service import ChatbotService
from cmcp.security.rbac_guards import require_company_and_permission


bp = Blueprint("chatbot", __name__, url_prefix="/api/chatbot")
svc = ChatbotService()


def _handle_error(exc: Exception):
    db.session.rollback()
    if isinstance(exc, NotFoundError):
        return api_error(str(exc), status_code=404)
    if isinstance(exc, BusinessValidationError):
        return api_error(str(exc), status_code=400)
    return api_error(str(exc), status_code=400)


@bp.get("/semesters")
@require_company_and_permission(doctype="Material", action="READ")
def list_semesters(company_id: int):
    try:
        return api_success(data={"data": svc.list_semesters(company_id=company_id)})
    except Exception as exc:
        return _handle_error(exc)


@bp.get("/subjects")
@require_company_and_permission(doctype="Material", action="READ")
def list_subjects(company_id: int):
    try:
        semester = (request.args.get("semester") or "").strip()
        return api_success(data={"data": svc.list_subjects(company_id=company_id, semester=semester)})
    except Exception as exc:
        return _handle_error(exc)


@bp.post("/sessions")
@require_company_and_permission(doctype="Material", action="READ")
def create_session(company_id: int):
    try:
        payload = request.get_json(silent=True) or {}
        out = svc.create_session(
            company_id=company_id,
            semester=payload.get("semester") or "",
            subject=payload.get("subject") or "",
        )
        db.session.commit()
        return api_success(message="Session created.", data=out, status_code=201)
    except Exception as exc:
        return _handle_error(exc)


@bp.post("/ask")
@require_company_and_permission(doctype="Material", action="READ")
def ask(company_id: int):
    try:
        payload = request.get_json(silent=True) or {}
        out = svc.ask(
            company_id=company_id,
            session_id=payload.get("session_id") or "",
            question=payload.get("question") or "",
            semester=payload.get("semester") or "",
            subject=payload.get("subject") or "",
        )
        db.session.commit()
        return api_success(message="OK", data=out)
    except Exception as exc:
        return _handle_error(exc)


@bp.get("/sessions/<session_id>/history")
@require_company_and_permission(doctype="Material", action="READ")
def history(company_id: int, session_id: str):
    try:
        return api_success(data={"data": svc.history(company_id=company_id, session_id=session_id)})
    except Exception as exc:
        return _handle_error(exc)


@bp.delete("/sessions/<session_id>")
@require_company_and_permission(doctype="Material", action="READ")
def delete_session(company_id: int, session_id: str):
    try:
        out = svc.delete_session(company_id=company_id, session_id=session_id)
        db.session.commit()
        return api_success(message="Session deleted.", data=out)
    except Exception as exc:
        return _handle_error(exc)


@bp.post("/materials/<int:material_id>/index")
@require_company_and_permission(doctype="Material", action="UPDATE")
def index_single_material(company_id: int, material_id: int):
    try:
        payload = request.get_json(silent=True) or {}
        out = svc.index_material(
            company_id=company_id,
            material_id=material_id,
            force=bool(payload.get("force", False)),
        )
        db.session.commit()
        return api_success(message="Material indexed.", data=out)
    except Exception as exc:
        return _handle_error(exc)


@bp.post("/index-subject")
@require_company_and_permission(doctype="Material", action="UPDATE")
def index_subject(company_id: int):
    try:
        payload = request.get_json(silent=True) or {}
        out = svc.index_subject(
            company_id=company_id,
            semester=payload.get("semester") or "",
            subject=payload.get("subject") or "",
            force=bool(payload.get("force", False)),
        )
        db.session.commit()
        return api_success(message="Subject indexed.", data=out)
    except Exception as exc:
        return _handle_error(exc)
