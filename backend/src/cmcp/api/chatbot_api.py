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
        material_id = payload.get("material_id")
        if material_id:
            out = svc.create_material_session(
                company_id=company_id,
                material_id=int(material_id),
                scope=payload.get("scope") or "material",
            )
        else:
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
        )
        db.session.commit()
        return api_success(message="OK", data=out)
    except Exception as exc:
        return _handle_error(exc)


@bp.get("/index-status/<int:material_id>")
@require_company_and_permission(doctype="Material", action="READ")
def index_status(company_id: int, material_id: int):
    try:
        data, queued = svc.get_index_status(company_id=company_id, material_id=material_id)
        if queued:
            db.session.commit()
        return api_success(data=data)
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
        out = svc.enqueue_reindex_material(
            company_id=company_id,
            material_id=material_id,
            trigger_type="manual_reindex",
        )
        db.session.commit()
        return api_success(message="Index job queued.", data=out)
    except Exception as exc:
        return _handle_error(exc)


@bp.post("/admin/reindex/<int:material_id>")
@require_company_and_permission(doctype="Material", action="UPDATE")
def admin_reindex_material(company_id: int, material_id: int):
    try:
        out = svc.enqueue_reindex_material(
            company_id=company_id,
            material_id=material_id,
            trigger_type="manual_reindex",
        )
        db.session.commit()
        return api_success(message="Reindex job queued.", data=out)
    except Exception as exc:
        return _handle_error(exc)


@bp.post("/admin/index-missing")
@require_company_and_permission(doctype="Material", action="UPDATE")
def admin_index_missing(company_id: int):
    try:
        out = svc.enqueue_index_missing(company_id=company_id)
        db.session.commit()
        return api_success(message="Missing index jobs queued.", data=out)
    except Exception as exc:
        return _handle_error(exc)


@bp.post("/admin/reindex-failed")
@require_company_and_permission(doctype="Material", action="UPDATE")
def admin_reindex_failed(company_id: int):
    try:
        out = svc.enqueue_reindex_failed(company_id=company_id)
        db.session.commit()
        return api_success(message="Failed reindex jobs queued.", data=out)
    except Exception as exc:
        return _handle_error(exc)


@bp.post("/admin/reindex-stale")
@require_company_and_permission(doctype="Material", action="UPDATE")
def admin_reindex_stale(company_id: int):
    try:
        out = svc.enqueue_reindex_stale(company_id=company_id)
        db.session.commit()
        return api_success(message="Stale reindex jobs queued.", data=out)
    except Exception as exc:
        return _handle_error(exc)
