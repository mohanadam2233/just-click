from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from flask import Blueprint, request

from cmcp.common.api_response import api_success, api_error
from cmcp.config.database import db
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.modules.materials.schemas import MaterialCreateIn, MaterialUpdateIn
from cmcp.modules.materials.service import MaterialsService
from cmcp.security.rbac_guards import require_company_and_permission


bp = Blueprint("materials", __name__, url_prefix="/api/materials")
svc = MaterialsService()

def _commit_ok(ok: bool):
    if ok:
        db.session.commit()
    else:
        db.session.rollback()

def _handle_error(e: Exception):
    db.session.rollback()
    if isinstance(e, NotFoundError):
        return api_error(str(e), status_code=404)
    if isinstance(e, BusinessValidationError):
        return api_error(str(e), status_code=400)
    return api_error(str(e), status_code=400)

def _external_base() -> str:
    return (request.host_url or "").rstrip("/")

@bp.post("/create/material")
@require_company_and_permission(doctype="Material", action="CREATE")
def create_material(company_id: int):
    """
    Accepts:
      - application/json
      - multipart/form-data (payload=<json>, file=<file>)
    """
    try:
        file_storage = None
        if request.content_type and "multipart/form-data" in request.content_type:
            payload_raw = request.form.get("payload")
            if not payload_raw:
                return api_error("Missing 'payload' JSON in form-data.", status_code=422)
            payload = MaterialCreateIn.model_validate(json.loads(payload_raw))
            file_storage = request.files.get("file")
        else:
            payload = MaterialCreateIn.model_validate(request.get_json(silent=True) or {})

        ok, msg, out = svc.create_material(
            company_id=company_id,
            data=payload.model_dump(),
            file_storage=file_storage,
            external_base=_external_base(),
        )
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)

@bp.put("/<int:material_id>/update")
@require_company_and_permission(doctype="Material", action="UPDATE")
def update_material(company_id: int, material_id: int):
    """
    Accepts:
      - JSON
      - multipart/form-data (payload=<json>, file=<file>)
    """
    try:
        file_storage = None
        if request.content_type and "multipart/form-data" in request.content_type:
            payload_raw = request.form.get("payload")
            if not payload_raw:
                return api_error("Missing 'payload' JSON in form-data.", status_code=422)
            payload = MaterialUpdateIn.model_validate(json.loads(payload_raw))
            file_storage = request.files.get("file")
        else:
            payload = MaterialUpdateIn.model_validate(request.get_json(silent=True) or {})

        ok, msg, out = svc.update_material(
            company_id=company_id,
            material_id=material_id,
            data=payload.model_dump(exclude_unset=True),
            file_storage=file_storage,
            external_base=_external_base(),
        )
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)

@bp.delete("/<int:material_id>/delete")
@require_company_and_permission(doctype="Material", action="DELETE")
def delete_material(company_id: int, material_id: int):
    try:
        ok, msg, out = svc.delete_material(company_id=company_id, material_id=material_id)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)

@bp.post("/bulk-delete")
@require_company_and_permission(doctype="Material", action="DELETE")
def bulk_delete_materials(company_id: int):
    """
    Soft delete only.
    Body: { "ids": [1,2,3] }
    """
    try:
        body = request.get_json(silent=True) or {}
        ids = body.get("ids") or []
        ids = [int(x) for x in ids if x]

        ok, msg, out = svc.bulk_delete_materials(company_id=company_id, ids=ids)
        _commit_ok(ok)
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


# ------------------------------
# LIST
# ------------------------------
@bp.get("")
@require_company_and_permission(doctype="Material", action="READ")
def list_materials(company_id: int):
    """
    GET /api/materials?course_id=&semester_id=&department_id=&academic_year_id=&chapter_id=&material_type=
                    &search=&is_enabled=&limit=&cursor=&page=&per_page=&mode=
    mode:
      - cursor (default) => cursor pagination
      - page             => page/per_page pagination (10/20/50/500)
    """
    try:
        q = request.args

        mode = (q.get("mode") or "cursor").strip().lower()  # cursor|page
        external_base = _external_base()

        # filters
        filters: Dict[str, Any] = {
            "course_id": q.get("course_id", type=int),
            "semester_id": q.get("semester_id", type=int),
            "department_id": q.get("department_id", type=int),
            "academic_year_id": q.get("academic_year_id", type=int),
            "chapter_id": q.get("chapter_id", type=int),
            "material_type": (q.get("material_type") or "").strip() or None,
            "search": (q.get("search") or "").strip() or None,
        }

        # enabled filter (optional)
        is_enabled_raw = q.get("is_enabled")
        is_enabled: Optional[bool] = None
        if is_enabled_raw is not None:
            s = str(is_enabled_raw).strip().lower()
            if s in {"1", "true", "yes"}:
                is_enabled = True
            elif s in {"0", "false", "no"}:
                is_enabled = False

        if mode == "page":
            page = q.get("page", type=int) or 1
            per_page = q.get("per_page", type=int) or 20

            ok, msg, out = svc.list_materials_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
                external_base=external_base,
            )
            return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

        # default cursor
        limit = q.get("limit", type=int) or 20
        cursor = (q.get("cursor") or "").strip() or None

        ok, msg, out = svc.list_materials_cursor(
            company_id=company_id,
            limit=limit,
            cursor=cursor,
            filters=filters,
            is_enabled=is_enabled,
            external_base=external_base,
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)

# ------------------------------
# DETAIL
# ------------------------------
@bp.get("/<int:material_id>")
@require_company_and_permission(doctype="Material", action="READ")
def get_material_detail(company_id: int, material_id: int):
    """
    GET /api/materials/{material_id}
    """
    try:
        ok, msg, out = svc.get_material_detail(
            company_id=company_id,
            material_id=material_id,
            external_base=_external_base(),
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=404)

    except Exception as e:
        return _handle_error(e)