from __future__ import annotations

from pydantic import BaseModel


class DocPermissionOut(BaseModel):
    role: str
    level: int = 0

    can_read: bool = False
    can_write: bool = False     # maps to UPDATE
    can_create: bool = False
    can_delete: bool = False
    can_upload: bool = False
    can_download: bool = False
