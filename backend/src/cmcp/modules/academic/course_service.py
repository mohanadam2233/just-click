from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Set, Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from cmcp.core.base_service import BaseService, TxMode
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.modules.academic.models import Course, CourseOffering, CourseChapter
from cmcp.modules.academic.course_repository import CourseRepository

log = logging.getLogger(__name__)

MAX_OFFERINGS_PER_REQUEST = 20
MAX_CHAPTERS_PER_OFFERING = 50
MAX_BULK_DELETE = 100
MAX_CREDIT_HOURS = 30

ERR_COURSE_NOT_FOUND = "Course not found."
ERR_DEPARTMENT_NOT_FOUND = "Department not found."
ERR_SEMESTER_NOT_FOUND = "Semester not found."
ERR_COURSE_OFFERING_NOT_FOUND = "Course offering not found."
ERR_CHAPTER_NOT_FOUND = "Chapter not found."

ERR_COURSE_EXISTS_TITLE = "Course already exists with this title."
ERR_COURSE_CODE_EXISTS = "Course code already exists."
ERR_COURSE_OFFERING_EXISTS_IN_SCOPE = "Course offering already exists with this course, department, and semester."
ERR_COURSE_OFFERING_EXISTS_TITLE = "Course offering already exists with this custom title for this course."
ERR_CHAPTER_EXISTS_NUMBER = "Chapter already exists with this number in this offering."
ERR_CHAPTER_EXISTS_TITLE = "Chapter already exists with this title in this offering."

ERR_TOO_MANY_OFFERINGS = f"Cannot process more than {MAX_OFFERINGS_PER_REQUEST} offerings in one request."
ERR_TOO_MANY_CHAPTERS = f"Cannot process more than {MAX_CHAPTERS_PER_OFFERING} chapters for one offering."

COURSE_FIELDS = {"title", "code", "description", "is_enabled"}
OFFERING_FIELDS = {"id", "course_id", "department_id", "semester_id", "custom_title", "credit_hours", "is_enabled"}
CHAPTER_FIELDS = {"id", "number", "title", "description", "is_enabled"}

MissingAction = str


def _require_text(value: Any, *, field_label: str) -> str:
    from cmcp.common.validation.text import validate_readable_name

    return validate_readable_name(value, field_label=field_label)


def _normalize_code(value: Any) -> Optional[str]:
    value = (str(value) if value is not None else "").strip()
    return value or None


def _safe_text(value: Any) -> Optional[str]:
    value = (str(value) if value is not None else "").strip()
    return value or None


def _as_bool(value: Any, default: bool = True) -> bool:
    if value is None:
        return bool(default)
    return bool(value)


class CourseService(BaseService[Course]):
    """
    Frappe-inspired safe full-state sync.

    Rules:
    - Row with id -> update existing row.
    - Row without id -> create new row.
    - Existing child row missing from submitted list -> disable by default.
    - Hard delete requires explicit permanent=true and safety checks.

    This is intentionally safer than raw child-row deletion because
    academic records may be linked to materials, progress, analytics,
    or audit history.
    """

    repo: CourseRepository

    def __init__(self, session: Optional[Session] = None, *, tx_mode: TxMode = "service"):
        super().__init__(
            Course,
            session=session,
            repo_cls=CourseRepository,
            public_fields=["id", "title", "code"],
            tx_mode=tx_mode,
        )
        self.repo: CourseRepository

    # =========================================================
    # Course create/update
    # =========================================================
    def create_course(self, *, company_id: int, data: Dict[str, Any]):
        try:
            payload = dict(data or {})
            offerings_payload = payload.pop("offerings", None) or []

            course_data = self._clean_course_data(payload, partial=False)
            self._validate_course(course_data, company_id=company_id, existing_id=None)

            with self.s.begin_nested():
                course = self.repo.create_course({
                    "company_id": int(company_id),
                    **course_data,
                })

                if offerings_payload:
                    self._save_new_offerings_for_course(
                        company_id=company_id,
                        course_id=int(course.id),
                        offerings=offerings_payload,
                    )

            self._commit_or_flush()
            return True, "Course created successfully", {
                "record": {"course": self._course_record(course)}
            }

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. Please check unique fields.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("create_course failed: %s", e)
            raise

    def update_course(self, *, company_id: int, course_id: int, data: Dict[str, Any]):
        try:
            payload = dict(data or {})
            offerings_present = "offerings" in payload
            offerings_payload = payload.pop("offerings", None)

            # Internal-only flags. Normal API schemas do not expose these.
            offering_missing_action = payload.pop("offering_missing_row_action", "disable")
            permanent = bool(payload.pop("permanent", False))

            course = self.repo.get_course_with_children(
                company_id=company_id,
                course_id=course_id,
            )
            if not course:
                raise NotFoundError(ERR_COURSE_NOT_FOUND)

            with self.s.begin_nested():
                course_patch = self._clean_course_data(payload, partial=True)
                if course_patch:
                    self._validate_course(
                        course_patch,
                        company_id=company_id,
                        existing_id=int(course.id),
                    )
                    self._apply_patch(course, course_patch)
                    self.s.flush([course])

                if offerings_present:
                    self._sync_offerings_for_course(
                        company_id=company_id,
                        course=course,
                        offerings=offerings_payload or [],
                        missing_action=offering_missing_action,
                        permanent=permanent,
                    )

            self._commit_or_flush()
            return True, "Course updated successfully", {
                "record": {"course": self._course_record(course)}
            }

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. Please check unique fields.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("update_course failed: %s", e)
            raise

    # =========================================================
    # Offering create/update
    # =========================================================
    def create_offering(self, *, company_id: int, data: Dict[str, Any]):
        """
        Create one or many offerings for an existing course.

        Single mode:
        {
          "course_id": 1,
          "department_id": 2,
          "semester_id": 3,
          "chapters": [...]
        }

        Bulk mode:
        {
          "course_id": 1,
          "offerings": [...]
        }
        """
        try:
            payload = dict(data or {})
            course_id = int(payload.get("course_id") or 0)
            if not course_id:
                raise BusinessValidationError("course_id is required.")

            self._get_course_or_fail(company_id=company_id, course_id=course_id)

            offerings_payload = payload.pop("offerings", None)

            with self.s.begin_nested():
                if offerings_payload is not None:
                    if not isinstance(offerings_payload, list):
                        raise BusinessValidationError("offerings must be a list.")

                    saved = self._save_new_offerings_for_course(
                        company_id=company_id,
                        course_id=course_id,
                        offerings=offerings_payload,
                    )
                else:
                    chapters_payload = payload.pop("chapters", None) or []

                    clean = self._clean_offering_data(payload, partial=False)
                    clean["course_id"] = course_id

                    self._validate_offering(
                        clean,
                        company_id=company_id,
                        course_id=course_id,
                        existing=None,
                    )

                    offering = self.repo.create_offering({
                        "company_id": int(company_id),
                        **clean,
                    })

                    if chapters_payload:
                        self._save_new_chapters_for_offering(
                            company_id=company_id,
                            offering_id=int(offering.id),
                            chapters=chapters_payload,
                        )

                    saved = [offering]

            self._commit_or_flush()
            return True, "Course offering created successfully", {
                "records": [self._offering_record(o) for o in saved]
            }

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. Please check unique fields.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("create_offering failed: %s", e)
            raise

    def update_offering(self, *, company_id: int, offering_id: int, data: Dict[str, Any]):
        try:
            payload = dict(data or {})
            chapters_present = "chapters" in payload
            chapters_payload = payload.pop("chapters", None)

            # Internal-only flags. Normal API schemas do not expose these.
            chapter_missing_action = payload.pop("chapter_missing_row_action", "disable")
            permanent = bool(payload.pop("permanent", False))

            offering = self.repo.get_offering_with_children(
                company_id=company_id,
                offering_id=offering_id,
            )
            if not offering:
                raise NotFoundError(ERR_COURSE_OFFERING_NOT_FOUND)

            with self.s.begin_nested():
                offering_patch = self._clean_offering_data(payload, partial=True)
                if offering_patch:
                    next_course_id = int(offering_patch.get("course_id") or offering.course_id)

                    self._validate_offering(
                        offering_patch,
                        company_id=company_id,
                        course_id=next_course_id,
                        existing=offering,
                    )

                    self._apply_patch(offering, offering_patch)
                    self.s.flush([offering])

                if chapters_present:
                    self._sync_chapters_for_offering(
                        company_id=company_id,
                        offering=offering,
                        chapters=chapters_payload or [],
                        missing_action=chapter_missing_action,
                        permanent=permanent,
                    )

            self._commit_or_flush()
            return True, "Course offering updated successfully", {
                "record": {"offering": self._offering_record(offering)}
            }

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. Please check unique fields.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("update_offering failed: %s", e)
            raise

    # =========================================================
    # Delete methods
    # =========================================================
    def delete_course(self, *, company_id: int, course_id: int, permanent: bool = False):
        try:
            course = self.repo.get_course_with_children(
                company_id=company_id,
                course_id=course_id,
            )
            if not course:
                raise NotFoundError(ERR_COURSE_NOT_FOUND)

            with self.s.begin_nested():
                if permanent:
                    if course.offerings:
                        raise BusinessValidationError(
                            "Cannot permanently delete course because it has offering(s). "
                            "Delete or disable the offerings first."
                        )
                    self.s.delete(course)
                else:
                    self._soft_delete_course_tree(course)

            self._commit_or_flush()
            return True, "Course deleted successfully", {
                "record": {"id": int(course_id), "permanent": bool(permanent)}
            }

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. This course may be linked to other records.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("delete_course failed: %s", e)
            raise

    def bulk_delete_courses(self, *, company_id: int, ids: List[int], permanent: bool = False):
        try:
            ids = self._clean_bulk_ids(ids)
            courses = self.repo.get_courses_with_children_by_ids(
                company_id=company_id,
                ids=ids,
            )
            found_map = {int(c.id): c for c in courses}

            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            with self.s.begin_nested():
                for course_id in ids:
                    course = found_map.get(int(course_id))
                    if not course:
                        failed.append({"id": int(course_id), "message": ERR_COURSE_NOT_FOUND})
                        continue

                    if permanent:
                        if course.offerings:
                            failed.append({
                                "id": int(course_id),
                                "message": "Cannot permanently delete course because it has offering(s).",
                            })
                            continue
                        self.s.delete(course)
                    else:
                        self._soft_delete_course_tree(course)

                    deleted.append(int(course_id))

            self._commit_or_flush()
            return True, "Bulk delete completed", {
                "deleted": deleted,
                "failed": failed,
                "permanent": bool(permanent),
            }

        except BusinessValidationError as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. Some courses may be linked to other records.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("bulk_delete_courses failed: %s", e)
            raise

    def delete_offering(self, *, company_id: int, offering_id: int, permanent: bool = False):
        try:
            offering = self.repo.get_offering_with_children(
                company_id=company_id,
                offering_id=offering_id,
            )
            if not offering:
                raise NotFoundError(ERR_COURSE_OFFERING_NOT_FOUND)

            with self.s.begin_nested():
                if permanent:
                    self._remove_offering(
                        company_id=company_id,
                        offering=offering,
                        action="delete",
                        permanent=True,
                    )
                else:
                    self._soft_delete_offering_tree(offering)

            self._commit_or_flush()
            return True, "Course offering deleted successfully", {
                "record": {"id": int(offering_id), "permanent": bool(permanent)}
            }

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. This offering may be linked to other records.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("delete_offering failed: %s", e)
            raise

    def bulk_delete_offerings(self, *, company_id: int, ids: List[int], permanent: bool = False):
        try:
            ids = self._clean_bulk_ids(ids)
            offerings = self.repo.get_offerings_with_children_by_ids(
                company_id=company_id,
                ids=ids,
            )
            found_map = {int(o.id): o for o in offerings}

            material_counts = {}
            if permanent:
                material_counts = self.repo.count_materials_for_offerings(
                    company_id=company_id,
                    offering_ids=ids,
                )

            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            with self.s.begin_nested():
                for offering_id in ids:
                    offering = found_map.get(int(offering_id))
                    if not offering:
                        failed.append({"id": int(offering_id), "message": ERR_COURSE_OFFERING_NOT_FOUND})
                        continue

                    if permanent:
                        count = int(material_counts.get(int(offering_id), 0))
                        if count > 0:
                            failed.append({
                                "id": int(offering_id),
                                "message": f"Cannot permanently delete offering because it has {count} linked material(s).",
                            })
                            continue
                        self.s.delete(offering)
                    else:
                        self._soft_delete_offering_tree(offering)

                    deleted.append(int(offering_id))

            self._commit_or_flush()
            return True, "Bulk delete completed", {
                "deleted": deleted,
                "failed": failed,
                "permanent": bool(permanent),
            }

        except BusinessValidationError as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. Some offerings may be linked to other records.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("bulk_delete_offerings failed: %s", e)
            raise

    def delete_chapter(self, *, company_id: int, chapter_id: int, permanent: bool = False):
        try:
            chapter = self.repo.get_chapter(
                chapter_id=int(chapter_id),
                company_id=int(company_id),
            )
            if not chapter:
                raise NotFoundError(ERR_CHAPTER_NOT_FOUND)

            with self.s.begin_nested():
                if permanent:
                    self._remove_chapter(
                        company_id=company_id,
                        chapter=chapter,
                        action="delete",
                        permanent=True,
                    )
                else:
                    chapter.is_enabled = False

            self._commit_or_flush()
            return True, "Chapter deleted successfully", {
                "record": {"id": int(chapter_id), "permanent": bool(permanent)}
            }

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. This chapter may be linked to other records.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("delete_chapter failed: %s", e)
            raise

    def bulk_delete_chapters(self, *, company_id: int, ids: List[int], permanent: bool = False):
        try:
            ids = self._clean_bulk_ids(ids)
            chapters = self.repo.get_chapters_by_ids(
                company_id=company_id,
                ids=ids,
            )
            found_map = {int(ch.id): ch for ch in chapters}

            material_counts = {}
            if permanent:
                material_counts = self.repo.count_materials_for_chapters(
                    company_id=company_id,
                    chapter_ids=ids,
                )

            deleted: List[int] = []
            failed: List[Dict[str, Any]] = []

            with self.s.begin_nested():
                for chapter_id in ids:
                    chapter = found_map.get(int(chapter_id))
                    if not chapter:
                        failed.append({"id": int(chapter_id), "message": ERR_CHAPTER_NOT_FOUND})
                        continue

                    if permanent:
                        count = int(material_counts.get(int(chapter_id), 0))
                        if count > 0:
                            failed.append({
                                "id": int(chapter_id),
                                "message": f"Cannot permanently delete chapter because it has {count} linked material(s).",
                            })
                            continue
                        self.s.delete(chapter)
                    else:
                        chapter.is_enabled = False

                    deleted.append(int(chapter_id))

            self._commit_or_flush()
            return True, "Bulk delete completed", {
                "deleted": deleted,
                "failed": failed,
                "permanent": bool(permanent),
            }

        except BusinessValidationError as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error. Some chapters may be linked to other records.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("bulk_delete_chapters failed: %s", e)
            raise

    # =========================================================
    # Fetch helpers
    # =========================================================
    def _get_course_or_fail(self, *, company_id: int, course_id: int) -> Course:
        if not course_id:
            raise BusinessValidationError("course_id is required.")

        course = self.repo.get_course(int(course_id), company_id=int(company_id))
        if not course:
            raise NotFoundError(ERR_COURSE_NOT_FOUND)

        return course

    def _get_offering_or_fail(self, *, company_id: int, offering_id: int) -> CourseOffering:
        if not offering_id:
            raise BusinessValidationError("offering_id is required.")

        offering = self.repo.get_offering(int(offering_id), company_id=int(company_id))
        if not offering:
            raise NotFoundError(ERR_COURSE_OFFERING_NOT_FOUND)

        return offering

    # =========================================================
    # Cleaning helpers
    # =========================================================
    def _clean_course_data(self, raw: Dict[str, Any], *, partial: bool) -> Dict[str, Any]:
        data = {k: v for k, v in dict(raw or {}).items() if k in COURSE_FIELDS}
        out: Dict[str, Any] = {}

        if "title" in data:
            out["title"] = _require_text(data.get("title"), field_label="Course title")
        elif not partial:
            out["title"] = _require_text(None, field_label="Course title")

        if "code" in data or not partial:
            out["code"] = _normalize_code(data.get("code"))

        if "description" in data or not partial:
            out["description"] = _safe_text(data.get("description"))

        if "is_enabled" in data or not partial:
            out["is_enabled"] = _as_bool(data.get("is_enabled"), default=True)

        return out

    def _clean_offering_data(self, raw: Dict[str, Any], *, partial: bool) -> Dict[str, Any]:
        data = {k: v for k, v in dict(raw or {}).items() if k in OFFERING_FIELDS}
        out: Dict[str, Any] = {}

        if "id" in data and data.get("id") is not None:
            out["id"] = int(data["id"])

        if "course_id" in data and data.get("course_id") is not None:
            out["course_id"] = int(data["course_id"])

        if "department_id" in data and data.get("department_id") is not None:
            out["department_id"] = int(data["department_id"])
        elif not partial:
            raise BusinessValidationError("department_id is required.")

        if "semester_id" in data:
            out["semester_id"] = None if data.get("semester_id") is None else int(data["semester_id"])
        elif not partial:
            raise BusinessValidationError("semester_id is required.")

        if "custom_title" in data or not partial:
            out["custom_title"] = _safe_text(data.get("custom_title"))

        if "credit_hours" in data or not partial:
            credit_hours = data.get("credit_hours")
            if credit_hours is None or credit_hours == "":
                out["credit_hours"] = None
            else:
                credit_hours = int(credit_hours)
                if credit_hours < 0 or credit_hours > MAX_CREDIT_HOURS:
                    raise BusinessValidationError(f"Credit hours must be between 0 and {MAX_CREDIT_HOURS}.")
                out["credit_hours"] = credit_hours

        if "is_enabled" in data or not partial:
            out["is_enabled"] = _as_bool(data.get("is_enabled"), default=True)

        return out

    def _clean_chapter_data(self, raw: Dict[str, Any], *, partial: bool) -> Dict[str, Any]:
        data = {k: v for k, v in dict(raw or {}).items() if k in CHAPTER_FIELDS}
        out: Dict[str, Any] = {}

        if "id" in data and data.get("id") is not None:
            out["id"] = int(data["id"])

        if "number" in data and data.get("number") is not None:
            number = int(data["number"])
            if number < 1:
                raise BusinessValidationError("Chapter number must be at least 1.")
            out["number"] = number
        elif not partial:
            raise BusinessValidationError("Chapter number is required.")

        if "title" in data and data.get("title") is not None:
            out["title"] = _require_text(data.get("title"), field_label="Chapter title")
        elif not partial:
            out["title"] = _require_text(None, field_label="Chapter title")

        if "description" in data or not partial:
            out["description"] = _safe_text(data.get("description"))

        if "is_enabled" in data or not partial:
            out["is_enabled"] = _as_bool(data.get("is_enabled"), default=True)

        return out

    # =========================================================
    # Validation helpers
    # =========================================================
    def _validate_course(self, data: Dict[str, Any], *, company_id: int, existing_id: Optional[int]) -> None:
        if "title" in data and self.repo.course_title_exists(
            company_id=company_id,
            title=data["title"],
            exclude_id=existing_id,
        ):
            raise BusinessValidationError(ERR_COURSE_EXISTS_TITLE)

        if data.get("code") and self.repo.course_code_exists(
            company_id=company_id,
            code=data["code"],
            exclude_id=existing_id,
        ):
            raise BusinessValidationError(ERR_COURSE_CODE_EXISTS)

    def _validate_offering(
        self,
        data: Dict[str, Any],
        *,
        company_id: int,
        course_id: int,
        existing: Optional[CourseOffering] = None,
    ) -> None:
        final_course_id = int(data.get("course_id") or course_id)

        final_department_id = int(
            data.get("department_id")
            if "department_id" in data
            else getattr(existing, "department_id", 0) or 0
        )

        final_semester_id = (
            data.get("semester_id")
            if "semester_id" in data
            else getattr(existing, "semester_id", None)
        )

        final_custom_title = (
            data.get("custom_title")
            if "custom_title" in data
            else getattr(existing, "custom_title", None)
        )

        exclude_id = int(existing.id) if existing is not None else None

        self._get_course_or_fail(company_id=company_id, course_id=final_course_id)

        if not final_department_id:
            raise BusinessValidationError("department_id is required.")

        dept = self.repo.get_department(final_department_id, company_id=company_id)
        if not dept or not dept.is_enabled:
            raise BusinessValidationError(f"Department {final_department_id} not found or disabled.")

        if final_semester_id is not None:
            sem = self.repo.get_semester(int(final_semester_id), company_id=company_id)
            if not sem or not sem.is_enabled:
                raise BusinessValidationError(f"Semester {final_semester_id} not found or disabled.")

        if self.repo.offering_scope_exists(
            company_id=company_id,
            course_id=final_course_id,
            department_id=final_department_id,
            semester_id=final_semester_id,
            exclude_id=exclude_id,
        ):
            raise BusinessValidationError(ERR_COURSE_OFFERING_EXISTS_IN_SCOPE)

        if final_custom_title and self.repo.offering_custom_title_exists(
            company_id=company_id,
            course_id=final_course_id,
            custom_title=final_custom_title,
            exclude_id=exclude_id,
        ):
            raise BusinessValidationError(ERR_COURSE_OFFERING_EXISTS_TITLE)

    def _validate_chapter(
        self,
        data: Dict[str, Any],
        *,
        company_id: int,
        offering_id: int,
        existing: Optional[CourseChapter] = None,
    ) -> None:
        exclude_id = int(existing.id) if existing is not None else None
        number = data.get("number") if "number" in data else getattr(existing, "number", None)
        title = data.get("title") if "title" in data else getattr(existing, "title", None)

        if number is not None and self.repo.chapter_number_exists(
            company_id=company_id,
            offering_id=offering_id,
            number=int(number),
            exclude_id=exclude_id,
        ):
            raise BusinessValidationError(ERR_CHAPTER_EXISTS_NUMBER)

        if title and self.repo.chapter_title_exists(
            company_id=company_id,
            offering_id=offering_id,
            title=title,
            exclude_id=exclude_id,
        ):
            raise BusinessValidationError(ERR_CHAPTER_EXISTS_TITLE)

    # =========================================================
    # Request validation
    # =========================================================
    def _validate_request_limits(
        self,
        *,
        offerings: Optional[List[Dict]] = None,
        chapters: Optional[List[Dict]] = None,
    ) -> None:
        if offerings is not None and len(offerings) > MAX_OFFERINGS_PER_REQUEST:
            raise BusinessValidationError(ERR_TOO_MANY_OFFERINGS)

        if chapters is not None and len(chapters) > MAX_CHAPTERS_PER_OFFERING:
            raise BusinessValidationError(ERR_TOO_MANY_CHAPTERS)

    def _validate_no_duplicate_offerings_in_payload(
        self,
        offerings: List[Dict[str, Any]],
        *,
        course_id: int,
    ) -> None:
        seen_ids: Set[int] = set()
        seen_scopes: Set[Tuple[int, int, Optional[int]]] = set()
        seen_titles: Set[str] = set()

        for raw in offerings or []:
            row = dict(raw or {})

            if row.get("id") is not None:
                row_id = int(row["id"])
                if row_id in seen_ids:
                    raise BusinessValidationError(f"Duplicate offering id {row_id} in request.")
                seen_ids.add(row_id)

            row_course_id = int(row.get("course_id") or course_id)
            dept_id = int(row.get("department_id") or 0)
            sem_raw = row.get("semester_id")
            sem_id = None if sem_raw is None else int(sem_raw)

            if dept_id:
                scope = (row_course_id, dept_id, sem_id)
                if scope in seen_scopes:
                    raise BusinessValidationError(ERR_COURSE_OFFERING_EXISTS_IN_SCOPE)
                seen_scopes.add(scope)

            custom_title = (row.get("custom_title") or "").strip().lower()
            if custom_title:
                if custom_title in seen_titles:
                    raise BusinessValidationError(ERR_COURSE_OFFERING_EXISTS_TITLE)
                seen_titles.add(custom_title)

    def _validate_no_duplicate_chapters_in_payload(self, chapters: List[Dict[str, Any]]) -> None:
        seen_ids: Set[int] = set()
        seen_numbers: Set[int] = set()
        seen_titles: Set[str] = set()

        for raw in chapters or []:
            row = dict(raw or {})

            if row.get("id") is not None:
                row_id = int(row["id"])
                if row_id in seen_ids:
                    raise BusinessValidationError(f"Duplicate chapter id {row_id} in request.")
                seen_ids.add(row_id)

            if row.get("number") is not None:
                number = int(row["number"])
                if number in seen_numbers:
                    raise BusinessValidationError(ERR_CHAPTER_EXISTS_NUMBER)
                seen_numbers.add(number)

            title = (row.get("title") or "").strip().lower()
            if title:
                if title in seen_titles:
                    raise BusinessValidationError(ERR_CHAPTER_EXISTS_TITLE)
                seen_titles.add(title)

    @staticmethod
    def _clean_bulk_ids(ids: List[int]) -> List[int]:
        if not ids:
            raise BusinessValidationError("ids is required.")

        clean = [int(x) for x in ids]

        if len(clean) > MAX_BULK_DELETE:
            raise BusinessValidationError(f"Cannot delete more than {MAX_BULK_DELETE} records.")

        if len(set(clean)) != len(clean):
            raise BusinessValidationError("Duplicate ids are not allowed.")

        return clean

    # =========================================================
    # Create helpers
    # =========================================================
    def _save_new_offerings_for_course(
        self,
        *,
        company_id: int,
        course_id: int,
        offerings: List[Dict[str, Any]],
    ) -> List[CourseOffering]:
        if not isinstance(offerings, list):
            raise BusinessValidationError("offerings must be a list.")

        self._validate_request_limits(offerings=offerings)
        self._validate_no_duplicate_offerings_in_payload(offerings, course_id=course_id)

        saved: List[CourseOffering] = []

        for raw in offerings:
            row = dict(raw or {})
            chapters_payload = row.pop("chapters", None) or []

            if row.get("id"):
                raise BusinessValidationError("New offering rows must not include id.")

            clean = self._clean_offering_data(row, partial=False)
            clean["course_id"] = int(course_id)

            self._validate_offering(
                clean,
                company_id=company_id,
                course_id=int(course_id),
                existing=None,
            )

            offering = self.repo.create_offering({
                "company_id": int(company_id),
                **clean,
            })

            if chapters_payload:
                self._save_new_chapters_for_offering(
                    company_id=company_id,
                    offering_id=int(offering.id),
                    chapters=chapters_payload,
                )

            saved.append(offering)

        return saved

    def _save_new_chapters_for_offering(
        self,
        *,
        company_id: int,
        offering_id: int,
        chapters: List[Dict[str, Any]],
    ) -> List[CourseChapter]:
        if not isinstance(chapters, list):
            raise BusinessValidationError("chapters must be a list.")

        self._validate_request_limits(chapters=chapters)
        self._validate_no_duplicate_chapters_in_payload(chapters)

        saved: List[CourseChapter] = []

        for raw in chapters:
            row = dict(raw or {})

            if row.get("id"):
                raise BusinessValidationError("New chapter rows must not include id.")

            clean = self._clean_chapter_data(row, partial=False)

            self._validate_chapter(
                clean,
                company_id=company_id,
                offering_id=offering_id,
                existing=None,
            )

            chapter = self.repo.create_chapter({
                "company_id": int(company_id),
                "course_offering_id": int(offering_id),
                **clean,
            })

            saved.append(chapter)

        return saved

    # =========================================================
    # Full-state sync helpers
    # =========================================================
    def _sync_offerings_for_course(
        self,
        *,
        company_id: int,
        course: Course,
        offerings: List[Dict[str, Any]],
        missing_action: MissingAction,
        permanent: bool,
    ) -> List[CourseOffering]:
        if not isinstance(offerings, list):
            raise BusinessValidationError("offerings must be a list.")

        action = self._normalize_missing_action(
            missing_action,
            field="offering_missing_row_action",
        )

        self._validate_request_limits(offerings=offerings)
        self._validate_no_duplicate_offerings_in_payload(offerings, course_id=int(course.id))

        existing_map: Dict[int, CourseOffering] = {
            int(o.id): o for o in (course.offerings or [])
        }

        incoming_ids: Set[int] = set()
        saved: List[CourseOffering] = []

        for raw in offerings:
            row = dict(raw or {})
            chapters_present = "chapters" in row
            chapters_payload = row.pop("chapters", None)

            # Internal-only. Normal API does not expose this.
            chapter_missing_action = row.pop("chapter_missing_row_action", "disable")

            clean = self._clean_offering_data(row, partial=bool(row.get("id")))
            explicitly_sent_enabled = "is_enabled" in clean
            offering_id = clean.pop("id", None)

            if offering_id:
                if int(offering_id) not in existing_map:
                    raise BusinessValidationError(
                        f"Offering {offering_id} does not belong to course {int(course.id)}."
                    )

                offering = existing_map[int(offering_id)]
                incoming_ids.add(int(offering.id))

                if "course_id" in clean and int(clean["course_id"]) != int(course.id):
                    raise BusinessValidationError("Offering course_id cannot be changed from update_course().")

                self._validate_offering(
                    clean,
                    company_id=company_id,
                    course_id=int(course.id),
                    existing=offering,
                )

                self._apply_patch(offering, clean)

                # Full-state sync rule:
                # present row means active unless frontend explicitly sends is_enabled=false.
                if not explicitly_sent_enabled:
                    offering.is_enabled = True

                self.s.flush([offering])
            else:
                clean["course_id"] = int(course.id)

                self._validate_offering(
                    clean,
                    company_id=company_id,
                    course_id=int(course.id),
                    existing=None,
                )

                offering = self.repo.create_offering({
                    "company_id": int(company_id),
                    **clean,
                })

                incoming_ids.add(int(offering.id))

            if chapters_present:
                self._sync_chapters_for_offering(
                    company_id=company_id,
                    offering=offering,
                    chapters=chapters_payload or [],
                    missing_action=chapter_missing_action,
                    permanent=permanent,
                )

            saved.append(offering)

        if action != "keep":
            missing_ids = set(existing_map.keys()) - incoming_ids
            for offering_id in missing_ids:
                self._remove_offering(
                    company_id=company_id,
                    offering=existing_map[offering_id],
                    action=action,
                    permanent=permanent,
                )

        return saved

    def _sync_chapters_for_offering(
        self,
        *,
        company_id: int,
        offering: CourseOffering,
        chapters: List[Dict[str, Any]],
        missing_action: MissingAction,
        permanent: bool,
    ) -> List[CourseChapter]:
        if not isinstance(chapters, list):
            raise BusinessValidationError("chapters must be a list.")

        action = self._normalize_missing_action(
            missing_action,
            field="chapter_missing_row_action",
        )

        self._validate_request_limits(chapters=chapters)
        self._validate_no_duplicate_chapters_in_payload(chapters)

        existing_map: Dict[int, CourseChapter] = {
            int(ch.id): ch for ch in (offering.chapters or [])
        }

        incoming_ids: Set[int] = set()
        saved: List[CourseChapter] = []

        for raw in chapters:
            row = dict(raw or {})
            clean = self._clean_chapter_data(row, partial=bool(row.get("id")))
            explicitly_sent_enabled = "is_enabled" in clean
            chapter_id = clean.pop("id", None)

            if chapter_id:
                if int(chapter_id) not in existing_map:
                    raise BusinessValidationError(
                        f"Chapter {chapter_id} does not belong to offering {int(offering.id)}."
                    )

                chapter = existing_map[int(chapter_id)]
                incoming_ids.add(int(chapter.id))

                self._validate_chapter(
                    clean,
                    company_id=company_id,
                    offering_id=int(offering.id),
                    existing=chapter,
                )

                self._apply_patch(chapter, clean)

                # Full-state sync rule:
                # present row means active unless explicitly sent is_enabled=false.
                if not explicitly_sent_enabled:
                    chapter.is_enabled = True

                self.s.flush([chapter])
            else:
                self._validate_chapter(
                    clean,
                    company_id=company_id,
                    offering_id=int(offering.id),
                    existing=None,
                )

                chapter = self.repo.create_chapter({
                    "company_id": int(company_id),
                    "course_offering_id": int(offering.id),
                    **clean,
                })

                incoming_ids.add(int(chapter.id))

            saved.append(chapter)

        if action != "keep":
            missing_ids = set(existing_map.keys()) - incoming_ids
            for chapter_id in missing_ids:
                self._remove_chapter(
                    company_id=company_id,
                    chapter=existing_map[chapter_id],
                    action=action,
                    permanent=permanent,
                )

        return saved

    # =========================================================
    # Removal helpers
    # =========================================================
    def _remove_offering(
        self,
        *,
        company_id: int,
        offering: CourseOffering,
        action: MissingAction,
        permanent: bool,
    ) -> None:
        if action == "disable":
            self._soft_delete_offering_tree(offering)
            return

        if action == "delete":
            if not permanent:
                raise BusinessValidationError("Hard delete requires permanent=true.")

            material_count = self.repo.count_materials_for_offering(
                company_id=company_id,
                offering_id=int(offering.id),
            )

            if material_count > 0:
                raise BusinessValidationError(
                    f"Cannot delete offering {int(offering.id)} because it has "
                    f"{material_count} linked material(s)."
                )

            self.s.delete(offering)
            return

        if action != "keep":
            raise BusinessValidationError("Invalid offering_missing_row_action.")

    def _remove_chapter(
        self,
        *,
        company_id: int,
        chapter: CourseChapter,
        action: MissingAction,
        permanent: bool,
    ) -> None:
        if action == "disable":
            chapter.is_enabled = False
            return

        if action == "delete":
            if not permanent:
                raise BusinessValidationError("Hard delete requires permanent=true.")

            material_count = self.repo.count_materials_for_chapter(
                company_id=company_id,
                chapter_id=int(chapter.id),
            )

            if material_count > 0:
                raise BusinessValidationError(
                    f"Cannot delete chapter {int(chapter.id)} because it has "
                    f"{material_count} linked material(s)."
                )

            self.s.delete(chapter)
            return

        if action != "keep":
            raise BusinessValidationError("Invalid chapter_missing_row_action.")

    @staticmethod
    def _soft_delete_course_tree(course: Course) -> None:
        course.is_enabled = False

        for offering in course.offerings or []:
            offering.is_enabled = False

            for chapter in offering.chapters or []:
                chapter.is_enabled = False

    @staticmethod
    def _soft_delete_offering_tree(offering: CourseOffering) -> None:
        offering.is_enabled = False

        for chapter in offering.chapters or []:
            chapter.is_enabled = False

    @staticmethod
    def _normalize_missing_action(value: Any, *, field: str) -> str:
        action = (str(value or "disable")).strip().lower()
        if action not in {"disable", "delete", "keep"}:
            raise BusinessValidationError(f"{field} must be 'disable', 'delete', or 'keep'.")
        return action

    # =========================================================
    # Record formatters
    # =========================================================
    def _course_record(self, course: Course) -> Dict[str, Any]:
        return {
            "id": int(course.id),
            "title": course.title,
            "code": course.code,
            "description": course.description,
            "is_enabled": bool(course.is_enabled),
        }

    def _offering_record(self, offering: CourseOffering) -> Dict[str, Any]:
        return {
            "id": int(offering.id),
            "course_id": int(offering.course_id),
            "department_id": int(offering.department_id),
            "semester_id": int(offering.semester_id) if offering.semester_id is not None else None,
            "title": offering.custom_title,
            "custom_title": offering.custom_title,
            "credit_hours": offering.credit_hours,
            "is_enabled": bool(offering.is_enabled),
        }

    @staticmethod
    def _chapter_record(chapter: CourseChapter) -> Dict[str, Any]:
        return {
            "id": int(chapter.id),
            "course_offering_id": int(chapter.course_offering_id),
            "number": int(chapter.number),
            "title": chapter.title,
            "description": chapter.description,
            "is_enabled": bool(chapter.is_enabled),
        }

    @staticmethod
    def _apply_patch(obj: Any, patch: Dict[str, Any]) -> None:
        for key, value in (patch or {}).items():
            if key == "id":
                continue
            if hasattr(obj, key):
                setattr(obj, key, value)