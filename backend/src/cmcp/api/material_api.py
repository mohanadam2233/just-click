from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from flask import Blueprint, request
from pydantic import field_validator

from cmcp.common.api_response import api_success, api_error
from cmcp.common.cache import bump_detail, bump_list
from cmcp.config.database import db
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.modules.materials.constants import MAX_MATERIALS_PER_REQUEST
from cmcp.modules.materials.schemas import MaterialCreateIn, MaterialUpdateIn, MaterialFavoriteIn, _BaseIn
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


class MaterialDeleteIn(_BaseIn):
    """Delete a material."""
    permanent: bool = False


class MaterialBulkDeleteIn(_BaseIn):
    """Bulk delete materials."""
    material_ids: List[int]
    permanent: bool = False

    @field_validator("material_ids")
    @classmethod
    def validate_ids(cls, v: List[int]) -> List[int]:
        if not v:
            raise ValueError("material_ids is required")
        if len(v) > MAX_MATERIALS_PER_REQUEST:
            raise ValueError(f"Cannot delete more than {MAX_MATERIALS_PER_REQUEST} materials at once.")
        if len(set(v)) != len(v):
            raise ValueError("Duplicate material IDs are not allowed.")
        return v

def _json_body() -> Dict[str, Any]:
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        raise BusinessValidationError("Request body must be a JSON object.")
    return payload


class MaterialBulkUpdateIn(_BaseIn):
    """Frappe-style full-state sync for materials in an offering."""
    offering_id: int
    materials: List[Dict[str, Any]]
    missing_action: str = "disable"
    permanent: bool = False

    @field_validator("materials")
    @classmethod
    def validate_materials_length(cls, v: List) -> List:
        if len(v) > MAX_MATERIALS_PER_REQUEST:
            raise ValueError(f"Cannot process more than {MAX_MATERIALS_PER_REQUEST} materials at once.")
        return v

    @field_validator("missing_action")
    @classmethod
    def validate_missing_action(cls, v: str) -> str:
        if v not in {"disable", "delete", "keep"}:
            raise ValueError("missing_action must be 'disable', 'delete', or 'keep'")
        return v

@bp.post("/create")
@require_company_and_permission(doctype="Material", action="CREATE")
def create_material(company_id: int):
    """
    Create a single material.

    Supports:
    - JSON: application/json
    - Multipart: multipart/form-data (payload + file)
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

        # ✅ invalidate AFTER commit
        if ok:
            bump_list("materials:list", company_id)
            # if create returns id, bump detail too
            mid = (out or {}).get("data", {}).get("material_id") or (out or {}).get("material_id")
            if mid:
                bump_detail("materials:detail", company_id, int(mid))

        return api_success(message=msg, data=out, status_code=201) if ok else api_error(msg, status_code=400)


    except Exception as e:
        return _handle_error(e)

@bp.put("/<int:material_id>/update")
@require_company_and_permission(doctype="Material", action="UPDATE")
def update_material(company_id: int, material_id: int):
    """
    Update a single material.

    Cannot change: course_offering_id, chapter_id, material_type.
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
        if ok:
            bump_detail("materials:detail", company_id, int(material_id))
            bump_list("materials:list", company_id)

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)


    except Exception as e:
        return _handle_error(e)


@bp.put("/bulk-update")
@require_company_and_permission(doctype="Material", action="UPDATE")
def bulk_update_materials(company_id: int):
    """
    Frappe-style full-state sync for materials in an offering.

    This is the PREFERRED way to manage all materials for a specific offering.
    Send the COMPLETE desired state of materials.

    Example:
    {
        "offering_id": 205,
        "materials": [
            {"id": 501, "title": "Updated Syllabus"},
            {"title": "New Material", "material_type": "pdf", "page_count": 10}
        ],
        "missing_action": "disable"
    }
    """
    try:
        payload = MaterialBulkUpdateIn.model_validate(_json_body())

        ok, msg, out = svc.bulk_update_materials(
            company_id=company_id,
            offering_id=payload.offering_id,
            materials_data=payload.materials,
            missing_action=payload.missing_action,
            permanent=payload.permanent,
        )
        _commit_ok(ok)

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.delete("/<int:material_id>/delete")
@require_company_and_permission(doctype="Material", action="DELETE")
def delete_material(company_id: int, material_id: int):
    """
    Delete a material.

    Default: soft delete (is_enabled=false)
    Hard delete: send {"permanent": true} (blocked if has interactions)
    """
    try:
        payload = MaterialDeleteIn.model_validate(_json_body())

        ok, msg, out = svc.delete_material(
            company_id=company_id,
            material_id=material_id,
            permanent=payload.permanent,
        )
        _commit_ok(ok)

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)


@bp.post("/bulk-delete")
@require_company_and_permission(doctype="Material", action="DELETE")
def bulk_delete_materials(company_id: int):
    """
    Bulk delete materials.

    Body: {"material_ids": [1,2,3], "permanent": false}
    """
    try:
        payload = MaterialBulkDeleteIn.model_validate(_json_body())

        ok, msg, out = svc.bulk_delete_materials(
            company_id=company_id,
            material_ids=payload.material_ids,
            permanent=payload.permanent,
        )
        _commit_ok(ok)

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)

# ------------------------------
# LIST
# ------------------------------
@bp.get("/list")
@require_company_and_permission(doctype="Material", action="READ")
def list_materials(company_id: int):
    try:
        q = request.args

        mode = (q.get("mode") or "cursor").strip().lower()  # cursor|page
        external_base = _external_base()

        filters: Dict[str, Any] = {
            "course_offering_id": q.get("course_offering_id", type=int),  # CHANGED: use offering_id
            "course_id": q.get("course_id", type=int),  # Keep for backward compatibility
            "semester_id": q.get("semester_id", type=int),
            "department_id": q.get("department_id", type=int),
            "academic_year_id": q.get("academic_year_id", type=int),
            "chapter_id": q.get("chapter_id", type=int),
            "material_type": (q.get("material_type") or "").strip() or None,
            "search": (q.get("search") or "").strip() or None,
        }

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
@bp.get("/get/<int:material_id>")
@require_company_and_permission(doctype="Material", action="READ")
def get_material_detail(company_id: int, material_id: int):
    try:
        ok, msg, out = svc.get_material_detail(
            company_id=company_id,
            material_id=material_id,
            external_base=_external_base(),
        )
        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=404)

    except Exception as e:
        return _handle_error(e)





# ------------------------------
# FILTER OPTIONS
# ------------------------------
@bp.get("/filter-options")
@require_company_and_permission(doctype="Material", action="READ")
def get_material_filter_options(company_id: int):
    try:
        q = request.args

        filters: Dict[str, Any] = {
            "academic_year_id": q.get("academic_year_id", type=int),
            "semester_id": q.get("semester_id", type=int),
            "course_offering_id": q.get("course_offering_id", type=int),  # NEW
            "course_id": q.get("course_id", type=int),  # Keep for backward compatibility
            "chapter_id": q.get("chapter_id", type=int),
            "department_id": q.get("department_id", type=int),
            "faculty_id": q.get("faculty_id", type=int),  # NEW
            "search": (q.get("search") or "").strip() or None,
        }

        ok, msg, out = svc.get_material_filter_options(
            company_id=company_id,
            filters=filters,
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)

    except Exception as e:
        return _handle_error(e)



# ------------------------------
# TRACK VIEW
# ------------------------------
@bp.post("/<int:material_id>/view")
@require_company_and_permission(doctype="Material", action="READ")
def track_material_view(company_id: int, material_id: int):
    """
    Count view only when user intentionally opens the material.
    Uses cooldown to avoid duplicate refresh spam.
    Optional query param: ?cooldown_seconds=3600
    """
    try:
        cooldown_seconds = request.args.get("cooldown_seconds", type=int) or 3600

        ok, msg, out = svc.track_view(
            company_id=company_id,
            material_id=material_id,
            cooldown_seconds=cooldown_seconds,
        )
        _commit_ok(ok)

        if ok:
            bump_detail("materials:detail", company_id, int(material_id))
            bump_list("materials:list", company_id)
            return api_success(message=msg, data=out, status_code=200)

        return api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


# ------------------------------
# TRACK DOWNLOAD
# ------------------------------
@bp.post("/<int:material_id>/download")
@require_company_and_permission(doctype="Material", action="DOWNLOAD")
def track_material_download(company_id: int, material_id: int):
    """
    Count download when user explicitly clicks download.
    """
    try:
        ok, msg, out = svc.track_download(
            company_id=company_id,
            material_id=material_id,
        )
        _commit_ok(ok)

        if ok:
            bump_detail("materials:detail", company_id, int(material_id))
            bump_list("materials:list", company_id)
            return api_success(message=msg, data=out, status_code=200)

        return api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


# ------------------------------
# FAVORITE TOGGLE
# ------------------------------
@bp.post("/<int:material_id>/favorite")
@require_company_and_permission(doctype="Material", action="READ")
def set_material_favorite(company_id: int, material_id: int):
    try:
        payload = MaterialFavoriteIn.model_validate(request.get_json(silent=True) or {})

        ok, msg, out = svc.set_favorite(
            company_id=company_id,
            material_id=material_id,
            is_favorite=payload.is_favorite,
        )
        _commit_ok(ok)

        if ok:
            bump_detail("materials:detail", company_id, int(material_id))
            bump_list("materials:list", company_id)
            return api_success(message=msg, data=out, status_code=200)

        return api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)


# ------------------------------
# MY FAVORITES
# ------------------------------
@bp.get("/favorites/list")
@require_company_and_permission(doctype="Material", action="READ")
def list_my_favorites(company_id: int):
    try:
        q = request.args
        page = q.get("page", type=int) or 1
        per_page = q.get("per_page", type=int) or 20

        ok, msg, out = svc.list_my_favorites_page(
            company_id=company_id,
            page=page,
            per_page=per_page,
            external_base=_external_base(),
        )

        return api_success(message=msg, data=out, status_code=200) if ok else api_error(msg, status_code=400)
    except Exception as e:
        return _handle_error(e)