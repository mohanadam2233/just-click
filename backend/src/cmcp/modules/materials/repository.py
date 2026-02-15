# src/cmcp/modules/materials/repository.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Any, Dict, Tuple, List
from flask import g
from sqlalchemy import exists, func, select, and_
from sqlalchemy.orm import Session

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository

from cmcp.modules.materials.models import Material, StudentMaterialInteraction
from cmcp.modules.academic.models import Course, Chapter, Semester, AcademicYear, Department
@dataclass
class MaterialListRow:
    material_id: int
    title: str
    description: Optional[str]
    material_type: str
    file_url: Optional[str]
    file_size_mb: Optional[float]
    page_count: Optional[int]
    slide_count: Optional[int]
    is_enabled: bool
    is_downloadable: bool
    created_at: Any
    updated_at: Any

    # stats
    view_count: int
    download_count: int

    # context
    course_id: int
    course_title: str
    course_code: Optional[str]

    chapter_id: Optional[int]
    chapter_title: Optional[str]
    chapter_number: Optional[int]

    semester_id: Optional[int]
    semester_number: Optional[int]
    semester_name: Optional[str]

    academic_year_id: Optional[int]
    academic_year_name: Optional[str]

    department_id: Optional[int]
    department_name: Optional[str]

    # user state
    is_favorite: bool
    user_view_count: int
    user_download_count: int
    last_viewed_at: Optional[Any]
    last_downloaded_at: Optional[Any]

MaterialDetailRow = MaterialListRow  # same fields works for detail


class MaterialsRepo:
    def __init__(self, session: Optional[Session] = None):
        self.s: Session = session or db.session
        self.materials = BaseRepository(Material, self.s)
    # ----------------------------
    # helpers
    # ----------------------------

    def _current_user_id(self) -> Optional[int]:
        ctx = getattr(g, "auth", None)
        uid = getattr(ctx, "user_id", None) if ctx else None
        try:
            return int(uid) if uid is not None else None
        except Exception:
            return None
    def course_exists(self, *, company_id: int, course_id: int) -> bool:
        stmt = select(exists().where(
            Course.company_id == int(company_id),
            Course.id == int(course_id),
        ))
        return bool(self.s.scalar(stmt))

    def chapter_get(self, *, company_id: int, chapter_id: int) -> Optional[Chapter]:
        return self.s.query(Chapter).filter(
            Chapter.company_id == int(company_id),
            Chapter.id == int(chapter_id),
        ).first()

    def title_exists_in_scope(
        self,
        *,
        company_id: int,
        course_id: int,
        chapter_id: Optional[int],
        title: str,
        exclude_id: Optional[int] = None,
    ) -> bool:
        conds = [
            Material.company_id == int(company_id),
            Material.course_id == int(course_id),
            Material.chapter_id.is_(None) if chapter_id is None else (Material.chapter_id == int(chapter_id)),
            func.lower(Material.title) == func.lower(title.strip()),
        ]
        if exclude_id:
            conds.append(Material.id != int(exclude_id))
        stmt = select(exists().where(*conds))
        return bool(self.s.scalar(stmt))

    def chapter_belongs_to_course(self, *, company_id: int, chapter_id: int, course_id: int) -> bool:
        ch = self.chapter_get(company_id=company_id, chapter_id=chapter_id)
        if not ch:
            return False
        return int(ch.course_id) == int(course_id)
    def has_interactions(self, *, company_id: int, material_id: int) -> bool:
        stmt = select(exists().where(
            StudentMaterialInteraction.company_id == int(company_id),
            StudentMaterialInteraction.material_id == int(material_id),
        ))
        return bool(self.s.scalar(stmt))
    # ----------------------------
    # list/detail query builder
    # ----------------------------

    def _base_stmt(self, *, company_id: int, filters: Dict[str, Any], is_enabled: Optional[bool]):
        uid = self._current_user_id() or 0  # if not logged in, user_state = defaults

        # user interaction subquery
        ui = (
            select(
                StudentMaterialInteraction.material_id.label("m_id"),
                func.coalesce(StudentMaterialInteraction.is_favorite, False).label("is_favorite"),
                func.coalesce(StudentMaterialInteraction.view_count, 0).label("u_view_count"),
                func.coalesce(StudentMaterialInteraction.download_count, 0).label("u_download_count"),
                StudentMaterialInteraction.last_viewed_at.label("last_viewed_at"),
                StudentMaterialInteraction.last_downloaded_at.label("last_downloaded_at"),
            )
            .where(
                StudentMaterialInteraction.company_id == int(company_id),
                StudentMaterialInteraction.user_id == int(uid),
            )
            .subquery("ui")
        )

        # stats: prefer Material.view_count/download_count if exist, else SUM from interactions
        has_mat_view = hasattr(Material, "view_count")
        has_mat_down = hasattr(Material, "download_count")

        if has_mat_view and has_mat_down:
            view_expr = func.coalesce(getattr(Material, "view_count"), 0)
            down_expr = func.coalesce(getattr(Material, "download_count"), 0)
        else:
            agg = (
                select(
                    StudentMaterialInteraction.material_id.label("m_id"),
                    func.coalesce(func.sum(StudentMaterialInteraction.view_count), 0).label("view_count"),
                    func.coalesce(func.sum(StudentMaterialInteraction.download_count), 0).label("download_count"),
                )
                .where(StudentMaterialInteraction.company_id == int(company_id))
                .group_by(StudentMaterialInteraction.material_id)
                .subquery("agg")
            )
            view_expr = func.coalesce(agg.c.view_count, 0)
            down_expr = func.coalesce(agg.c.download_count, 0)

        stmt = (
            select(
                Material.id.label("material_id"),
                Material.title.label("title"),
                Material.description.label("description"),
                Material.material_type.label("material_type"),
                Material.file_url.label("file_url"),
                Material.file_size_mb.label("file_size_mb"),
                Material.page_count.label("page_count"),
                Material.slide_count.label("slide_count"),
                Material.is_enabled.label("is_enabled"),
                Material.is_downloadable.label("is_downloadable"),
                Material.created_at.label("created_at"),
                Material.updated_at.label("updated_at"),

                view_expr.label("view_count"),
                down_expr.label("download_count"),

                Course.id.label("course_id"),
                Course.title.label("course_title"),
                Course.code.label("course_code"),

                Chapter.id.label("chapter_id"),
                Chapter.title.label("chapter_title"),
                Chapter.number.label("chapter_number"),

                Semester.id.label("semester_id"),
                Semester.number.label("semester_number"),
                Semester.name.label("semester_name"),

                AcademicYear.id.label("academic_year_id"),
                AcademicYear.name.label("academic_year_name"),

                Department.id.label("department_id"),
                Department.name.label("department_name"),

                func.coalesce(ui.c.is_favorite, False).label("is_favorite"),
                func.coalesce(ui.c.u_view_count, 0).label("user_view_count"),
                func.coalesce(ui.c.u_download_count, 0).label("user_download_count"),
                ui.c.last_viewed_at.label("last_viewed_at"),
                ui.c.last_downloaded_at.label("last_downloaded_at"),
            )
            .select_from(Material)
            .join(Course, and_(Course.id == Material.course_id, Course.company_id == int(company_id)))
            .outerjoin(Chapter, and_(Chapter.id == Material.chapter_id, Chapter.company_id == int(company_id)))
            .outerjoin(Semester, Semester.id == Course.semester_id)
            .outerjoin(AcademicYear, AcademicYear.id == Semester.academic_year_id)
            .outerjoin(Department, Department.id == Course.department_id)
            .outerjoin(ui, ui.c.m_id == Material.id)
            .where(Material.company_id == int(company_id))
        )

        # enabled filter
        if is_enabled is True:
            stmt = stmt.where(Material.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(Material.is_enabled.is_(False))

        # filters
        if filters.get("course_id"):
            stmt = stmt.where(Material.course_id == int(filters["course_id"]))
        if filters.get("chapter_id"):
            stmt = stmt.where(Material.chapter_id == int(filters["chapter_id"]))
        if filters.get("material_type"):
            stmt = stmt.where(
                func.lower(func.cast(Material.material_type, db.String)) == filters["material_type"].lower())

        # course-derived filters
        if filters.get("semester_id"):
            stmt = stmt.where(Course.semester_id == int(filters["semester_id"]))
        if filters.get("department_id"):
            stmt = stmt.where(Course.department_id == int(filters["department_id"]))
        if filters.get("academic_year_id"):
            stmt = stmt.where(Semester.academic_year_id == int(filters["academic_year_id"]))

        # search
        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(Material.title, "")).like(like)
                | func.lower(func.coalesce(Material.description, "")).like(like)
            )

        return stmt

    # ----------------------------
    # LIST cursor (descending id)
    # ----------------------------

    def list_materials_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            last_id: Optional[int],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[MaterialListRow], int, bool]:
        base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        # cursor condition
        if last_id:
            base = base.where(Material.id < int(last_id))

        base = base.order_by(Material.id.desc()).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        # count for UI meta
        count_stmt = select(func.count()).select_from(Material).where(Material.company_id == int(company_id))
        # apply same filter conditions to count (simple ones only; keep aligned with base)
        if is_enabled is True:
            count_stmt = count_stmt.where(Material.is_enabled.is_(True))
        elif is_enabled is False:
            count_stmt = count_stmt.where(Material.is_enabled.is_(False))
        if filters.get("course_id"):
            count_stmt = count_stmt.where(Material.course_id == int(filters["course_id"]))
        if filters.get("chapter_id"):
            count_stmt = count_stmt.where(Material.chapter_id == int(filters["chapter_id"]))
        if filters.get("material_type"):
            count_stmt = count_stmt.where(
                func.lower(func.cast(Material.material_type, db.String)) == filters["material_type"].lower())
        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [MaterialListRow(**r._asdict()) for r in rows]
        return shaped, total, has_more

    # ----------------------------
    # LIST page
    # ----------------------------

    def list_materials_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[MaterialListRow], int, int]:
        base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        # count (subquery)
        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)
        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = base.order_by(Material.id.desc()).offset(offset).limit(per_page)
        rows = list(self.s.execute(base).all())
        shaped = [MaterialListRow(**r._asdict()) for r in rows]
        return shaped, total, pages

        # ----------------------------
        # DETAIL
        # ----------------------------

    def get_material_detail(self, *, company_id: int, material_id: int) -> Optional[MaterialDetailRow]:
        base = self._base_stmt(company_id=company_id, filters={}, is_enabled=None)
        base = base.where(Material.id == int(material_id)).limit(1)
        row = self.s.execute(base).first()
        if not row:
            return None
        return MaterialDetailRow(**row._asdict())

    # ----------------------------
    # response shaping
    # ----------------------------

    def _file_extension_from_url(self, file_url: Optional[str]) -> Optional[str]:
        if not file_url:
            return None
        # If file_url is our /api/media/file/<key> we can extract extension from ".../file.<ext>.enc"
        # fallback: try from URL path
        parts = file_url.split("/")
        last = parts[-1] if parts else ""
        if ".enc" in last and "file" in last:
            # file.pptx.enc -> pptx
            base = last.replace(".enc", "")
            if "." in base:
                return base.rsplit(".", 1)[-1].lower()
        if "." in last:
            return last.rsplit(".", 1)[-1].lower()
        return None

    def shape_material_list_row(self, r: MaterialListRow, *, external_base: str) -> Dict[str, Any]:
        ext = self._file_extension_from_url(r.file_url)

        return {
            "id": int(r.material_id),
            "title": r.title,
            "material_type": str(r.material_type).lower() if r.material_type else None,
            "description": r.description,

            "file": {
                "url": r.file_url,
                "extension": ext,
                "size_mb": float(r.file_size_mb) if r.file_size_mb is not None else None,
                "page_count": int(r.page_count) if r.page_count is not None else None,
                "slide_count": int(r.slide_count) if r.slide_count is not None else None,
            },

            "flags": {
                "is_enabled": bool(r.is_enabled),
                "is_downloadable": bool(r.is_downloadable),
            },

            "stats": {
                "view_count": int(r.view_count or 0),
                "download_count": int(r.download_count or 0),
            },

            "context": {
                "academic_year": (
                    {"id": int(r.academic_year_id), "name": r.academic_year_name}
                    if r.academic_year_id else None
                ),
                "semester": (
                    {"id": int(r.semester_id), "number": r.semester_number, "name": r.semester_name}
                    if r.semester_id else None
                ),
                "department": (
                    {"id": int(r.department_id), "name": r.department_name}
                    if r.department_id else None
                ),
                "course": {
                    "id": int(r.course_id),
                    "title": r.course_title,
                    "code": r.course_code,
                },
                "chapter": (
                    {"id": int(r.chapter_id), "number": r.chapter_number, "title": r.chapter_title}
                    if r.chapter_id else None
                ),
            },

            "user_state": {
                "is_favorite": bool(r.is_favorite),
                "view_count": int(r.user_view_count or 0),
                "download_count": int(r.user_download_count or 0),
                "last_viewed_at": r.last_viewed_at.isoformat() if r.last_viewed_at else None,
                "last_downloaded_at": r.last_downloaded_at.isoformat() if r.last_downloaded_at else None,
            },

            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }

    def shape_material_detail_row(self, r: MaterialDetailRow, *, external_base: str) -> Dict[str, Any]:
        out = self.shape_material_list_row(r, external_base=external_base)

        # detail should include learning_objectives if Material has it; if not, keep None
        # We don’t have it in row dataclass, so pull from DB quickly (still company scoped).
        # (You can optimize later by including it in the SELECT if you want.)
        mat = self.s.query(Material).filter(
            Material.company_id == int(getattr(g, "auth").active_company_id),
            Material.id == int(r.material_id),
        ).first()

        if mat is not None and hasattr(mat, "learning_objectives"):
            out["learning_objectives"] = getattr(mat, "learning_objectives") or []
        else:
            out["learning_objectives"] = []

        return out