from __future__ import annotations

from cmcp.core.exceptions import BusinessValidationError, NotFoundError


# ----------------------------
# Not found messages
# ----------------------------
ERR_CLASSROOM_NOT_FOUND = "Classroom not found."
ERR_STUDENT_NOT_FOUND = "Student profile not found."
ERR_STAFF_NOT_FOUND = "Staff profile not found."


# ----------------------------
# Exists / uniqueness messages
# ----------------------------
ERR_CLASSROOM_EXISTS = "Classroom name already exists."

ERR_STUDENT_USER_EXISTS = "This user already has a student profile."
ERR_STUDENT_ID_EXISTS = "Student ID already exists."

ERR_STAFF_USER_EXISTS = "This user already has a staff profile."
ERR_STAFF_ID_EXISTS = "Staff ID already exists."


# ----------------------------
# Required helpers
# ----------------------------
def require_text(value: str | None, *, field_label: str) -> str:
    v = (value or "").strip()
    if not v:
        raise BusinessValidationError(f"{field_label} is required.")
    return v


# ----------------------------
# Not found helper
# ----------------------------
def ensure_found(obj, *, message: str):
    if not obj:
        raise NotFoundError(message)
    return obj
