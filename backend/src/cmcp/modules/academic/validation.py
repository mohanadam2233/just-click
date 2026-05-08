from __future__ import annotations

from cmcp.core.exceptions import BusinessValidationError, NotFoundError


# ----------------------------
# Not found messages
# ----------------------------
ERR_FACULTY_NOT_FOUND = "Faculty not found."
ERR_DEPARTMENT_NOT_FOUND = "Department not found."
ERR_ACADEMIC_YEAR_NOT_FOUND = "Academic year not found."
ERR_SEMESTER_NOT_FOUND = "Semester not found."
ERR_COURSE_NOT_FOUND = "Course not found."
ERR_CHAPTER_NOT_FOUND = "Chapter not found."
ERR_COURSE_OFFERING_NOT_FOUND = "Course offering not found."  # NEW

# ----------------------------
# Exists / uniqueness messages
# ----------------------------
ERR_FACULTY_EXISTS = "Faculty already exists with this name."
ERR_FACULTY_CODE_EXISTS = "Faculty code already exists."

ERR_DEPARTMENT_EXISTS_IN_FACULTY = "Department already exists with this name in this faculty."
ERR_DEPARTMENT_CODE_EXISTS = "Department code already exists."

ERR_ACADEMIC_YEAR_EXISTS = "Academic year already exists with this name."

ERR_SEMESTER_EXISTS_NAME = "Semester already exists with this name."
ERR_SEMESTER_EXISTS_NUMBER = "Semester already exists with this number in this academic year."

ERR_COURSE_EXISTS_TITLE = "Course already exists with this title."  # UPDATED
ERR_COURSE_CODE_EXISTS = "Course code already exists."

ERR_CHAPTER_EXISTS_TITLE = "Chapter already exists with this title."
ERR_CHAPTER_EXISTS_NUMBER = "Chapter already exists with this number in this course."

ERR_COURSE_OFFERING_EXISTS_IN_SCOPE = "Course offering already exists with this course, department, and semester."
# ----------------------------
# Linked delete message helper
# ----------------------------
def cannot_delete_linked(entity: str, linked_to: str) -> str:
    return f"Cannot delete {entity} because it is linked with {linked_to}."


# ----------------------------
# Required field helpers
# ----------------------------
def require_text(value: str | None, *, field_label: str) -> str:
    v = (value or "").strip()
    if not v:
        raise BusinessValidationError(f"{field_label} is required.")
    return v


def normalize_code(value: str | None) -> str | None:
    v = (value or "").strip()
    return v or None


# ----------------------------
# Not found helpers
# ----------------------------
def ensure_found(obj, *, message: str):
    if not obj:
        raise NotFoundError(message)
    return obj
