# cmcp/core/base_service.py
from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any, Dict, Generic, Optional, Tuple, Type, TypeVar, List, Iterable, Callable, Literal

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import inspect as sa_inspect, Select

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository, PageResult, DropdownResult
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.common.date_utils import format_date_out

log = logging.getLogger(__name__)
T = TypeVar("T")

TxMode = Literal["service", "external"]  # ✅ service commits; external only flushes


class _UnsetType:
    pass


UNSET = _UnsetType()


def _pick(d: Dict[str, Any], keys: Iterable[str]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for k in keys:
        if k in d and d[k] is not None:
            out[k] = d[k]
    return out


def _safe_scalar_attr(obj: Any, key: str) -> Any:
    """
    Avoid triggering lazy-load on expired attributes inside tricky tx states.
    We only read columns that are already present on the instance.
    """
    try:
        state = sa_inspect(obj)
        # if attribute is expired and not loaded, reading it can trigger DB IO
        if key in getattr(state, "expired_attributes", set()):
            # Return None instead of triggering IO.
            # (You can also choose to return the PK always.)
            return None
    except Exception:
        pass
    try:
        return getattr(obj, key)
    except Exception:
        return None
class BaseService(Generic[T]):
    """
    Generic service:
      - Tx mode is configurable:
          tx_mode="service"  -> commits/rollbacks here (old behavior)
          tx_mode="external" -> only flush; caller commits/rollbacks (your blueprint style)
      - strict company scoping
      - small response payload support
      - date-only formatting via format_date_out
    """

    def __init__(
            self,
            model: Type[T],
            session: Optional[Session] = None,
            repo_cls: Type[BaseRepository] = BaseRepository,
            *,
            public_fields: Optional[List[str]] = None,
            tx_mode: TxMode = "service",  # ✅ default keeps old behavior
            expire_on_commit_safe: bool = True,  # we avoid lazy loads in serialization
    ):
        self.model = model
        self.s: Session = session or db.session
        self.repo: BaseRepository[T] = repo_cls(model, self.s)
        self._tenant_aware = hasattr(model, "company_id")
        self.public_fields = public_fields or ["id", "name", "code", "title"]
        self.tx_mode: TxMode = tx_mode
        self.expire_on_commit_safe = bool(expire_on_commit_safe)
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
        """
        ✅ Backwards compatible:
        - tx_mode="service": commits at top-level, flushes in nested
        - tx_mode="external": always flush (caller commits)
        """
        if self.tx_mode == "external":
            self.s.flush()
            return

        # old behavior:
        if self._in_nested_tx:
            self.s.flush()
        else:
            self.s.commit()

    def _rollback_if_needed(self) -> None:
        """
        ✅ Backwards compatible:
        - tx_mode="service": rollback only if top-level (old behavior)
        - tx_mode="external": rollback (caller may also rollback, but rollback is idempotent)
        """
        try:
            if self.tx_mode == "external":
                self.s.rollback()
                return
            if self._in_nested_tx:
                return
            self.s.rollback()
        except Exception:
            pass

    # ---------------- Serialization ----------------
    def _format_value(self, v: Any) -> Any:
        # Convert datetime/date to DD-MM-YYYY
        if isinstance(v, (datetime, date)):
            return format_date_out(v)
        return v

    def serialize(self, obj: T, *, only: Optional[List[str]] = None) -> Dict[str, Any]:
        if not obj:
            return {}

        # Prefer safe column-only serialization (prevents lazy-load surprises)
        if self.expire_on_commit_safe:
            mapper = sa_inspect(obj.__class__)
            data: Dict[str, Any] = {}
            # columns only
            for col in mapper.columns:
                name = col.key
                val = _safe_scalar_attr(obj, name)
                data[name] = self._format_value(val)
            return _pick(data, only) if only else data

        # fallback to your model's to_dict/as_dict
        if hasattr(obj, "to_dict"):
            d = obj.to_dict()
        elif hasattr(obj, "as_dict"):
            d = obj.as_dict()
        else:
            d = {k: v for k, v in getattr(obj, "__dict__", {}).items() if not k.startswith("_")}

        for k in list(d.keys()):
            d[k] = self._format_value(d[k])

        return _pick(d, only) if only else d

    def serialize_public(self, obj: T) -> Dict[str, Any]:
        full = self.serialize(obj)

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
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error.", None
        except Exception as e:
            self._rollback_if_needed()
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
            self._rollback_if_needed()
            return False, str(e), None
        except BusinessValidationError as e:
            self._rollback_if_needed()
            return False, str(e), None
        except IntegrityError:
            self._rollback_if_needed()
            return False, "Database constraint error.", None
        except Exception as e:
            self._rollback_if_needed()
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
            self._rollback_if_needed()
            return False, str(e), None
        except Exception as e:
            self._rollback_if_needed()
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
            self._rollback_if_needed()
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

    # ---------------- Dropdown (limit/offset) ----------------
    def dropdown(
            self,
            *,
            company_id: int,
            search: Optional[str] = None,
            limit: int = 20,
            offset: int = 0,
            active_only: bool = True,
            eager_load: Optional[List[str]] = None,
            search_columns: Optional[List[Any]] = None,
            filters: Optional[Dict[str, Any]] = None,
            allowed_filters: Optional[Dict[str, Any]] = None,
            sort_key: Optional[str] = None,
            sort_order: Optional[str] = None,
            sort_fields: Optional[Dict[str, Any]] = None,
            default_sort: Optional[List[Any]] = None,
            # mapping config (module controls it)
            value_field: str = "id",
            label_field: Optional[str] = None,  # simple single field
            label_fields: Optional[List[str]] = None,  # join with " - "
            label_getter: Optional[Callable[[T], str]] = None,  # full override
            meta_fields: Optional[List[str]] = None,
            strict_label: bool = False,  # if True: no fallback name/title
            max_limit: int = 100,
            # ✅ NEW: pass-through hooks to BaseRepository.dropdown
            extra_where: Optional[Iterable[Any]] = None,
            base_stmt: Optional[Select] = None,
            count_from: Optional[Any] = None,
    ) -> Dict[str, Any]:
        res: DropdownResult[T] = self.repo.dropdown(
            company_id=int(company_id),
            active_only=bool(active_only),
            eager_load=eager_load,
            search=search,
            search_columns=search_columns,
            filters=filters,
            allowed_filters=allowed_filters,
            sort_key=sort_key,
            sort_order=sort_order,
            sort_fields=sort_fields,
            default_sort=default_sort,
            limit=limit,
            offset=offset,
            max_limit=max_limit,
            # ✅ pass-through
            extra_where=extra_where,
            base_stmt=base_stmt,
            count_from=count_from,
        )

        def _label(obj: T) -> str:
            # 1) full override
            if label_getter:
                return (label_getter(obj) or "").strip()

            # 2) single field
            if label_field:
                v = getattr(obj, label_field, None)
                return (str(v).strip() if v is not None else "")

            # 3) multi-field join
            if label_fields:
                parts: List[str] = []
                for f in label_fields:
                    v = getattr(obj, f, None)
                    if v is None:
                        continue
                    s = str(v).strip()
                    if s:
                        parts.append(s)
                if parts:
                    return " - ".join(parts)

            # 4) fallback (optional)
            if strict_label:
                v = getattr(obj, value_field, None)
                return str(v) if v is not None else ""

            nm = getattr(obj, "name", None)
            if nm:
                return str(nm).strip()
            tt = getattr(obj, "title", None)
            if tt:
                return str(tt).strip()

            v = getattr(obj, value_field, None)
            return str(v) if v is not None else ""

        data_out: List[Dict[str, Any]] = []
        for obj in res.items:
            value = getattr(obj, value_field, None)
            item: Dict[str, Any] = {"value": value, "label": _label(obj)}

            if meta_fields:
                meta = self.serialize(obj, only=meta_fields)
                # normalize is_active if model uses is_enabled
                if "is_enabled" in meta and "is_active" not in meta:
                    meta["is_active"] = bool(meta.get("is_enabled"))
                item["meta"] = meta
            else:
                item["meta"] = {}

            data_out.append(item)

        has_more = (int(res.offset) + int(res.limit)) < int(res.total)

        return {
            "data": data_out,
            "pagination": {
                "offset": int(res.offset),
                "limit": int(res.limit),
                "total": int(res.total),
                "has_more": bool(has_more),
            },
        }