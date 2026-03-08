
# src/cmcp/modules/media/service.py
from __future__ import annotations

from typing import Optional
from werkzeug.datastructures import FileStorage

from .encrypted_media import store_or_replace_encrypted_image  # keep existing
from .encrypted_files import store_or_replace_encrypted_file   # ✅ new
from .utils import MediaFolder

def save_image_for(
    *,
    folder: str,
    item_id: int | str,
    file: Optional[FileStorage] = None,
    bytes_: Optional[bytes] = None,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
    old_img_key: Optional[str] = None,
) -> Optional[str]:
    if file is not None:
        bytes_ = file.read()
        filename = file.filename or filename or "upload"
        content_type = file.mimetype or content_type

    if not bytes_ or not filename:
        return None

    new_key = store_or_replace_encrypted_image(
        file_bytes=bytes_,
        filename=filename,
        key_prefix=folder,
        item_id=item_id,
        content_type=content_type,
        old_img_key=old_img_key,
    )
    return new_key

def save_file_for(
    *,
    folder: str,
    item_id: int | str,
    file: Optional[FileStorage] = None,
    bytes_: Optional[bytes] = None,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
    old_file_key: Optional[str] = None,
) -> Optional[str]:
    """
    ✅ Generic encrypted file upload (ppt/pdf/doc/video/etc).
    Deterministic key => overwrite.
    """
    if file is not None:
        bytes_ = file.read()
        filename = file.filename or filename or "file"
        content_type = file.mimetype or content_type

    if not bytes_ or not filename:
        return None

    new_key = store_or_replace_encrypted_file(
        file_bytes=bytes_,
        filename=filename,
        key_prefix=folder,
        item_id=item_id,
        content_type=content_type,
        old_key=old_file_key,
    )
    return new_key