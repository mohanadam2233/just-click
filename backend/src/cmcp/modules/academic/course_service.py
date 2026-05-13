from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Set, Tuple, cast

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from cmcp.core.base_service import BaseService, TxMode
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.modules.academic.models import Course, CourseOffering, CourseChapter
from cmcp.modules.academic.course_repository import CourseRepository

log = logging.getLogger(__name__)

ERR_COURSE_NOT_FOUND = "Course not found."
ERR_DEPARTMENT_NOT_FOUND = "Department not found."
ERR_SEMESTER_NOT_FOUND = "Semester not found."
ERR_COURSE_OFFERING_NOT_FOUND = "Course offering not found."

ERR_COURSE_EXISTS_TITLE = "Course already exists with this title."
ERR_COURSE_CODE_EXISTS = "Course code already exists."
ERR_COURSE_OFFERING_EXISTS_IN_SCOPE = "Course offering already exists with this course, department, and semester."
ERR_COURSE_OFFERING_EXISTS_TITLE = "Course offering already exists with this custom title for this course."
ERR_CHAPTER_EXISTS_NUMBER = "Chapter already exists with this number in this offering."
ERR_CHAPTER_EXISTS_TITLE = "Chapter already exists with this title in this offering."

MAX_OFFERINGS_PER_REQUEST = 20
MAX_CHAPTERS_PER_OFFERING = 50

COURSE_FIELDS = {"title", "code", "description", "is_enabled"}
OFFERING_FIELDS = {"id", "course_id", "department_id", "semester_id", "custom_title", "credit_hours", "is_enabled"}
CHAPTER_FIELDS = {"id", "number", "title", "description", "is_enabled"}


def _require_text(value: Any, *, field_label: str) -> str:
    value = (str(value) if value is not None else "").strip()
    if not value:
        raise BusinessValidationError(f"{field_label} is required.")
    return value


def _normalize_code(value: Any) -> Optional[str]:
    value = (str(value) if value is not None else "").strip()
    return value or None


def _safe_text(value: Any) -> Optional[str]:
    value = (str(value) if value is not None else "").strip()
    return value or None


def _as_bool(value: Any, default: bool = True) -> bool:
    if value is None:
        return default
    return bool(value)


class CourseService(BaseService[Course]):
    def __init__(self, session: Optional[Session] = None, *, tx_mode: TxMode = "service"):
        super().__init__(
            Course,
            session=session,
            repo_cls=CourseRepository,
            public_fields=["id", "title"],
            tx_mode=tx_mode,
        )
        self.course_repo = cast(CourseRepository, self.repo)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def create_course(self, *, company_id: int, data: Dict[str, Any]):
        """Create a course with optional offerings (each may contain chapters)."""
        try:
            payload = dict(data or {})
            offerings_payload = payload.pop("offerings", None) or []

            course_data = self._clean_course_data(payload, partial=False)
            self._validate_course(course_data, company_id=company_id, existing_id=None)

            course = self.course_repo.create_course({"company_id": int(company_id), **course_data})

            if offerings_payload:
                self._save_new_offerings_for_course(
                    company_id=company_id,
                    course_id=int(course.id),
                    offerings=offerings_payload,
                )

            self._commit_or_flush()
            return True, "Course created successfully", {"record": {"course": self._course_record(course)}}

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("create_course failed: %s", e)
            raise

    def create_offering(self, *, company_id: int, data: Dict[str, Any]):
        """Create one or more offerings for an existing course."""
        try:
            payload = dict(data or {})
            course_id = int(payload.get("course_id") or 0)
            course = self._get_course_or_fail(company_id=company_id, course_id=course_id)

            offerings_payload = payload.get("offerings")
            if offerings_payload is None:
                offerings_payload = [payload]

            if not isinstance(offerings_payload, list) or not offerings_payload:
                raise BusinessValidationError("At least one offering row is required.")

            created = self._save_new_offerings_for_course(
                company_id=company_id,
                course_id=int(course.id),
                offerings=offerings_payload,
            )

            self._commit_or_flush()
            if len(created) == 1:
                return True, "Course offering created successfully", {
                    "record": {"offering": self._offering_record(created[0])}
                }
            return True, "Course offerings created successfully", {
                "record": {"created_count": len(created)}
            }

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("create_offering failed: %s", e)
            raise

    def update_course(self, *, company_id: int, course_id: int, data: Dict[str, Any]):
        """
        Update course fields. If 'offerings' exists, it becomes the full active set.
        Missing offerings are soft‑disabled. Present offerings are enabled (unless explicitly disabled).
        """
        try:
            payload = dict(data or {})
            offerings_present = "offerings" in payload
            offerings_payload = payload.pop("offerings", None)

            # Ignore any old control fields (backward compatibility)
            payload.pop("offering_missing_row_action", None)
            payload.pop("chapter_missing_row_action", None)
            payload.pop("permanent", None)

            course = self.course_repo.get_course_with_children(company_id=company_id, course_id=course_id)
            if not course:
                raise NotFoundError(ERR_COURSE_NOT_FOUND)

            course_patch = self._clean_course_data(payload, partial=True)
            if course_patch:
                self._validate_course(course_patch, company_id=company_id, existing_id=int(course.id))
                self._apply_patch(course, course_patch)
                self.s.flush([course])

            if offerings_present:
                self._sync_offerings_for_course(
                    company_id=company_id,
                    course=course,
                    offerings=offerings_payload or [],
                )

            self._commit_or_flush()
            return True, "Course updated successfully", {"record": {"course": self._course_record(course)}}

        except (BusinessValidationError, NotFoundError) as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("update_course failed: %s", e)
            raise

    def update_offering(self, *, company_id: int, offering_id: int, data: Dict[str, Any]):
        """
        Update an offering. If 'chapters' exists, it becomes the full active set.
        Missing chapters are soft‑disabled. Present chapters are enabled (unless explicitly disabled).
        """
        try:
            payload = dict(data or {})
            chapters_present = "chapters" in payload
            chapters_payload = payload.pop("chapters", None)

            # Ignore old control fields
            payload.pop("offering_missing_row_action", None)
            payload.pop("chapter_missing_row_action", None)
            payload.pop("permanent", None)

            offering = self.course_repo.get_offering_with_children(company_id=company_id, offering_id=offering_id)
            if not offering:
                raise NotFoundError(ERR_COURSE_OFFERING_NOT_FOUND)

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
            return False, "Database constraint error.", None
        except Exception as e:
            self._rollback_if_needed()
            log.exception("update_offering failed: %s", e)
            raise

    # ------------------------------------------------------------------
    # Helpers (validation, cleaning, sync)
    # ------------------------------------------------------------------
    def _get_course_or_fail(self, *, company_id: int, course_id: int) -> Course:
        if not course_id:
            raise BusinessValidationError("course_id is required.")
        course = self.course_repo.get_course(int(course_id), company_id=int(company_id))
        if not course:
            raise NotFoundError(ERR_COURSE_NOT_FOUND)
        return course

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
            ch = data.get("credit_hours")
            if ch is None or ch == "":
                out["credit_hours"] = None
            else:
                ch = int(ch)
                if ch < 0 or ch > 30:
                    raise BusinessValidationError("Credit hours must be between 0 and 30.")
                out["credit_hours"] = ch
        if "is_enabled" in data or not partial:
            out["is_enabled"] = _as_bool(data.get("is_enabled"), default=True)
        return out

    def _clean_chapter_data(self, raw: Dict[str, Any], *, partial: bool) -> Dict[str, Any]:
        data = {k: v for k, v in dict(raw or {}).items() if k in CHAPTER_FIELDS}
        out: Dict[str, Any] = {}
        if "id" in data and data.get("id") is not None:
            out["id"] = int(data["id"])
        if "number" in data and data.get("number") is not None:
            num = int(data["number"])
            if num < 1:
                raise BusinessValidationError("Chapter number must be at least 1.")
            out["number"] = num
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


    def _validate_course(self, data: Dict[str, Any], *, company_id: int, existing_id: Optional[int]) -> None:
        if "title" in data and self.course_repo.course_title_exists(
            company_id=company_id, title=data["title"], exclude_id=existing_id
        ):
            raise BusinessValidationError(ERR_COURSE_EXISTS_TITLE)
        if data.get("code") and self.course_repo.course_code_exists(
            company_id=company_id, code=data["code"], exclude_id=existing_id
        ):
            raise BusinessValidationError(ERR_COURSE_CODE_EXISTS)

    def _validate_offering(self, data: Dict[str, Any], *, company_id: int, course_id: int, existing: Optional[CourseOffering] = None) -> None:
        final_course_id = int(data.get("course_id") or course_id)
        final_department_id = int(
            data.get("department_id") if "department_id" in data else getattr(existing, "department_id", 0) or 0
        )
        final_semester_id = data.get("semester_id") if "semester_id" in data else getattr(existing, "semester_id", None)
        final_custom_title = data.get("custom_title") if "custom_title" in data else getattr(existing, "custom_title", None)
        exclude_id = int(existing.id) if existing is not None else None

        self._get_course_or_fail(company_id=company_id, course_id=final_course_id)
        if not final_department_id:
            raise BusinessValidationError("department_id is required.")
        if not self.course_repo.get_department(final_department_id, company_id=company_id):
            raise NotFoundError(ERR_DEPARTMENT_NOT_FOUND)
        if final_semester_id is not None and not self.course_repo.get_semester(int(final_semester_id), company_id=company_id):
            raise NotFoundError(ERR_SEMESTER_NOT_FOUND)
        if self.course_repo.offering_scope_exists(
            company_id=company_id, course_id=final_course_id, department_id=final_department_id,
            semester_id=final_semester_id, exclude_id=exclude_id
        ):
            raise BusinessValidationError(ERR_COURSE_OFFERING_EXISTS_IN_SCOPE)
        if self.course_repo.offering_custom_title_exists(
            company_id=company_id, course_id=final_course_id, custom_title=final_custom_title, exclude_id=exclude_id
        ):
            raise BusinessValidationError(ERR_COURSE_OFFERING_EXISTS_TITLE)

    def _validate_chapter(self, data: Dict[str, Any], *, company_id: int, offering_id: int, existing: Optional[CourseChapter] = None) -> None:
        exclude_id = int(existing.id) if existing is not None else None
        number = data.get("number") if "number" in data else getattr(existing, "number", None)
        title = data.get("title") if "title" in data else getattr(existing, "title", None)
        if number is not None and self.course_repo.chapter_number_exists(
            company_id=company_id, offering_id=offering_id, number=int(number), exclude_id=exclude_id
        ):
            raise BusinessValidationError(ERR_CHAPTER_EXISTS_NUMBER)
        if title and self.course_repo.chapter_title_exists(
            company_id=company_id, offering_id=offering_id, title=title, exclude_id=exclude_id
        ):
            raise BusinessValidationError(ERR_CHAPTER_EXISTS_TITLE)

    def _validate_request_limits(self, *, offerings: Optional[List[Dict[str, Any]]] = None, chapters: Optional[List[Dict[str, Any]]] = None) -> None:
        if offerings is not None and len(offerings) > MAX_OFFERINGS_PER_REQUEST:
            raise BusinessValidationError(f"Cannot process more than {MAX_OFFERINGS_PER_REQUEST} offerings in one request.")
        if chapters is not None and len(chapters) > MAX_CHAPTERS_PER_OFFERING:
            raise BusinessValidationError(f"Cannot process more than {MAX_CHAPTERS_PER_OFFERING} chapters for one offering.")

    def _validate_no_duplicate_offerings_in_payload(self, offerings: List[Dict[str, Any]], *, course_id: int) -> None:
        seen_ids: Set[int] = set()
        seen_scopes: Set[Tuple[int, int, Optional[int]]] = set()
        seen_titles: Set[str] = set()
        for raw in offerings:
            row = dict(raw or {})
            if row.get("id") is not None:
                rid = int(row["id"])
                if rid in seen_ids:
                    raise BusinessValidationError("Duplicate offering id in request.")
                seen_ids.add(rid)
            row_course_id = int(row.get("course_id") or course_id)
            dept_raw = row.get("department_id")
            dept_id = int(dept_raw) if dept_raw is not None else 0
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
        for raw in chapters:
            row = dict(raw or {})
            if row.get("id") is not None:
                rid = int(row["id"])
                if rid in seen_ids:
                    raise BusinessValidationError("Duplicate chapter id in request.")
                seen_ids.add(rid)
            if row.get("number") is not None:
                num = int(row["number"])
                if num in seen_numbers:
                    raise BusinessValidationError(ERR_CHAPTER_EXISTS_NUMBER)
                seen_numbers.add(num)
            title = (row.get("title") or "").strip().lower()
            if title:
                if title in seen_titles:
                    raise BusinessValidationError(ERR_CHAPTER_EXISTS_TITLE)
                seen_titles.add(title)

    # Create helpers (unchanged)
    def _save_new_offerings_for_course(self, *, company_id: int, course_id: int, offerings: List[Dict[str, Any]]) -> List[CourseOffering]:
        if not isinstance(offerings, list):
            raise BusinessValidationError("offerings must be a list.")
        self._validate_request_limits(offerings=offerings)
        self._validate_no_duplicate_offerings_in_payload(offerings, course_id=course_id)
        saved = []
        for raw in offerings:
            row = dict(raw or {})
            chapters_payload = row.pop("chapters", None) or []
            if row.get("id"):
                raise BusinessValidationError("New offering rows must not include id.")
            clean = self._clean_offering_data(row, partial=False)
            clean["course_id"] = int(course_id)
            self._validate_offering(clean, company_id=company_id, course_id=int(course_id), existing=None)
            offering = self.course_repo.create_offering({"company_id": int(company_id), **clean})
            if chapters_payload:
                self._save_new_chapters_for_offering(company_id=company_id, offering_id=int(offering.id), chapters=chapters_payload)
            saved.append(offering)
        return saved

    def _save_new_chapters_for_offering(self, *, company_id: int, offering_id: int, chapters: List[Dict[str, Any]]) -> List[CourseChapter]:
        if not isinstance(chapters, list):
            raise BusinessValidationError("chapters must be a list.")
        self._validate_request_limits(chapters=chapters)
        self._validate_no_duplicate_chapters_in_payload(chapters)
        saved = []
        for raw in chapters:
            row = dict(raw or {})
            if row.get("id"):
                raise BusinessValidationError("New chapter rows must not include id.")
            clean = self._clean_chapter_data(row, partial=False)
            self._validate_chapter(clean, company_id=company_id, offering_id=offering_id, existing=None)
            chapter = self.course_repo.create_chapter({
                "company_id": int(company_id),
                "course_offering_id": int(offering_id),
                **clean,
            })
            saved.append(chapter)
        return saved

    # Frappe-style sync (auto-enable present, auto-disable missing)
    def _sync_offerings_for_course(self, *, company_id: int, course: Course, offerings: List[Dict[str, Any]]) -> List[CourseOffering]:
        if not isinstance(offerings, list):
            raise BusinessValidationError("offerings must be a list.")
        self._validate_request_limits(offerings=offerings)
        self._validate_no_duplicate_offerings_in_payload(offerings, course_id=int(course.id))

        existing_map = {int(o.id): o for o in (course.offerings or [])}
        incoming_ids: Set[int] = set()
        saved = []

        for raw in offerings:
            row = dict(raw or {})
            chapters_present = "chapters" in row
            chapters_payload = row.pop("chapters", None)
            # Clean any old control fields from nested rows
            row.pop("offering_missing_row_action", None)
            row.pop("chapter_missing_row_action", None)
            row.pop("permanent", None)

            clean = self._clean_offering_data(row, partial=bool(row.get("id")))
            offering_id = clean.pop("id", None)

            if offering_id:
                if int(offering_id) not in existing_map:
                    raise BusinessValidationError(f"Offering {offering_id} does not belong to course {int(course.id)}.")
                offering = existing_map[int(offering_id)]
                incoming_ids.add(int(offering.id))

                if "course_id" in clean and int(clean["course_id"]) != int(course.id):
                    raise BusinessValidationError("Offering course_id cannot be changed from update_course().")

                self._validate_offering(clean, company_id=company_id, course_id=int(course.id), existing=offering)
                self._apply_patch(offering, clean)

                # Frappe rule: if client didn't specify is_enabled, we set it to True (enabled)
                if "is_enabled" not in clean:
                    offering.is_enabled = True
                self.s.flush([offering])
            else:
                clean["course_id"] = int(course.id)
                self._validate_offering(clean, company_id=company_id, course_id=int(course.id), existing=None)
                offering = self.course_repo.create_offering({"company_id": int(company_id), **clean})
                incoming_ids.add(int(offering.id))

            if chapters_present:
                self._sync_chapters_for_offering(company_id=company_id, offering=offering, chapters=chapters_payload or [])

            saved.append(offering)

        # Soft-disable offerings that are not in the request
        for oid, offering in existing_map.items():
            if oid not in incoming_ids:
                offering.is_enabled = False
                self.s.flush([offering])

        return saved

    def _sync_chapters_for_offering(self, *, company_id: int, offering: CourseOffering, chapters: List[Dict[str, Any]]) -> List[CourseChapter]:
        if not isinstance(chapters, list):
            raise BusinessValidationError("chapters must be a list.")
        self._validate_request_limits(chapters=chapters)
        self._validate_no_duplicate_chapters_in_payload(chapters)

        existing_map = {int(ch.id): ch for ch in (offering.chapters or [])}
        incoming_ids: Set[int] = set()
        saved = []

        for raw in chapters:
            row = dict(raw or {})
            row.pop("chapter_missing_row_action", None)
            row.pop("permanent", None)

            clean = self._clean_chapter_data(row, partial=bool(row.get("id")))
            chapter_id = clean.pop("id", None)

            if chapter_id:
                if int(chapter_id) not in existing_map:
                    raise BusinessValidationError(f"Chapter {chapter_id} does not belong to offering {int(offering.id)}.")
                chapter = existing_map[int(chapter_id)]
                incoming_ids.add(int(chapter.id))

                self._validate_chapter(clean, company_id=company_id, offering_id=int(offering.id), existing=chapter)
                self._apply_patch(chapter, clean)

                if "is_enabled" not in clean:
                    chapter.is_enabled = True
                self.s.flush([chapter])
            else:
                self._validate_chapter(clean, company_id=company_id, offering_id=int(offering.id), existing=None)
                chapter = self.course_repo.create_chapter({
                    "company_id": int(company_id),
                    "course_offering_id": int(offering.id),
                    **clean,
                })
                incoming_ids.add(int(chapter.id))

            saved.append(chapter)

        for chid, chapter in existing_map.items():
            if chid not in incoming_ids:
                chapter.is_enabled = False
                self.s.flush([chapter])

        return saved

    # Response formatters (only id + title)
    @staticmethod
    def _minimal_record(obj: Any, *, title_fallback: Optional[str] = None) -> Dict[str, Any]:
        return {
            "id": int(obj.id),
            "title": getattr(obj, "title", None) or title_fallback,
        }

    def _course_record(self, course: Course) -> Dict[str, Any]:
        return self._minimal_record(course)

    def _offering_record(self, offering: CourseOffering) -> Dict[str, Any]:
        # For offering, title is custom_title if present, else None
        return self._minimal_record(offering, title_fallback=offering.custom_title)

    def _chapter_record(self, chapter: CourseChapter) -> Dict[str, Any]:
        return self._minimal_record(chapter)

    @staticmethod
    def _apply_patch(obj: Any, patch: Dict[str, Any]) -> None:
        for key, value in patch.items():
            if key == "id":
                continue
            if hasattr(obj, key):
                setattr(obj, key, value)