# app/core/exceptions.py
from __future__ import annotations


class ServiceError(Exception):
    """Generic service layer error."""


class BusinessValidationError(ServiceError):
    """Business rule violation (friendly message)."""


class NotFoundError(ServiceError):
    """Resource not found."""


class PermissionDeniedError(ServiceError):
    """RBAC denied."""
