from __future__ import annotations

import re

from cmcp.core.exceptions import BusinessValidationError

NUMERIC_ONLY_RE = re.compile(r"^\d+$")
EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


def validate_readable_name(
    value: str | None,
    *,
    field_label: str,
    min_len: int = 2,
    max_len: int = 200,
    allow_leading_digit: bool = False,
) -> str:
    text = (value or "").strip()
    if not text:
        raise BusinessValidationError(f"{field_label} is required.")
    if len(text) < min_len:
        raise BusinessValidationError(f"{field_label} is too short.")
    if len(text) > max_len:
        raise BusinessValidationError(f"{field_label} is too long.")
    if NUMERIC_ONLY_RE.match(text):
        raise BusinessValidationError("Name cannot be numbers only.")
    if not allow_leading_digit and text[0].isdigit():
        raise BusinessValidationError(f"{field_label} cannot start with a number.")
    return text


def validate_optional_readable_name(
    value: str | None,
    *,
    field_label: str,
    max_len: int = 200,
) -> str | None:
    text = (value or "").strip()
    if not text:
        return None
    return validate_readable_name(
        text,
        field_label=field_label,
        min_len=2,
        max_len=max_len,
    )


def validate_course_code(value: str | None) -> str | None:
    text = (value or "").strip()
    if not text:
        return None
    if len(text) > 50:
        raise BusinessValidationError("Course code is too long.")
    if NUMERIC_ONLY_RE.match(text):
        raise BusinessValidationError("Course code cannot be numbers only.")
    return text


def validate_student_id(value: str | None) -> str:
    text = (value or "").strip()
    if len(text) < 3:
        raise BusinessValidationError("Student ID must be at least 3 characters.")
    if len(text) > 60:
        raise BusinessValidationError("Student ID is too long.")
    if NUMERIC_ONLY_RE.match(text):
        raise BusinessValidationError("Student ID cannot be numbers only.")
    return text


def normalize_email(value: str | None) -> str:
    text = (value or "").strip().lower()
    if not text or not EMAIL_RE.match(text):
        raise BusinessValidationError("Please enter a valid email address.")
    return text
