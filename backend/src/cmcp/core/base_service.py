# cmcp/core/base_service.py
from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any, Dict, Generic, Optional, Tuple, Type, TypeVar, List, Iterable

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository, PageResult
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.common.date_utils import format_date_out

log = logging.getLogger(__name__)
T = TypeVar("T")


class _UnsetType:
    pass


UNSET = _UnsetType()


def _pick(d: Dict[str, Any], keys: Iterable[str]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for k in keys:
        if k in d and d[k] is not None:
            out[k] = d[k]
    return out


class BaseService(Generic[T]):
    """
    Generic service:
      - commit-or-flush (nested-safe)
      - strict company scoping (decorator controls company_id)
      - small response payload support (public_fields)
      - date-only formatting via format_date_out
    """

    def __init__(
        self,
        model: Type[T],
        session: Optional[Session] = None,
        repo_cls: Type[BaseRepository] = BaseRepository,
        *,
        public_fields: Optional[List[str]] = None,
    ):
        self.model = model
        self.s: Session = session or db.session
        self.repo: BaseRepository[T] = repo_cls(model, self.s)
        self._tenant_aware = hasattr(model, "company_id")
        self.public_fields = public_fields or ["id", "name", "code", "title"]  # default

    # ---------------- Tx helpers ----------------
    @property
    def _in_nested_tx(self) -> bool:
        try:
            fn = getattr(self.s, "in_nested_transaction", None)
            if callable(fn):
                return bool(fn())
        except Exception:
            pass

        tx = getattr(self.s, "transaction", None)
        if tx is None:
            return False

        if getattr(tx, "nested", False):
            return True

        parent = getattr(tx, "parent", None)
        while parent is not None:
            if getattr(parent, "nested", False):
                return True
            parent = getattr(parent, "parent", None)
        return False

    def _commit_or_flush(self) -> None:
        if self._in_nested_tx:
            self.s.flush()
        else:
            self.s.commit()

    def _rollback_if_top_level(self) -> None:
        if self._in_nested_tx:
            return
        self.s.rollback()

    # ---------------- Serialization ----------------
    def _format_value(self, v: Any) -> Any:
        # Convert datetime/date to DD-MM-YYYY
        if isinstance(v, (datetime, date)):
            return format_date_out(v)
        return v

    def serialize(self, obj: T, *, only: Optional[List[str]] = None) -> Dict[str, Any]:
        if not obj:
            return {}

        if hasattr(obj, "to_dict"):
            d = obj.to_dict()
        elif hasattr(obj, "as_dict"):
            d = obj.as_dict()
        else:
            d = {}
            for k, v in getattr(obj, "__dict__", {}).items():
                if not k.startswith("_"):
                    d[k] = v

        # format all date/datetime fields
        for k in list(d.keys()):
            d[k] = self._format_value(d[k])

        if only:
            # if "name" doesn't exist but "title" exists, allow it (and vice versa)
            return _pick(d, only)

        return d

    def serialize_public(self, obj: T) -> Dict[str, Any]:
        """
        Return a small payload:
          - always includes id
          - includes name/title if present
          - includes code if present
        """
        full = self.serialize(obj)
        # Normalize "label" fields: prefer name, else title
        out: Dict[str, Any] = {}
        if "id" in full:
            out["id"] = full["id"]
        if full.get("name"):
            out["name"] = full["name"]
        elif full.get("title"):
            out["title"] = full["title"]
        if full.get("code") is not None:
            out["code"] = full["code"]
        return out

    # ---------------- Helpers ----------------
    def _enforce_company_payload(self, *, company_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Security + clarity:
        - If tenant aware, company_id MUST equal decorator company_id.
        - If user sends different company_id => 400 (prevent confusion).
        - Then force company_id to decorator value.
        """
        if not self._tenant_aware:
            return payload

        if "company_id" in payload and payload["company_id"] is not None:
            try:
                sent = int(payload["company_id"])
            except Exception:
                raise BusinessValidationError("company_id must be an integer.")
            if sent != int(company_id):
                raise BusinessValidationError("company_id in body does not match your active company scope.")

        payload["company_id"] = int(company_id)
        return payload

    # ---------------- CRUD ----------------
    def create(
        self,
        *,
        company_id: int,
        data: Dict[str, Any],
        return_public: bool = True,
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            payload = self._enforce_company_payload(company_id=company_id, payload=dict(data))

            obj = self.repo.create(payload)
            self.s.flush([obj])
            self._commit_or_flush()

            rec = self.serialize_public(obj) if return_public else self.serialize(obj)
            return True, f"{self.model.__name__} created", {"record": rec}

        except BusinessValidationError as e:
            self._rollback_if_top_level()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_top_level()
            return False, "Database constraint error.", None
        except Exception as e:
            self._rollback_if_top_level()
            log.exception("create failed: %s", e)
            return False, "Unexpected error.", None

    def update(
        self,
        *,
        company_id: int,
        id: int,
        data: Dict[str, Any],
        allow_nulls: bool = True,
        return_public: bool = True,
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.get(int(id), company_id=int(company_id))
            if not obj:
                raise NotFoundError(f"{self.model.__name__} not found.")

            payload = dict(data)

            # prevent changing company_id by update payload
            if self._tenant_aware and "company_id" in payload:
                payload.pop("company_id", None)

            for k, v in payload.items():
                if v is UNSET:
                    continue
                if not hasattr(obj, k):
                    continue
                if v is None and not allow_nulls:
                    continue
                setattr(obj, k, v)

            self.s.flush([obj])
            self._commit_or_flush()

            rec = self.serialize_public(obj) if return_public else self.serialize(obj)
            return True, f"{self.model.__name__} updated", {"record": rec}

        except NotFoundError as e:
            self._rollback_if_top_level()
            return False, str(e), None
        except BusinessValidationError as e:
            self._rollback_if_top_level()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_top_level()
            return False, "Database constraint error.", None
        except Exception as e:
            self._rollback_if_top_level()
            log.exception("update failed: %s", e)
            return False, "Unexpected error.", None

    def delete(self, *, company_id: int, id: int, soft: bool = True) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.get(int(id), company_id=int(company_id))
            if not obj:
                raise NotFoundError(f"{self.model.__name__} not found.")

            if soft and hasattr(obj, "is_enabled"):
                setattr(obj, "is_enabled", False)
                self.s.flush([obj])
            else:
                self.s.delete(obj)
                self.s.flush()

            self._commit_or_flush()
            return True, f"{self.model.__name__} deleted", {"id": int(id)}

        except NotFoundError as e:
            self._rollback_if_top_level()
            return False, str(e), None
        except Exception as e:
            self._rollback_if_top_level()
            log.exception("delete failed: %s", e)
            return False, "Unexpected error.", None

    def bulk_delete(self, *, company_id: int, ids: List[int], soft: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        ids = [int(x) for x in (ids or []) if x]
        if not ids:
            return True, "Nothing to delete.", {"deleted": 0, "requested": 0}

        try:
            if soft:
                deleted = self.repo.soft_delete_many(ids, company_id=int(company_id))
            else:
                deleted = self.repo.delete_many(ids, company_id=int(company_id))

            self._commit_or_flush()
            return True, f"Deleted {deleted} record(s).", {"deleted": deleted, "requested": len(ids)}

        except Exception as e:
            self._rollback_if_top_level()
            log.exception("bulk_delete failed: %s", e)
            return False, "Bulk delete failed.", {"deleted": 0, "requested": len(ids)}

    # ---------------- Query APIs ----------------
    def get_one(
        self,
        *,
        company_id: int,
        id: int,
        eager_load: Optional[List[str]] = None,
        public: bool = False,
    ) -> Optional[Dict[str, Any]]:
        obj = self.repo.get(int(id), company_id=int(company_id), eager_load=eager_load)
        if not obj:
            return None
        return self.serialize_public(obj) if public else self.serialize(obj)

    def list_page(
        self,
        *,
        company_id: int,
        page: int = 1,
        per_page: int = 20,
        eager_load: Optional[List[str]] = None,
        search: Optional[str] = None,
        search_columns: Optional[List[Any]] = None,
        filters: Optional[Dict[str, Any]] = None,
        allowed_filters: Optional[Dict[str, Any]] = None,
        sort_key: Optional[str] = None,
        sort_order: Optional[str] = None,
        sort_fields: Optional[Dict[str, Any]] = None,
        default_sort: Optional[List[Any]] = None,
        only_enabled: bool = False,
        public: bool = True,
    ) -> Dict[str, Any]:
        res: PageResult[T] = self.repo.paginate(
            page=page,
            per_page=per_page,
            company_id=int(company_id),
            eager_load=eager_load,
            search=search,
            search_columns=search_columns,
            filters=filters,
            allowed_filters=allowed_filters,
            sort_key=sort_key,
            sort_order=sort_order,
            sort_fields=sort_fields,
            default_sort=default_sort,
            only_enabled=only_enabled,
        )
        ser = self.serialize_public if public else self.serialize
        return {
            "items": [ser(x) for x in res.items],
            "total": res.total,
            "page": res.page,
            "per_page": res.per_page,
            "pages": res.pages,
        }

    def list_scroll(
        self,
        *,
        company_id: int,
        limit: int = 20,
        offset: int = 0,
        eager_load: Optional[List[str]] = None,
        search: Optional[str] = None,
        search_columns: Optional[List[Any]] = None,
        filters: Optional[Dict[str, Any]] = None,
        allowed_filters: Optional[Dict[str, Any]] = None,
        sort_key: Optional[str] = None,
        sort_order: Optional[str] = None,
        sort_fields: Optional[Dict[str, Any]] = None,
        default_sort: Optional[List[Any]] = None,
        only_enabled: bool = False,
        public: bool = True,
    ) -> Dict[str, Any]:
        limit = max(int(limit), 1)
        offset = max(int(offset), 0)

        items = self.repo.list(
            company_id=int(company_id),
            eager_load=eager_load,
            search=search,
            search_columns=search_columns,
            filters=filters,
            allowed_filters=allowed_filters,
            sort_key=sort_key,
            sort_order=sort_order,
            sort_fields=sort_fields,
            default_sort=default_sort,
            only_enabled=only_enabled,
            limit=limit,
            offset=offset,
        )

        ser = self.serialize_public if public else self.serialize
        return {
            "items": [ser(x) for x in items],
            "scroll": {
                "limit": limit,
                "offset": offset,
                "returned": len(items),
                "next_offset": offset + len(items),
                "has_more": len(items) == limit,
            },
        }
