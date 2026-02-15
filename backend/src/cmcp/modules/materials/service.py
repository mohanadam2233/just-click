# src/cmcp/modules/materials/service.py
from __future__ import annotations

import base64
import json
import os
from typing import Any, Dict, Optional, Tuple, List
from werkzeug.datastructures import FileStorage

from sqlalchemy.orm import Session

from cmcp.core.base_service import BaseService
from cmcp.core.exceptions import BusinessValidationError

from cmcp.modules.materials.models import Material, MaterialTypeEnum
from cmcp.modules.media.service import save_file_for
from cmcp.modules.media.utils import MediaFolder
from cmcp.modules.media.encrypted_files import file_url_from_key

from .repository import MaterialsRepo
from .validation import (
    require_title,
    require_material_type,
    validate_learning_objectives,
    validate_file_size_mb,
    validate_counts,
    validate_link_url_if_needed,
)
from .constants import (
    ERR_COURSE_NOT_FOUND,
    ERR_CHAPTER_NOT_FOUND,
    ERR_CHAPTER_NOT_IN_COURSE,
    ERR_MATERIAL_TITLE_EXISTS,
    ERR_CANNOT_CHANGE_COURSE,
    ERR_CANNOT_CHANGE_CHAPTER,
    ERR_CANNOT_CHANGE_TYPE,
    ERR_MATERIAL_NOT_FOUND,
    ERR_FILE_TYPE_NOT_ALLOWED,
    ERR_FILE_REQUIRED_FOR_TYPE,
    ALLOWED_EXTENSIONS_BY_TYPE,
)

def _calc_size_mb(b: bytes) -> float:
    return round(len(b) / (1024 * 1024), 4)

def _file_ext(filename: str) -> str:
    if not filename:
        return ""
    _, ext = os.path.splitext(filename.strip())
    return ext.lower()

# -----------------------------
# Cursor helpers (simple, stable)
# -----------------------------
def _encode_cursor(payload: Dict[str, Any]) -> str:
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")

def _decode_cursor(cursor: str) -> Dict[str, Any]:
    if not cursor:
        return {}
    pad = "=" * ((4 - len(cursor) % 4) % 4)
    raw = base64.urlsafe_b64decode((cursor + pad).encode("utf-8"))
    obj = json.loads(raw.decode("utf-8"))
    return obj if isinstance(obj, dict) else {}
class MaterialsService:
    def __init__(self, repo: Optional[MaterialsRepo] = None, session: Optional[Session] = None):
        self.repo = repo or MaterialsRepo(session=session)
        self.s: Session = self.repo.s

        # important: external tx (blueprint commits)
        self.material_svc = BaseService(Material, session=self.s, tx_mode="external")

    def _parse_enum_type(self, raw: str) -> MaterialTypeEnum:
        s = (raw or "").strip().lower()
        try:
            return MaterialTypeEnum(s)
        except Exception:
            raise BusinessValidationError("Invalid material_type.")

    def _validate_file_against_type(self, *, material_type: str, file_storage: Optional[FileStorage]) -> None:
        t = (material_type or "").strip().lower()

        if t == "link":
            # link should not require file
            return

        # If not link: file may be optional (you can decide). Here’s a good rule:
        # - slides/pdf/doc/video => file required
        # - other => optional
        if t in ("slides", "pdf", "doc", "video") and not file_storage:
            raise BusinessValidationError(ERR_FILE_REQUIRED_FOR_TYPE)

        if not file_storage:
            return

        ext = _file_ext(file_storage.filename or "")
        allowed = ALLOWED_EXTENSIONS_BY_TYPE.get(t)

        # For "other": skip per-type check (still validated by global media settings)
        if t == "other":
            return

        if allowed is not None and allowed and ext not in allowed:
            raise BusinessValidationError(ERR_FILE_TYPE_NOT_ALLOWED)

    def _clean_material_out(self, material: Material) -> Dict[str, Any]:
        return {
            "id": int(material.id),
            "title": (material.title or "").strip(),
        }

    # =========================================================
    # CREATE
    # =========================================================
    def create_material(
        self,
        *,
        company_id: int,
        data: Dict[str, Any],
        file_storage: Optional[FileStorage] = None,
        external_base: str = "",
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        course_id = int(data.get("course_id") or 0)
        if not self.repo.course_exists(company_id=company_id, course_id=course_id):
            return False, ERR_COURSE_NOT_FOUND, None

        chapter_id = data.get("chapter_id")
        chapter_id = int(chapter_id) if chapter_id else None

        if chapter_id:
            ch = self.repo.chapter_get(company_id=company_id, chapter_id=chapter_id)
            if not ch:
                return False, ERR_CHAPTER_NOT_FOUND, None
            if not self.repo.chapter_belongs_to_course(company_id=company_id, chapter_id=chapter_id, course_id=course_id):
                return False, ERR_CHAPTER_NOT_IN_COURSE, None

        title = require_title(data.get("title"))
        raw_type = require_material_type(data.get("material_type"))
        mtype = self._parse_enum_type(raw_type)

        # ✅ validate uploaded file against the material type
        self._validate_file_against_type(material_type=mtype.value, file_storage=file_storage)

        if self.repo.title_exists_in_scope(
            company_id=company_id,
            course_id=course_id,
            chapter_id=chapter_id,
            title=title,
        ):
            return False, ERR_MATERIAL_TITLE_EXISTS, None

        learning_objectives = validate_learning_objectives(data.get("learning_objectives"))
        file_size_mb = validate_file_size_mb(data.get("file_size_mb"))

        page_count, slide_count = validate_counts(
            mtype.value,
            data.get("page_count"),
            data.get("slide_count"),
        )

        file_url_in = validate_link_url_if_needed(mtype.value, data.get("file_url"))

        try:
            with self.s.begin_nested():
                payload: Dict[str, Any] = {
                    "course_id": course_id,
                    "chapter_id": chapter_id,
                    "title": title,
                    "material_type": mtype,
                    "file_url": file_url_in if mtype.value == "link" else None,
                    "page_count": page_count,
                    "slide_count": slide_count,
                    "file_size_mb": file_size_mb,
                    "learning_objectives": learning_objectives,
                    "description": (data.get("description") or "").strip() or None,
                    "is_downloadable": bool(data.get("is_downloadable", True)),
                    "is_enabled": bool(data.get("is_enabled", True)),
                }

                ok, msg, out = self.material_svc.create(company_id=company_id, data=payload, return_public=False)
                if not ok or not out or "record" not in out:
                    raise BusinessValidationError(msg)

                material_id = int(out["record"]["id"])
                material = self.repo.materials.get(material_id, company_id=int(company_id))
                if not material:
                    raise BusinessValidationError("Create failed.")

                # upload file if provided (non-link)
                if file_storage and mtype.value != "link":
                    raw = file_storage.read()
                    file_storage.stream.seek(0)

                    new_key = save_file_for(
                        folder=MediaFolder.MATERIALS,
                        item_id=material.id,
                        file=file_storage,
                        old_file_key=None,
                    )
                    if new_key:
                        material.file_url = file_url_from_key(new_key, external_base=external_base)
                        if material.file_size_mb is None:
                            material.file_size_mb = _calc_size_mb(raw)

                self.s.flush()
                return True, "Material created successfully.", {"material": self._clean_material_out(material)}

        except BusinessValidationError as e:
            return False, str(e), None
        except Exception as e:
            return False, f"Unexpected error: {e}", None

    # =========================================================
    # UPDATE
    # =========================================================
    def update_material(
        self,
        *,
        company_id: int,
        material_id: int,
        data: Dict[str, Any],
        file_storage: Optional[FileStorage] = None,
        external_base: str = "",
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        material = self.repo.materials.get(int(material_id), company_id=int(company_id))
        if not material:
            return False, ERR_MATERIAL_NOT_FOUND, None

        # ❌ cannot change these
        if "course_id" in data and data["course_id"] is not None and int(data["course_id"]) != int(material.course_id):
            return False, ERR_CANNOT_CHANGE_COURSE, None

        if "chapter_id" in data and data["chapter_id"] is not None:
            incoming = int(data["chapter_id"])
            current = int(material.chapter_id) if material.chapter_id else None
            if current != incoming:
                return False, ERR_CANNOT_CHANGE_CHAPTER, None

        if "material_type" in data and data["material_type"] is not None:
            if str(data["material_type"]).strip().lower() != material.material_type.value.lower():
                return False, ERR_CANNOT_CHANGE_TYPE, None

        # ✅ validate uploaded file against existing material type
        self._validate_file_against_type(material_type=material.material_type.value, file_storage=file_storage)

        patch: Dict[str, Any] = {}

        if "title" in data and data["title"] is not None:
            new_title = require_title(data.get("title"))
            if new_title.strip().lower() != (material.title or "").strip().lower():
                if self.repo.title_exists_in_scope(
                    company_id=company_id,
                    course_id=int(material.course_id),
                    chapter_id=int(material.chapter_id) if material.chapter_id else None,
                    title=new_title,
                    exclude_id=int(material.id),
                ):
                    return False, ERR_MATERIAL_TITLE_EXISTS, None
                patch["title"] = new_title

        if "description" in data:
            patch["description"] = (data.get("description") or "").strip() or None

        if "learning_objectives" in data:
            patch["learning_objectives"] = validate_learning_objectives(data.get("learning_objectives"))

        if "is_downloadable" in data and data["is_downloadable"] is not None:
            patch["is_downloadable"] = bool(data["is_downloadable"])

        if "is_enabled" in data and data["is_enabled"] is not None:
            patch["is_enabled"] = bool(data["is_enabled"])

        if "file_size_mb" in data:
            patch["file_size_mb"] = validate_file_size_mb(data.get("file_size_mb"))

        if "file_url" in data:
            patch["file_url"] = validate_link_url_if_needed(material.material_type.value, data.get("file_url"))

        if ("page_count" in data) or ("slide_count" in data):
            incoming_page = data.get("page_count", material.page_count)
            incoming_slide = data.get("slide_count", material.slide_count)
            page_count, slide_count = validate_counts(material.material_type.value, incoming_page, incoming_slide)
            patch["page_count"] = page_count
            patch["slide_count"] = slide_count

        try:
            with self.s.begin_nested():
                ok, msg, _ = self.material_svc.update(company_id=company_id, id=material_id, data=patch, return_public=False)
                if not ok:
                    raise BusinessValidationError(msg)

                material = self.repo.materials.get(int(material_id), company_id=int(company_id))
                if not material:
                    raise BusinessValidationError(ERR_MATERIAL_NOT_FOUND)

                if file_storage and material.material_type.value != "link":
                    raw = file_storage.read()
                    file_storage.stream.seek(0)

                    new_key = save_file_for(
                        folder=MediaFolder.MATERIALS,
                        item_id=material.id,
                        file=file_storage,
                        old_file_key=None,
                    )
                    if new_key:
                        material.file_url = file_url_from_key(new_key, external_base=external_base)
                        if material.file_size_mb is None:
                            material.file_size_mb = _calc_size_mb(raw)

                self.s.flush()
                return True, "Material updated successfully.", {"material": self._clean_material_out(material)}

        except BusinessValidationError as e:
            return False, str(e), None
        except Exception as e:
            return False, f"Unexpected error: {e}", None

    # =========================================================
    # SOFT DELETE (single)
    # =========================================================
    def delete_material(self, *, company_id: int, material_id: int) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        ok, msg, out = self.material_svc.delete(company_id=company_id, id=material_id, soft=True)
        if not ok:
            return False, msg, None
        return True, "Material disabled successfully.", {"material": {"id": int(material_id)}}

    # =========================================================
    # SOFT DELETE (bulk)
    # =========================================================
    def bulk_delete_materials(self, *, company_id: int, ids: List[int]) -> Tuple[bool, str, Dict[str, Any]]:
        ok, msg, out = self.material_svc.bulk_delete(company_id=company_id, ids=ids, soft=True)
        if not ok:
            return False, msg, {"deleted": 0, "requested": len(ids or [])}
        # out already has deleted/requested
        return True, "Materials disabled successfully.", out

    # =========================================================
    # LIST (CURSOR)
    # =========================================================

    def list_materials_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            cursor: Optional[str],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
            external_base: str,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        limit = max(1, min(int(limit or 20), 100))

        # cursor uses "last_id" for stable paging (descending by id)
        cur = _decode_cursor(cursor or "")
        last_id = cur.get("last_id")
        try:
            last_id = int(last_id) if last_id is not None else None
        except Exception:
            last_id = None

        rows, total_count, has_more = self.repo.list_materials_cursor(
            company_id=company_id,
            limit=limit,
            last_id=last_id,
            filters=filters,
            is_enabled=is_enabled,
        )

        data = [self.repo.shape_material_list_row(r, external_base=external_base) for r in rows]

        next_cursor = None
        if has_more and rows:
            next_cursor = _encode_cursor({"last_id": int(rows[-1].material_id)})

        return True, "OK", {
            "data": data,
            "pagination": {
                "limit": limit,
                "next_cursor": next_cursor,
                "has_more": bool(has_more),
            },
            "meta": {"total_count": int(total_count)},
        }

    # =========================================================
    # LIST (PAGE)
    # =========================================================

    def list_materials_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
            external_base: str,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        # keep your rule: 10/20/50/500
        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20
        page = max(int(page or 1), 1)

        rows, total_count, pages = self.repo.list_materials_page(
            company_id=company_id,
            page=page,
            per_page=per_page,
            filters=filters,
            is_enabled=is_enabled,
        )

        data = [self.repo.shape_material_list_row(r, external_base=external_base) for r in rows]

        return True, "OK", {
            "data": data,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "pages": int(pages),
                "total_count": int(total_count),
            },
        }

    # =========================================================
    # DETAIL
    # =========================================================

    def get_material_detail(
            self,
            *,
            company_id: int,
            material_id: int,
            external_base: str,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        row = self.repo.get_material_detail(company_id=company_id, material_id=material_id)
        if not row:
            return False, "Material not found.", {}

        data = self.repo.shape_material_detail_row(row, external_base=external_base)
        return True, "OK", {"data": data}