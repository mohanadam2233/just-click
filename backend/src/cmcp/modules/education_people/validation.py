from __future__ import annotations

from cmcp.core.exceptions import BusinessValidationError, NotFoundError


# ----------------------------
# Not found messages
# ----------------------------
ERR_CLASSROOM_NOT_FOUND = "Classroom not found."
ERR_STUDENT_NOT_FOUND = "Student profile not found."
ERR_STAFF_NOT_FOUND = "Staff profile not found."
ERR_FACULTY_NOT_FOUND = "Faculty not found."
ERR_DEPARTMENT_NOT_FOUND = "Department not found."
ERR_USER_NOT_FOUND = "Base user account not found."

# ----------------------------
# Exists / uniqueness messages
# ----------------------------
ERR_CLASSROOM_EXISTS = "Classroom name already exists."

ERR_STUDENT_USER_EXISTS = "This user already has a student profile."


ERR_STAFF_USER_EXISTS = "This user already has a staff profile."
ERR_STAFF_ID_EXISTS = "Staff ID already exists."

ERR_STUDENT_ID_EXISTS = (
    "Student ID is already taken. If you believe this ID belongs to you, contact your department admin."
)
ERR_EMAIL_EXISTS = (
    "This email is already registered. Use a different email or sign in if you already have an account."
)
ERR_INVALID_EMAIL = "Please enter a valid email address."
ERR_SEMESTER_NOT_FOUND = "Semester not found."
ERR_VERIFY_EXPIRED = "Verification link expired. Please request a new verification email."
ERR_ADMIN_REJECTED = "Your registration was rejected. Please contact admin@jamhuriya.edu for more information."
ERR_PENDING_APPROVAL = "Your account is pending admin approval. You will receive an email when approved."
# ----------------------------
# Staff creation specifics
# ----------------------------
ERR_STAFF_ID_REQUIRED = "staff_id is required for staff creation."
ERR_INVALID_PASSWORD = "Password must be at least 6 characters."
ERR_EMAIL_REQUIRED = "Email is required for staff creation."

# ----------------------------
# Required helpers
# ----------------------------
def ensure_found(obj, *, message: str):
    if not obj:
        raise NotFoundError(message)
    return obj
def require_text(value: str | None, *, field_label: str) -> str:
    v = (value or "").strip()
    if not v:
        raise BusinessValidationError(f"{field_label} is required.")
    return v


def normalize_email(v: str | None) -> str:
    from cmcp.common.validation.text import normalize_email as _normalize_email

    try:
        return _normalize_email(v)
    except BusinessValidationError:
        raise BusinessValidationError(ERR_INVALID_EMAIL) from None