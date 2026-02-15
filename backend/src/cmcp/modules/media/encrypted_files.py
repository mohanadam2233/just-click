# src/cmcp/modules/media/encrypted_files.py
from __future__ import annotations

from typing import Optional, Tuple
import mimetypes

from cmcp.common.security.encryption import encrypt_bytes, decrypt_bytes
from .storage import get_backend
from .utils import validate_upload, sanitize_segment

_backend = get_backend()

def _deterministic_key(prefix: str, item_id: int | str, filename: str) -> str:
    """
    Deterministic path so updates overwrite the same object (no history kept).
    We keep extension so we can infer mime later.
    Example:
      edu_materials_files/123/file.pptx.enc
    """
    pfx = sanitize_segment(prefix)
    safe_name = sanitize_segment(filename or "file")
    # enforce "file.<ext>" style (stable)
    ext = ""
    if "." in safe_name:
        ext = "." + safe_name.rsplit(".", 1)[-1].lower()
    return f"{pfx}/{item_id}/file{ext}.enc"

def store_or_replace_encrypted_file(
    *,
    file_bytes: bytes,
    filename: str,
    key_prefix: str,
    item_id: int | str,
    content_type: Optional[str] = None,
    old_key: Optional[str] = None,
) -> str:
    ok, err = validate_upload(filename, len(file_bytes))
    if not ok:
        raise ValueError(err or "Invalid upload")

    ciphertext = encrypt_bytes(file_bytes)
    new_key = _deterministic_key(key_prefix, item_id, filename)

    _backend.upload(new_key, ciphertext, content_type or "application/octet-stream")

    if old_key and old_key != new_key:
        try:
            _backend.delete(old_key)
        except Exception:
            pass

    return new_key

def download_and_decrypt_file(file_key: str) -> Tuple[bytes, str]:
    data = _backend.download(file_key)
    raw = decrypt_bytes(data)

    # infer mime from key (strip .enc)
    key_no_enc = file_key[:-4] if file_key.endswith(".enc") else file_key
    mime, _ = mimetypes.guess_type(key_no_enc)
    return raw, (mime or "application/octet-stream")

def file_url_from_key(file_key: str, *, external_base: Optional[str] = None) -> str:
    base = (external_base or "").rstrip("/")
    return f"{base}/api/media/file/{file_key}"