from __future__ import annotations

import logging
from contextlib import contextmanager
from typing import Any, Dict, Generic, Optional, Tuple, Type, TypeVar, List

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository, PageResult
from cmcp.core.exceptions import BusinessValidationError, NotFoundError

log = logging.getLogger(__name__)
T = TypeVar("T")


class _UnsetType:
    pass


UNSET = _UnsetType()


class BaseService(Generic[T]):
    def __init__(self, model: Type[T], session: Optional[Session] = None, repo_cls: Type[BaseRepository] = BaseRepository):
        self.model = model
        self.s: Session = session or db.session
        self.repo: BaseRepository[T] = repo_cls(model, self.s)
        self._tenant_aware = hasattr(model, "company_id")

    @contextmanager
    def transaction(self):
        try:
            yield
            if not self.s.in_transaction():
                self.s.commit()
            else:
                self.s.flush()
        except Exception:
            if not self.s.in_transaction():
                self.s.rollback()
            raise

    # ---------- serialization ----------
    def serialize(self, obj: T) -> Dict[str, Any]:
        if not obj:
            return {}
        if hasattr(obj, "to_dict"):
            return obj.to_dict()
        if hasattr(obj, "as_dict"):
            return obj.as_dict()
        d = {}
        for k, v in getattr(obj, "__dict__", {}).items():
            if not k.startswith("_"):
                d[k] = v
        return d

    # ---------- CRUD ----------
    def create(self, *, company_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            payload = dict(data)
            if self._tenant_aware and "company_id" not in payload:
                payload["company_id"] = company_id

            with self.transaction():
                obj = self.repo.create(payload)

            return True, f"{self.model.__name__} created", {"id": getattr(obj, "id", None), "record": self.serialize(obj)}

        except BusinessValidationError as e:
            return False, str(e), None
        except IntegrityError:
            return False, "Database constraint error.", None
        except Exception as e:
            log.exception("create failed: %s", e)
            return False, "Unexpected error.", None

    def update(
        self,
        *,
        company_id: int,
        id: int,
        data: Dict[str, Any],
        allow_nulls: bool = True,
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.get(id, company_id=company_id)
            if not obj:
                raise NotFoundError(f"{self.model.__name__} not found.")

            payload = dict(data)

            with self.transaction():
                for k, v in payload.items():
                    if v is UNSET:
                        continue
                    if not hasattr(obj, k):
                        continue
                    if v is None and not allow_nulls:
                        continue
                    setattr(obj, k, v)
                self.s.flush([obj])

            return True, f"{self.model.__name__} updated", {"id": getattr(obj, "id", None), "record": self.serialize(obj)}

        except NotFoundError as e:
            return False, str(e), None
        except BusinessValidationError as e:
            return False, str(e), None
        except Exception as e:
            log.exception("update failed: %s", e)
            return False, "Unexpected error.", None

    def delete(self, *, company_id: int, id: int, soft: bool = True) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        try:
            obj = self.repo.get(id, company_id=company_id)
            if not obj:
                raise NotFoundError(f"{self.model.__name__} not found.")

            with self.transaction():
                if soft and hasattr(obj, "is_enabled"):
                    setattr(obj, "is_enabled", False)
                    self.s.flush([obj])
                else:
                    self.s.delete(obj)
                    self.s.flush()

            return True, f"{self.model.__name__} deleted", {"id": id}

        except NotFoundError as e:
            return False, str(e), None
        except Exception as e:
            log.exception("delete failed: %s", e)
            return False, "Unexpected error.", None

    def bulk_delete(self, *, company_id: int, ids: List[int], soft: bool = True) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ids = [int(x) for x in ids if x]
            if not ids:
                return True, "Nothing to delete.", {"deleted": 0, "requested": 0}

            with self.transaction():
                if soft:
                    deleted = self.repo.soft_delete_many(ids, company_id=company_id)
                else:
                    deleted = self.repo.delete_many(ids, company_id=company_id)

            return True, f"Deleted {deleted} record(s).", {"deleted": deleted, "requested": len(ids)}

        except Exception as e:
            log.exception("bulk_delete failed: %s", e)
            return False, "Bulk delete failed.", {"deleted": 0, "requested": len(ids or [])}

    # ---------- Query APIs ----------
    def get_one(self, *, company_id: int, id: int, eager_load: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        obj = self.repo.get(id, company_id=company_id, eager_load=eager_load)
        return self.serialize(obj) if obj else None

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
    ) -> Dict[str, Any]:
        res: PageResult[T] = self.repo.paginate(
            page=page,
            per_page=per_page,
            company_id=company_id,
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
        return {
            "items": [self.serialize(x) for x in res.items],
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
    ) -> Dict[str, Any]:
        limit = max(int(limit), 1)
        offset = max(int(offset), 0)

        items = self.repo.list(
            company_id=company_id,
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

        return {
            "items": [self.serialize(x) for x in items],
            "scroll": {
                "limit": limit,
                "offset": offset,
                "returned": len(items),
                "next_offset": offset + len(items),
                "has_more": len(items) == limit,
            },
        }
