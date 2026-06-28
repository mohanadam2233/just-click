from __future__ import annotations

from pydantic import ValidationError

_DEFAULT_LABELS = {
    "student_id": "Student ID",
    "email": "Email",
    "full_name": "Full name",
    "faculty_id": "Faculty",
    "department_id": "Department",
    "semester_id": "Current semester",
    "classroom_id": "Classroom",
    "username": "Username",
    "password": "Password",
}


def clean_pydantic_error(
    exc: ValidationError,
    *,
    field_labels: dict[str, str] | None = None,
) -> str:
    errors = exc.errors() or []
    if not errors:
        return "Invalid request data."

    labels = {**_DEFAULT_LABELS, **(field_labels or {})}

    first = errors[0]
    loc = first.get("loc") or []
    field = str(loc[-1]) if loc else "field"
    err_type = first.get("type", "")
    msg = first.get("msg", "Invalid value.")

    label = labels.get(field, field.replace("_", " ").title())

    if err_type == "missing":
        return f"{label} is required."

    if err_type in {"int_parsing", "int_type"}:
        return f"{label} must be a valid number."

    if err_type in {"float_parsing", "float_type"}:
        return f"{label} must be a valid decimal number."

    if err_type in {"bool_parsing", "bool_type"}:
        return f"{label} must be true or false."

    if err_type in {"list_type"}:
        return f"{label} must be a list."

    return f"{label}: {msg}"
