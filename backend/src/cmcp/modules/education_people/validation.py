from __future__ import annotations
import re
from cmcp.core.exceptions import BusinessValidationError, NotFoundError


# ----------------------------
# Not found messages
# ----------------------------
ERR_CLASSROOM_NOT_FOUND = "Classroom not found."
ERR_STUDENT_NOT_FOUND = "Student profile not found."
ERR_STAFF_NOT_FOUND = "Staff profile not found."
ERR_FACULTY_NOT_FOUND = "Faculty not found."
ERR_DEPARTMENT_NOT_FOUND = "Department not found."


# ----------------------------
# Exists / uniqueness messages
# ----------------------------
ERR_CLASSROOM_EXISTS = "Classroom name already exists."

ERR_STUDENT_USER_EXISTS = "This user already has a student profile."


ERR_STAFF_USER_EXISTS = "This user already has a staff profile."
ERR_STAFF_ID_EXISTS = "Staff ID already exists."

ERR_STUDENT_ID_EXISTS = "This Student ID is already registered. Please login or use 'Forgot Password'."
ERR_EMAIL_EXISTS = "This email is already registered. Please use a different email or login."
ERR_INVALID_EMAIL = "Please enter a valid email address."
ERR_VERIFY_EXPIRED = "Verification link expired. Please request a new verification email."
ERR_ADMIN_REJECTED = "Your registration was rejected. Please contact admin@jamhuriya.edu for more information."
ERR_PENDING_APPROVAL = "Your account is pending admin approval. You will receive an email when approved."

# ----------------------------
# Required helpers
# ----------------------------
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def ensure_found(obj, *, message: str):
    if not obj:
        raise NotFoundError(message)
    return obj
def require_text(v: str | None, *, label: str) -> str:
    s = (v or "").strip()
    if not s:
        raise BusinessValidationError(f"{label} is required.")
    return s


def normalize_email(v: str | None) -> str:
    s = (v or "").strip().lower()
    if not s or not EMAIL_RE.match(s):
        raise BusinessValidationError(ERR_INVALID_EMAIL)
    return s