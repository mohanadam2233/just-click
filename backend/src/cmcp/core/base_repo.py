# app/core/base_repo.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Generic, List, Optional, Sequence, Type, TypeVar

from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session, selectinload

from cmcp.config.database import db
from cmcp.core.query_utils import apply_filters, apply_search, apply_sort

T = TypeVar("T")


@dataclass
class PageResult(Generic[T]):
    items: List[T]
    total: int
    page: int
    per_page: int
    pages: int

@dataclass
class DropdownResult(Generic[T]):
    items: List[T]
    total: int
    offset: int
    limit: int

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], session: Optional[Session] = None):
        self.model = model
        self.s: Session = session or db.session

    # ---------- model capability checks ----------
    def _tenant_aware(self) -> bool:
        return hasattr(self.model, "company_id")

    def _has_enabled(self) -> bool:
        return hasattr(self.model, "is_enabled")

    def _apply_tenant(self, stmt, company_id: Optional[int]):
        if company_id is not None and self._tenant_aware():
            stmt = stmt.where(getattr(self.model, "company_id") == int(company_id))
        return stmt

    def _apply_enabled(self, stmt, only_enabled: bool):
        if only_enabled and self._has_enabled():
            stmt = stmt.where(getattr(self.model, "is_enabled").is_(True))
        return stmt

    def _apply_eager(self, stmt, eager_load: Optional[Sequence[str]]):
        if eager_load:
            for rel in eager_load:
                if hasattr(self.model, rel):
                    stmt = stmt.options(selectinload(getattr(self.model, rel)))
        return stmt

    # ---------- getters ----------
    def get(self, id: int, *, company_id: Optional[int] = None, eager_load: Optional[Sequence[str]] = None) -> Optional[T]:
        stmt = select(self.model).where(getattr(self.model, "id") == int(id))
        stmt = self._apply_tenant(stmt, company_id)
        stmt = self._apply_eager(stmt, eager_load)
        return self.s.scalar(stmt)

    def get_by(
        self,
        *,
        company_id: Optional[int] = None,
        only_enabled: bool = True,
        eager_load: Optional[Sequence[str]] = None,
        **filters: Any,
    ) -> Optional[T]:
        stmt = select(self.model).filter_by(**filters)
        stmt = self._apply_tenant(stmt, company_id)
        stmt = self._apply_enabled(stmt, only_enabled)
        stmt = self._apply_eager(stmt, eager_load)
        return self.s.scalar(stmt)

    # ---------- list/paginate ----------
    def list(
        self,
        *,
        company_id: Optional[int] = None,
        only_enabled: bool = True,
        eager_load: Optional[Sequence[str]] = None,
        search: Optional[str] = None,
        search_columns: Optional[Sequence[Any]] = None,
        filters: Optional[Dict[str, Any]] = None,
        allowed_filters: Optional[Dict[str, Any]] = None,
        sort_key: Optional[str] = None,
        sort_order: Optional[str] = None,
        sort_fields: Optional[Dict[str, Any]] = None,
        default_sort: Optional[List[Any]] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> List[T]:
        stmt = select(self.model)
        stmt = self._apply_tenant(stmt, company_id)
        stmt = self._apply_enabled(stmt, only_enabled)
        stmt = self._apply_eager(stmt, eager_load)

        stmt = apply_search(stmt, search_columns or [], search)
        stmt = apply_filters(stmt, filters=filters, allowed=allowed_filters)
        stmt = apply_sort(stmt, sort_key=sort_key, sort_order=sort_order, sort_fields=sort_fields or {}, default_sort=default_sort)

        if offset is not None:
            stmt = stmt.offset(int(offset))
        if limit is not None:
            stmt = stmt.limit(int(limit))

        return list(self.s.scalars(stmt).all())

    def paginate(
        self,
        *,
        page: int = 1,
        per_page: int = 20,
        company_id: Optional[int] = None,
        only_enabled: bool = True,
        eager_load: Optional[Sequence[str]] = None,
        search: Optional[str] = None,
        search_columns: Optional[Sequence[Any]] = None,
        filters: Optional[Dict[str, Any]] = None,
        allowed_filters: Optional[Dict[str, Any]] = None,
        sort_key: Optional[str] = None,
        sort_order: Optional[str] = None,
        sort_fields: Optional[Dict[str, Any]] = None,
        default_sort: Optional[List[Any]] = None,
    ) -> PageResult[T]:
        # enforce allowed per_page values (your rule)
        allowed = {10, 20, 50, 500}
        per_page = per_page if per_page in allowed else 20
        page = max(int(page), 1)

        # count
        count_stmt = select(func.count()).select_from(self.model)
        count_stmt = self._apply_tenant(count_stmt, company_id)
        count_stmt = self._apply_enabled(count_stmt, only_enabled)
        count_stmt = apply_search(count_stmt, search_columns or [], search)
        count_stmt = apply_filters(count_stmt, filters=filters, allowed=allowed_filters)
        total = int(self.s.scalar(count_stmt) or 0)

        pages = max((total + per_page - 1) // per_page, 1)
        if page > pages:
            page = pages

        offset = (page - 1) * per_page

        items = self.list(
            company_id=company_id,
            only_enabled=only_enabled,
            eager_load=eager_load,
            search=search,
            search_columns=search_columns,
            filters=filters,
            allowed_filters=allowed_filters,
            sort_key=sort_key,
            sort_order=sort_order,
            sort_fields=sort_fields,
            default_sort=default_sort,
            limit=per_page,
            offset=offset,
        )

        return PageResult(items=items, total=total, page=page, per_page=per_page, pages=pages)

    # ---------- create/update ----------
    def create(self, data: Dict[str, Any]) -> T:
        obj = self.model(**data)
        self.s.add(obj)
        self.s.flush([obj])
        return obj

    def create_many(self, items: List[Dict[str, Any]]) -> List[T]:
        objs = [self.model(**d) for d in items]
        self.s.add_all(objs)
        self.s.flush()
        return objs

    def update_many(self, ids: List[int], data: Dict[str, Any], *, company_id: Optional[int] = None) -> int:
        if not ids:
            return 0
        stmt = update(self.model).where(getattr(self.model, "id").in_([int(x) for x in ids]))
        stmt = self._apply_tenant(stmt, company_id)
        stmt = stmt.values(**data).execution_options(synchronize_session="fetch")
        res = self.s.execute(stmt)
        self.s.flush()
        return int(res.rowcount or 0)

    # ---------- delete (hard/soft) ----------
    def delete_many(self, ids: List[int], *, company_id: Optional[int] = None) -> int:
        if not ids:
            return 0
        stmt = delete(self.model).where(getattr(self.model, "id").in_([int(x) for x in ids]))
        stmt = self._apply_tenant(stmt, company_id)
        stmt = stmt.execution_options(synchronize_session="fetch")
        res = self.s.execute(stmt)
        self.s.flush()
        return int(res.rowcount or 0)

    def soft_delete_many(self, ids: List[int], *, company_id: Optional[int] = None) -> int:
        """
        ✅ FIXED: single UPDATE query (no N+1).
        """
        if not ids:
            return 0
        if not self._has_enabled():
            # if model doesn't support soft delete, hard delete instead
            return self.delete_many(ids, company_id=company_id)

        stmt = update(self.model).where(getattr(self.model, "id").in_([int(x) for x in ids]))
        stmt = self._apply_tenant(stmt, company_id)
        stmt = stmt.values(is_enabled=False).execution_options(synchronize_session="fetch")
        res = self.s.execute(stmt)
        self.s.flush()
        return int(res.rowcount or 0)
    # ---------- dropdown ----------
    def dropdown(
        self,
        *,
        company_id: Optional[int] = None,
        active_only: bool = True,
        eager_load: Optional[Sequence[str]] = None,
        search: Optional[str] = None,
        search_columns: Optional[Sequence[Any]] = None,
        filters: Optional[Dict[str, Any]] = None,
        allowed_filters: Optional[Dict[str, Any]] = None,
        sort_key: Optional[str] = None,
        sort_order: Optional[str] = None,
        sort_fields: Optional[Dict[str, Any]] = None,
        default_sort: Optional[List[Any]] = None,
        limit: int = 20,
        offset: int = 0,
        max_limit: int = 100,
    ) -> DropdownResult[T]:
        """
        Unified dropdown query:
          - limit/offset pagination
          - optional search + filters + sort (reuses query_utils)
          - tenant-aware + active_only (is_enabled) support
          - returns items + total for has_more calculation
        """
        limit = int(limit or 20)
        offset = int(offset or 0)
        limit = max(1, min(limit, int(max_limit)))
        offset = max(0, offset)

        # count
        count_stmt = select(func.count()).select_from(self.model)
        count_stmt = self._apply_tenant(count_stmt, company_id)
        count_stmt = self._apply_enabled(count_stmt, active_only)
        count_stmt = self._apply_eager(count_stmt, eager_load)

        count_stmt = apply_search(count_stmt, search_columns or [], search)
        count_stmt = apply_filters(count_stmt, filters=filters, allowed=allowed_filters)
        total = int(self.s.scalar(count_stmt) or 0)

        # data
        stmt = select(self.model)
        stmt = self._apply_tenant(stmt, company_id)
        stmt = self._apply_enabled(stmt, active_only)
        stmt = self._apply_eager(stmt, eager_load)

        stmt = apply_search(stmt, search_columns or [], search)
        stmt = apply_filters(stmt, filters=filters, allowed=allowed_filters)
        stmt = apply_sort(
            stmt,
            sort_key=sort_key,
            sort_order=sort_order,
            sort_fields=sort_fields or {},
            default_sort=default_sort,
        )

        stmt = stmt.offset(offset).limit(limit)
        items = list(self.s.scalars(stmt).all())

        return DropdownResult(items=items, total=total, offset=offset, limit=limit)