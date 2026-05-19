# # src/cmcp/modules/materials/service.py

from __future__ import annotations

import base64
import json
import os
from sqlite3 import IntegrityError
from typing import Any, Dict, Optional, Tuple, List, Set

from flask import g
from werkzeug.datastructures import FileStorage

from sqlalchemy.orm import Session

from cmcp.core.base_service import BaseService
from cmcp.core.exceptions import BusinessValidationError, NotFoundError

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
    ERR_COURSE_OFFERING_NOT_FOUND,  # NEW
    ALLOWED_EXTENSIONS_BY_TYPE, ERR_LEARNING_OBJECTIVES_INVALID, ERR_LINK_INVALID_URL, ERR_INVALID_MISSING_ACTION,
    ERR_FILE_SIZE_TOO_LARGE, ERR_FILE_SIZE_NEGATIVE, MAX_FILE_SIZE_MB, ERR_MATERIAL_COUNTS_CONFLICT,
    ERR_SLIDE_COUNT_MIN, ERR_PAGE_COUNT_MIN, ERR_MATERIAL_TYPE_INVALID, MAX_TITLE_LENGTH, MAX_MATERIALS_PER_REQUEST,
    ERR_TOO_MANY_MATERIALS, ERR_DUPLICATE_IDS, ERR_MATERIAL_HAS_INTERACTIONS, ERR_CHAPTER_NOT_IN_OFFERING,
    ERR_CANNOT_CHANGE_OFFERING,
)

from cmcp.common.cache import cached_list, cached_detail


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


# =========================================================
# VALIDATION HELPERS (Centralized for reusability)
# =========================================================

def _require_text(value: Any, field_label: str, max_length: int = MAX_TITLE_LENGTH) -> str:
    value = (str(value) if value is not None else "").strip()
    if not value:
        raise BusinessValidationError(f"{field_label} is required.")
    if len(value) > max_length:
        raise BusinessValidationError(f"{field_label} is too long (max {max_length} characters).")
    return value


def _safe_text(value: Any) -> Optional[str]:
    value = (str(value) if value is not None else "").strip()
    return value or None


def _as_bool(value: Any, default: bool = True) -> bool:
    if value is None:
        return default
    return bool(value)


def _parse_material_type(raw: Any) -> MaterialTypeEnum:
    s = (str(raw) if raw is not None else "").strip().lower()
    try:
        return MaterialTypeEnum(s)
    except ValueError:
        raise BusinessValidationError(ERR_MATERIAL_TYPE_INVALID)


def _validate_file_against_type(material_type: str, file_storage: Optional[FileStorage]) -> None:
    """Validate file matches material type requirements."""
    t = material_type.lower()

    if t == "link":
        return

    if t in ("slides", "pdf", "doc", "video") and not file_storage:
        raise BusinessValidationError(ERR_FILE_REQUIRED_FOR_TYPE)

    if not file_storage:
        return

    ext = os.path.splitext(file_storage.filename or "")[1].lower()
    allowed = ALLOWED_EXTENSIONS_BY_TYPE.get(t, set())

    if allowed and ext not in allowed:
        raise BusinessValidationError(f"{ERR_FILE_TYPE_NOT_ALLOWED} Allowed: {', '.join(allowed)}")


def _validate_counts(
        material_type: str,
        page_count: Any,
        slide_count: Any,
) -> Tuple[Optional[int], Optional[int]]:
    """Validate and return page_count, slide_count based on material type."""
    t = material_type.lower()

    if t == "pdf" or t == "doc":
        if slide_count is not None:
            raise BusinessValidationError(ERR_MATERIAL_COUNTS_CONFLICT)
        if page_count is not None:
            pc = int(page_count)
            if pc < 1:
                raise BusinessValidationError(ERR_PAGE_COUNT_MIN)
            return pc, None
        return None, None

    if t == "slides":
        if page_count is not None:
            raise BusinessValidationError(ERR_MATERIAL_COUNTS_CONFLICT)
        if slide_count is not None:
            sc = int(slide_count)
            if sc < 1:
                raise BusinessValidationError(ERR_SLIDE_COUNT_MIN)
            return None, sc
        return None, None

    # For video, link, other - no counts allowed
    if page_count is not None or slide_count is not None:
        raise BusinessValidationError(ERR_MATERIAL_COUNTS_CONFLICT)

    return None, None


def _validate_file_size_mb(value: Any) -> Optional[float]:
    if value is None:
        return None

    size = float(value)
    if size < 0:
        raise BusinessValidationError(ERR_FILE_SIZE_NEGATIVE)
    if size > MAX_FILE_SIZE_MB:
        raise BusinessValidationError(ERR_FILE_SIZE_TOO_LARGE)
    return size


def _validate_link_url(url: Optional[str]) -> Optional[str]:
    if url is None:
        return None

    url = url.strip()
    if not url:
        return None

    if not url.startswith(("http://", "https://")):
        raise BusinessValidationError(ERR_LINK_INVALID_URL)

    return url


def _validate_learning_objectives(value: Any) -> Optional[List[str]]:
    if value is None:
        return None

    if not isinstance(value, list):
        raise BusinessValidationError(ERR_LEARNING_OBJECTIVES_INVALID)

    cleaned = [str(item).strip() for item in value if str(item).strip()]
    return cleaned if cleaned else None


def _normalize_missing_action(action: str) -> str:
    action = (action or "disable").strip().lower()
    if action not in {"disable", "delete", "keep"}:
        raise BusinessValidationError(ERR_INVALID_MISSING_ACTION)
    return action

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
        """
        Create a single material.

        Required: course_offering_id, title, material_type
        """
        try:
            # Validate course offering
            course_offering_id = int(data.get("course_offering_id") or 0)
            if not course_offering_id:
                raise BusinessValidationError("course_offering_id is required.")

            if not self.repo.course_offering_exists(company_id=company_id, offering_id=course_offering_id):
                raise NotFoundError(ERR_COURSE_OFFERING_NOT_FOUND)

            # Validate chapter if provided
            chapter_id = data.get("chapter_id")
            chapter_id = int(chapter_id) if chapter_id else None

            if chapter_id:
                if not self.repo.chapter_exists(company_id=company_id, chapter_id=chapter_id):
                    raise NotFoundError(ERR_CHAPTER_NOT_FOUND)

                if not self.repo.chapter_belongs_to_offering(
                        company_id=company_id,
                        chapter_id=chapter_id,
                        offering_id=course_offering_id,
                ):
                    raise BusinessValidationError(ERR_CHAPTER_NOT_IN_OFFERING)

            # Validate title
            title = _require_text(data.get("title"), "Title")

            # Check title uniqueness
            if self.repo.title_exists_in_scope(
                    company_id=company_id,
                    course_offering_id=course_offering_id,
                    chapter_id=chapter_id,
                    title=title,
            ):
                raise BusinessValidationError(ERR_MATERIAL_TITLE_EXISTS)

            # Validate material type
            material_type = _parse_material_type(data.get("material_type"))

            # Validate file
            _validate_file_against_type(material_type.value, file_storage)

            # Validate counts
            page_count, slide_count = _validate_counts(
                material_type.value,
                data.get("page_count"),
                data.get("slide_count"),
            )

            # Validate other fields
            file_size_mb = _validate_file_size_mb(data.get("file_size_mb"))
            learning_objectives = _validate_learning_objectives(data.get("learning_objectives"))
            file_url = _validate_link_url(data.get("file_url")) if material_type.value == "link" else None

            with self.s.begin_nested():
                payload = {
                    "company_id": int(company_id),
                    "course_offering_id": course_offering_id,
                    "chapter_id": chapter_id,
                    "title": title,
                    "material_type": material_type,
                    "file_url": file_url,
                    "page_count": page_count,
                    "slide_count": slide_count,
                    "file_size_mb": file_size_mb,
                    "learning_objectives": learning_objectives,
                    "description": _safe_text(data.get("description")),
                    "is_downloadable": _as_bool(data.get("is_downloadable"), default=True),
                    "is_enabled": _as_bool(data.get("is_enabled"), default=True),
                }

                material = self.repo.create_material(payload)

                # Handle file upload
                if file_storage and material_type.value != "link":
                    self._upload_material_file(material, file_storage, external_base)

                self.s.flush()

                return True, "Material created successfully", {
                    "material": self._material_record(material)
                }

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError as e:

            return False, "Database constraint error. Please check unique fields.", None
        except Exception as e:

            return False, f"Unexpected error: {e}", None

        # =========================================================
        # UPDATE (Single)
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
        """
        Update a single material.

        Cannot change: course_offering_id, chapter_id, material_type
        """
        try:
            material = self.repo.get_material(material_id, company_id=company_id)
            if not material:
                raise NotFoundError(ERR_MATERIAL_NOT_FOUND)

            # Prevent changing immutable fields
            if "course_offering_id" in data and data["course_offering_id"] is not None:
                if int(data["course_offering_id"]) != int(material.course_offering_id):
                    raise BusinessValidationError(ERR_CANNOT_CHANGE_OFFERING)

            if "chapter_id" in data:
                incoming = int(data["chapter_id"]) if data["chapter_id"] else None
                current = int(material.chapter_id) if material.chapter_id else None
                if current != incoming:
                    raise BusinessValidationError(ERR_CANNOT_CHANGE_CHAPTER)

            if "material_type" in data and data["material_type"] is not None:
                if str(data["material_type"]).lower() != material.material_type.value.lower():
                    raise BusinessValidationError(ERR_CANNOT_CHANGE_TYPE)

            # Validate file against existing type
            _validate_file_against_type(material.material_type.value, file_storage)

            patch: Dict[str, Any] = {}

            # Update title with uniqueness check
            if "title" in data and data["title"] is not None:
                new_title = _require_text(data["title"], "Title")

                if new_title.lower() != (material.title or "").lower():
                    if self.repo.title_exists_in_scope(
                            company_id=company_id,
                            course_offering_id=int(material.course_offering_id),
                            chapter_id=int(material.chapter_id) if material.chapter_id else None,
                            title=new_title,
                            exclude_id=int(material.id),
                    ):
                        raise BusinessValidationError(ERR_MATERIAL_TITLE_EXISTS)
                    patch["title"] = new_title

            # Other updatable fields
            if "description" in data:
                patch["description"] = _safe_text(data["description"])

            if "learning_objectives" in data:
                patch["learning_objectives"] = _validate_learning_objectives(data["learning_objectives"])

            if "is_downloadable" in data:
                patch["is_downloadable"] = _as_bool(data["is_downloadable"])

            if "is_enabled" in data:
                patch["is_enabled"] = _as_bool(data["is_enabled"])

            if "file_size_mb" in data:
                patch["file_size_mb"] = _validate_file_size_mb(data["file_size_mb"])

            if "file_url" in data and material.material_type.value == "link":
                patch["file_url"] = _validate_link_url(data["file_url"])

            # Update counts if provided
            if "page_count" in data or "slide_count" in data:
                page_count, slide_count = _validate_counts(
                    material.material_type.value,
                    data.get("page_count", material.page_count),
                    data.get("slide_count", material.slide_count),
                )
                patch["page_count"] = page_count
                patch["slide_count"] = slide_count

            with self.s.begin_nested():
                self.repo.update_material(material, patch)

                # Handle file upload
                if file_storage and material.material_type.value != "link":
                    self._upload_material_file(material, file_storage, external_base)

                self.s.flush()

                return True, "Material updated successfully", {
                    "material": self._material_record(material)
                }

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except IntegrityError as e:

            return False, "Database constraint error.", None
        except Exception as e:

            return False, f"Unexpected error: {e}", None

    # =========================================================
    # DELETE (Single & Bulk)
    # =========================================================

    def delete_material(
            self,
            *,
            company_id: int,
            material_id: int,
            permanent: bool = False,
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Delete a material. Soft delete by default."""
        try:
            material = self.repo.get_material(material_id, company_id=company_id)
            if not material:
                raise NotFoundError(ERR_MATERIAL_NOT_FOUND)

            with self.s.begin_nested():
                if permanent:
                    if self.repo.has_interactions(company_id=company_id, material_id=material_id):
                        raise BusinessValidationError(ERR_MATERIAL_HAS_INTERACTIONS)


                    self.repo.delete_material_permanently(material)
                else:
                    material.is_enabled = False
                    self.s.flush([material])

            action = "permanently deleted" if permanent else "disabled"
            return True, f"Material {action} successfully", {
                "material": self._material_record(material)
            }

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except Exception as e:

            return False, f"Unexpected error: {e}", None

    def bulk_delete_materials(
            self,
            *,
            company_id: int,
            material_ids: List[int],
            permanent: bool = False,
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Bulk delete materials with detailed results."""
        try:
            if not material_ids:
                raise BusinessValidationError("material_ids is required.")

            if len(material_ids) > MAX_MATERIALS_PER_REQUEST:
                raise BusinessValidationError(ERR_TOO_MANY_MATERIALS)

            material_ids = [int(x) for x in material_ids]
            if len(set(material_ids)) != len(material_ids):
                raise BusinessValidationError(ERR_DUPLICATE_IDS)

            # Batch fetch all materials (ONE query)
            materials = self.repo.get_materials_by_ids(material_ids, company_id=company_id)

            # Batch check interactions for permanent delete (ONE query)
            interaction_counts = {}
            if permanent:
                interaction_counts = self.repo.count_interactions_for_materials(
                    company_id=company_id,
                    material_ids=material_ids,
                )

            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            with self.s.begin_nested():
                for material_id in material_ids:
                    material = materials.get(int(material_id))

                    if not material:
                        failed.append({"id": material_id, "message": ERR_MATERIAL_NOT_FOUND})
                        continue

                    if permanent:
                        count = interaction_counts.get(int(material_id), 0)
                        if count > 0:
                            failed.append({
                                "id": material_id,
                                "message": f"Cannot delete: has {count} student interaction(s).",
                            })
                            continue


                        self.repo.delete_material_permanently(material)
                    else:
                        material.is_enabled = False
                        self.s.flush([material])

                    deleted.append(material_id)

            return True, "Bulk delete completed", {
                "deleted": deleted,
                "failed": failed,
                "deleted_count": len(deleted),
                "failed_count": len(failed),
                "permanent": permanent,
            }

        except BusinessValidationError as e:
            return False, str(e), None
        except Exception as e:

            return False, f"Unexpected error: {e}", None

        # =========================================================
        # FRAPPE-STYLE BULK UPDATE (Full-State Sync)
        # =========================================================

    def bulk_update_materials(
            self,
            *,
            company_id: int,
            offering_id: int,
            materials_data: List[Dict[str, Any]],
            missing_action: str = "disable",
            permanent: bool = False,
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Frappe-style full-state sync for materials in an offering.

        This is the PREFERRED way to manage materials for a specific offering.

        Rules:
        - ID in request → UPDATE existing material
        - No ID → CREATE new material
        - Existing ID not in request → DISABLE (or DELETE if permanent=true & missing_action=delete)
        """
        try:
            # Validate offering
            if not offering_id:
                raise BusinessValidationError("offering_id is required.")

            if not self.repo.course_offering_exists(company_id=company_id, offering_id=offering_id):
                raise NotFoundError(ERR_COURSE_OFFERING_NOT_FOUND)

            # Validate request size
            if len(materials_data) > MAX_MATERIALS_PER_REQUEST:
                raise BusinessValidationError(ERR_TOO_MANY_MATERIALS)

            # Normalize missing action
            action = _normalize_missing_action(missing_action)

            # Fetch existing materials for this offering (ONE query with eager loading)
            existing_ids = self.repo.get_material_ids_by_offering(
                company_id=company_id,
                offering_id=offering_id,
            )

            existing_materials = self.repo.get_materials_by_ids(
                list(existing_ids),
                company_id=company_id,
                eager_load=["course_offering", "chapter"],
            )
            existing_map = {int(m.id): m for m in existing_materials.values()}

            # Process all materials
            incoming_ids: Set[int] = set()
            created: List[Material] = []
            updated: List[Material] = []

            with self.s.begin_nested():
                for raw in materials_data:
                    row = dict(raw or {})
                    material_id = row.get("id")

                    if material_id:
                        # UPDATE existing material
                        material_id = int(material_id)
                        incoming_ids.add(material_id)

                        if material_id not in existing_map:
                            raise BusinessValidationError(
                                f"Material {material_id} does not exist or does not belong to offering {offering_id}."
                            )

                        material = existing_map[material_id]

                        # Prevent changing offering via bulk update
                        if "course_offering_id" in row and int(row["course_offering_id"]) != offering_id:
                            raise BusinessValidationError(
                                f"Cannot move material {material_id} to different offering via bulk update."
                            )

                        # Remove immutable fields
                        row.pop("course_offering_id", None)
                        row.pop("material_type", None)

                        # Apply update
                        success, msg, _ = self.update_material(
                            company_id=company_id,
                            material_id=material_id,
                            data=row,
                        )
                        if not success:
                            raise BusinessValidationError(f"Error updating material {material_id}: {msg}")

                        material = self.repo.get_material(material_id, company_id=company_id)
                        updated.append(material)
                    else:
                        # CREATE new material
                        row["course_offering_id"] = offering_id

                        success, msg, out = self.create_material(
                            company_id=company_id,
                            data=row,
                        )
                        if not success or not out:
                            raise BusinessValidationError(f"Error creating material: {msg}")

                        material_id = out["material"]["id"]
                        material = self.repo.get_material(material_id, company_id=company_id)
                        created.append(material)
                        incoming_ids.add(material_id)

                # Handle missing materials (Frappe pattern)
                if action != "keep":
                    missing_ids = set(existing_map.keys()) - incoming_ids

                    for material_id in missing_ids:
                        material = existing_map[material_id]

                        if action == "disable":
                            material.is_enabled = False
                            self.s.flush([material])
                        elif action == "delete":
                            if not permanent:
                                raise BusinessValidationError(
                                    f"Cannot delete material {material_id} without permanent=true."
                                )

                            if self.repo.has_interactions(company_id=company_id, material_id=material_id):
                                raise BusinessValidationError(
                                    f"Cannot delete material {material_id}: has student interactions."
                                )


                            self.repo.delete_material_permanently(material)

            return True, "Materials updated successfully", {
                "created": [self._material_record(m) for m in created],
                "updated": [self._material_record(m) for m in updated],
                "deleted": list(missing_ids) if action == "delete" else [],
                "disabled": list(missing_ids) if action == "disable" else [],
                "created_count": len(created),
                "updated_count": len(updated),
                "deleted_count": len(missing_ids) if action == "delete" else 0,
                "disabled_count": len(missing_ids) if action == "disable" else 0,
            }

        except (BusinessValidationError, NotFoundError) as e:
            return False, str(e), None
        except Exception as e:

            return False, f"Unexpected error: {e}", None

    # =========================================================
    # FILE HANDLING
    # =========================================================

    def _upload_material_file(
            self,
            material: Material,
            file_storage: FileStorage,
            external_base: str,
    ) -> None:
        """Upload file to storage and update material file_url."""
        try:
            # Read file for size calculation
            raw = file_storage.read()
            file_storage.stream.seek(0)

            # Update file size if not set
            if material.file_size_mb is None:
                size_mb = round(len(raw) / (1024 * 1024), 4)
                material.file_size_mb = size_mb

            # TODO: Replace with your actual S3/MinIO upload logic
            # from cmcp.core.storage import save_file_for, file_url_from_key
            # new_key = save_file_for(
            #     folder="materials",
            #     item_id=material.id,
            #     file=file_storage,
            # )
            # material.file_url = file_url_from_key(new_key, external_base=external_base)

            # Placeholder URL
            material.file_url = f"{external_base}/materials/{material.id}/{file_storage.filename}"
            self.s.flush([material])

        except Exception as e:

            raise BusinessValidationError(f"File upload failed: {e}")

        # =========================================================
        # RECORD FORMATTERS
        # =========================================================

    @staticmethod
    def _material_record(material: Material) -> Dict[str, Any]:
        """Format material for API response (consistent shape)."""
        return {
            "id": int(material.id),
            "title": material.title,
            "material_type": material.material_type.value,
            "course_offering_id": int(material.course_offering_id),
            "chapter_id": int(material.chapter_id) if material.chapter_id else None,
            "file_url": material.file_url,
            "file_size_mb": float(material.file_size_mb) if material.file_size_mb is not None else None,
            "page_count": material.page_count,
            "slide_count": material.slide_count,
            "learning_objectives": material.learning_objectives,
            "description": material.description,
            "is_downloadable": bool(material.is_downloadable),
            "is_enabled": bool(material.is_enabled),
            "view_count": int(material.view_count),
            "download_count": int(material.download_count),
            "created_at": material.created_at.isoformat() if material.created_at else None,
            "updated_at": material.updated_at.isoformat() if material.updated_at else None,
        }

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

        cur = _decode_cursor(cursor or "")

        last_id = cur.get("last_id")
        try:
            last_id = int(last_id) if last_id is not None else None
        except Exception:
            last_id = None

        last_priority = cur.get("last_priority")
        try:
            last_priority = int(last_priority) if last_priority is not None else None
        except Exception:
            last_priority = None

        last_semester_number = cur.get("last_semester_number")
        try:
            last_semester_number = int(last_semester_number) if last_semester_number is not None else None
        except Exception:
            last_semester_number = None

        user_id = getattr(getattr(g, "auth", None), "user_id", None)

        params = {
            "mode": "cursor",
            "limit": limit,
            "last_id": last_id,
            "last_priority": last_priority,
            "last_semester_number": last_semester_number,
            "filters": filters,
            "is_enabled": is_enabled,
            "external_base": external_base,
            "user_id": int(user_id) if user_id is not None else None,
        }

        def builder():
            rows, total_count, has_more, next_cursor_payload = self.repo.list_materials_cursor(
                company_id=company_id,
                limit=limit,
                last_id=last_id,
                last_priority=last_priority,
                last_semester_number=last_semester_number,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_material_list_row(r, external_base=external_base) for r in rows]

            next_cursor = _encode_cursor(next_cursor_payload) if next_cursor_payload else None

            return {
                "data": data,
                "pagination": {
                    "limit": limit,
                    "next_cursor": next_cursor,
                    "has_more": bool(has_more),
                },
                "meta": {"total_count": int(total_count)},
            }

        out = cached_list(
            entity="materials:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

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
        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20
        page = max(int(page or 1), 1)

        user_id = getattr(getattr(g, "auth", None), "user_id", None)

        params = {
            "mode": "page",
            "page": page,
            "per_page": per_page,
            "filters": filters,
            "is_enabled": is_enabled,
            "external_base": external_base,
            "user_id": int(user_id) if user_id is not None else None,
        }

        def builder():
            rows, total_count, pages = self.repo.list_materials_page(
                company_id=company_id,
                page=page,
                per_page=per_page,
                filters=filters,
                is_enabled=is_enabled,
            )

            data = [self.repo.shape_material_list_row(r, external_base=external_base) for r in rows]

            return {
                "data": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "pages": int(pages),
                    "total_count": int(total_count),
                },
            }

        out = cached_list(
            entity="materials:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

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

        def builder():
            row = self.repo.get_material_detail(company_id=company_id, material_id=material_id)
            if not row:
                return None
            return self.repo.shape_material_detail_row(
                row,
                external_base=external_base,
                company_id=company_id,
            )

        data = cached_detail(
            entity="materials:detail",
            company_id=company_id,
            record_id=material_id,
            ttl=30,
            builder=builder,
        )

        if data is None:
            return False, "Material not found.", {}

        return True, "OK", {"data": data}

    # =========================================================
    # FILTER OPTIONS
    # =========================================================
    def get_material_filter_options(
            self,
            *,
            company_id: int,
            filters: Dict[str, Any],
    ) -> Tuple[bool, str, Dict[str, Any]]:
        user_id = getattr(getattr(g, "auth", None), "user_id", None)

        params = {
            "mode": "filter-options",
            "filters": filters,
            "user_id": int(user_id) if user_id is not None else None,
        }

        def builder():
            return self.repo.get_material_filter_options(
                company_id=company_id,
                filters=filters,
            )

        out = cached_list(
            entity="materials:filter-options",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder,
        )

        return True, "OK", out

    # =========================================================
    # TRACK VIEW / DOWNLOAD
    # =========================================================
    def track_view(
            self,
            *,
            company_id: int,
            material_id: int,
            cooldown_seconds: int = 3600,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        user_id = self.repo._current_user_id()
        if not user_id:
            return False, "Authentication required.", {}

        try:
            with self.s.begin_nested():
                result = self.repo.increment_view(
                    company_id=company_id,
                    material_id=material_id,
                    user_id=int(user_id),
                    cooldown_seconds=int(cooldown_seconds),
                )

            message = "View tracked successfully." if result["counted"] else (
                        result.get("reason") or "View not counted.")
            return True, message, {
                "tracking": {
                    "material_id": int(result["material_id"]),
                    "user_id": int(user_id),
                    "event": "view",
                    "counted": bool(result["counted"]),
                    "reason": result.get("reason"),
                    "global_view_count": int(result["global_view_count"]),
                    "global_download_count": int(result["global_download_count"]),
                    "user_view_count": int(result["user_view_count"]),
                    "user_download_count": int(result["user_download_count"]),
                    "last_viewed_at": result.get("last_viewed_at"),
                    "last_downloaded_at": result.get("last_downloaded_at"),
                }
            }
        except Exception as e:
            return False, f"Failed to track view: {e}", {}

    def track_download(
            self,
            *,
            company_id: int,
            material_id: int,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        user_id = self.repo._current_user_id()
        if not user_id:
            return False, "Authentication required.", {}

        try:
            with self.s.begin_nested():
                result = self.repo.increment_download(
                    company_id=company_id,
                    material_id=material_id,
                    user_id=int(user_id),
                )

            if not result["counted"]:
                return False, result.get("reason") or "Download not counted.", {}

            return True, "Download tracked successfully.", {
                "tracking": {
                    "material_id": int(result["material_id"]),
                    "user_id": int(user_id),
                    "event": "download",
                    "counted": bool(result["counted"]),
                    "reason": result.get("reason"),
                    "global_view_count": int(result["global_view_count"]),
                    "global_download_count": int(result["global_download_count"]),
                    "user_view_count": int(result["user_view_count"]),
                    "user_download_count": int(result["user_download_count"]),
                    "last_viewed_at": result.get("last_viewed_at"),
                    "last_downloaded_at": result.get("last_downloaded_at"),
                }
            }
        except Exception as e:
            return False, f"Failed to track download: {e}", {}

    def set_favorite(
            self,
            *,
            company_id: int,
            material_id: int,
            is_favorite: bool,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        user_id = self.repo._current_user_id()
        if not user_id:
            return False, "Authentication required.", {}

        try:
            with self.s.begin_nested():
                result = self.repo.set_favorite(
                    company_id=company_id,
                    material_id=material_id,
                    user_id=int(user_id),
                    is_favorite=bool(is_favorite),
                )

            if not result["counted"]:
                return False, result.get("reason") or "Favorite not updated.", {}

            return True, "Favorite updated successfully.", {
                "favorite": {
                    "material_id": int(result["material_id"]),
                    "user_id": int(user_id),
                    "is_favorite": bool(result["is_favorite"]),
                    "user_view_count": int(result["user_view_count"]),
                    "user_download_count": int(result["user_download_count"]),
                    "last_viewed_at": result.get("last_viewed_at"),
                    "last_downloaded_at": result.get("last_downloaded_at"),
                }
            }
        except Exception as e:
            return False, f"Failed to update favorite: {e}", {}

    def list_my_favorites_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            external_base: str,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        user_id = self.repo._current_user_id()
        if not user_id:
            return False, "Authentication required.", {}

        try:
            rows, total, pages = self.repo.list_favorite_materials_page(
                company_id=company_id,
                user_id=int(user_id),
                page=page,
                per_page=per_page,
                external_base=external_base,
            )
            return True, "OK", {
                "data": rows,
                "pagination": {
                    "page": int(page),
                    "per_page": int(per_page),
                    "pages": int(pages),
                    "total_count": int(total),
                },
            }
        except Exception as e:
            return False, f"Failed to load favorites: {e}", {}