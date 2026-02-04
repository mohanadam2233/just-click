from __future__ import annotations

from typing import Any, Dict, Generic, Optional, TypeVar, Union

from flask import current_app
from pydantic import BaseModel, Field
from pydantic.config import ConfigDict

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """
    Standard API envelope.

    - success: bool
    - message: short human-readable message (safe to show in UI)
    - data: payload (object/list/etc)
    - error_code: app-specific error code (or fallback to HTTP status)
    - errors: structured field/validation errors
    - meta: pagination, request_id, etc
    """
    success: bool = Field(..., description="Whether the request was successful.")
    message: str = Field("", description="Human-readable message (UI friendly).")
    data: Optional[T] = Field(None, description="Result payload.")

    error_code: Optional[Union[int, str]] = Field(
        None,
        description="Application error code (or fallback to HTTP status).",
    )

    errors: Optional[Union[Dict[str, Any], list]] = Field(
        None,
        description="Structured validation errors (field -> messages) or list.",
    )

    meta: Optional[Dict[str, Any]] = Field(
        None,
        description="Extra metadata (pagination, request_id, etc).",
    )

    model_config = ConfigDict(from_attributes=True)


def _json(payload: dict, status_code: int):
    """
    Central JSON responder.
    Uses Flask's JSON provider (recommended), falls back safely.
    """
    try:
        return current_app.json.response(payload), status_code
    except Exception:
        # fallback if current_app isn't available (rare) or json provider fails
        from flask import jsonify
        return jsonify(payload), status_code


def api_success(
    data: Optional[T] = None,
    message: str = "Success",
    status_code: int = 200,
    *,
    meta: Optional[Dict[str, Any]] = None,
):
    payload = APIResponse[T](
        success=True,
        message=message,
        data=data,
        error_code=None,
        errors=None,
        meta=meta,
    ).model_dump()
    return _json(payload, status_code)


def api_error(
    message: str = "Error",
    *,
    status_code: int = 400,
    error_code: Optional[Union[int, str]] = None,
    data: Any = None,
    errors: Optional[Union[Dict[str, Any], list]] = None,
    meta: Optional[Dict[str, Any]] = None,
):
    # Always include status_code in meta (handy for UI and logs)
    meta_out = dict(meta or {})
    meta_out.setdefault("status_code", status_code)

    payload = APIResponse[Any](
        success=False,
        message=message,
        data=data,
        error_code=error_code if error_code is not None else status_code,
        errors=errors,
        meta=meta_out,
    ).model_dump()
    return _json(payload, status_code)
