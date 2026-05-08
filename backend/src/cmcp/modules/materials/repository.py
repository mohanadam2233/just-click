# # src/cmcp/modules/materials/repository.py
# from __future__ import annotations
#
# import logging
# from dataclasses import dataclass
#
#
# from typing import Optional, Any, Dict, Tuple, List
# from flask import g
# from sqlalchemy import exists, func, select, and_, case, literal, update, or_
# from sqlalchemy.orm import Session
# from datetime import datetime, timezone, timedelta
# from sqlalchemy import update, or_ as sa_or
# from sqlalchemy.dialects.postgresql import insert as pg_insert
# from cmcp.config.database import db
# from cmcp.core.base_repo import BaseRepository
#
# from cmcp.modules.materials.models import Material, StudentMaterialInteraction
# from cmcp.modules.academic.models import Course, Chapter, Semester, AcademicYear, Department
# from cmcp.modules.education_people.models import StudentProfile, StaffProfile
# log = logging.getLogger(__name__)
# @dataclass
# class MaterialListRow:
#     material_id: int
#     title: str
#     description: Optional[str]
#     material_type: str
#     file_url: Optional[str]
#     file_size_mb: Optional[float]
#     page_count: Optional[int]
#     slide_count: Optional[int]
#     is_enabled: bool
#     is_downloadable: bool
#     created_at: Any
#     updated_at: Any
#
#     # stats
#     view_count: int
#     download_count: int
#
#     # context
#     course_id: int
#     course_title: str
#     course_code: Optional[str]
#
#     chapter_id: Optional[int]
#     chapter_title: Optional[str]
#     chapter_number: Optional[int]
#
#     semester_id: Optional[int]
#     semester_number: Optional[int]
#     semester_name: Optional[str]
#
#     academic_year_id: Optional[int]
#     academic_year_name: Optional[str]
#
#     department_id: Optional[int]
#     department_name: Optional[str]
#
#     # user state
#     is_favorite: bool
#     user_view_count: int
#     user_download_count: int
#     last_viewed_at: Optional[Any]
#     last_downloaded_at: Optional[Any]
#     # internal sort helpers (not exposed in API shape)
#     sort_semester_number: Optional[int] = None
#     sort_semester_priority: Optional[int] = None
#
# MaterialDetailRow = MaterialListRow  # same fields works for detail
#
#
# class MaterialsRepo:
#     def __init__(self, session: Optional[Session] = None):
#         self.s: Session = session or db.session
#         self.materials = BaseRepository(Material, self.s)
#     # ----------------------------
#     # helpers
#     # ----------------------------
#
#     def _current_user_id(self) -> Optional[int]:
#         ctx = getattr(g, "auth", None)
#         uid = getattr(ctx, "user_id", None) if ctx else None
#         try:
#             return int(uid) if uid is not None else None
#         except Exception:
#             return None
#     def course_exists(self, *, company_id: int, course_id: int) -> bool:
#         stmt = select(exists().where(
#             Course.company_id == int(company_id),
#             Course.id == int(course_id),
#         ))
#         return bool(self.s.scalar(stmt))
#
#     def chapter_get(self, *, company_id: int, chapter_id: int) -> Optional[Chapter]:
#         return self.s.query(Chapter).filter(
#             Chapter.company_id == int(company_id),
#             Chapter.id == int(chapter_id),
#         ).first()
#
#     def title_exists_in_scope(
#         self,
#         *,
#         company_id: int,
#         course_id: int,
#         chapter_id: Optional[int],
#         title: str,
#         exclude_id: Optional[int] = None,
#     ) -> bool:
#         conds = [
#             Material.company_id == int(company_id),
#             Material.course_id == int(course_id),
#             Material.chapter_id.is_(None) if chapter_id is None else (Material.chapter_id == int(chapter_id)),
#             func.lower(Material.title) == func.lower(title.strip()),
#         ]
#         if exclude_id:
#             conds.append(Material.id != int(exclude_id))
#         stmt = select(exists().where(*conds))
#         return bool(self.s.scalar(stmt))
#
#     def chapter_belongs_to_course(self, *, company_id: int, chapter_id: int, course_id: int) -> bool:
#         ch = self.chapter_get(company_id=company_id, chapter_id=chapter_id)
#         if not ch:
#             return False
#         return int(ch.course_id) == int(course_id)
#     def has_interactions(self, *, company_id: int, material_id: int) -> bool:
#         stmt = select(exists().where(
#             StudentMaterialInteraction.company_id == int(company_id),
#             StudentMaterialInteraction.material_id == int(material_id),
#         ))
#         return bool(self.s.scalar(stmt))
#
#     def _current_user_scope(self, *, company_id: int) -> Dict[str, Any]:
#         uid = self._current_user_id()
#         out = {
#             "user_id": int(uid) if uid is not None else None,
#             "profile_type": None,  # "student" | "staff" | None
#             "department_id": None,
#             "faculty_id": None,
#             "semester_id": None,
#             "semester_number": None,
#         }
#
#
#
#         if uid is None:
#
#             return out
#
#         # Student first
#         sp = (
#             self.s.query(
#                 StudentProfile.department_id.label("department_id"),
#                 StudentProfile.faculty_id.label("faculty_id"),
#                 StudentProfile.semester_id.label("semester_id"),
#                 Semester.number.label("semester_number"),
#             )
#             .outerjoin(
#                 Semester,
#                 and_(
#                     Semester.id == StudentProfile.semester_id,
#                     Semester.company_id == int(company_id),
#                 ),
#             )
#             .filter(
#                 StudentProfile.company_id == int(company_id),
#                 StudentProfile.user_id == int(uid),
#                 StudentProfile.is_enabled.is_(True),
#             )
#             .first()
#         )
#
#         if sp:
#             out.update({
#                 "profile_type": "student",
#                 "department_id": int(sp.department_id) if sp.department_id else None,
#                 "faculty_id": int(sp.faculty_id) if sp.faculty_id else None,
#                 "semester_id": int(sp.semester_id) if sp.semester_id else None,
#                 "semester_number": int(sp.semester_number) if sp.semester_number else None,
#             })
#
#             return out
#
#         # Staff fallback
#         st = (
#             self.s.query(
#                 StaffProfile.department_id.label("department_id"),
#                 StaffProfile.faculty_id.label("faculty_id"),
#             )
#             .filter(
#                 StaffProfile.company_id == int(company_id),
#                 StaffProfile.user_id == int(uid),
#                 StaffProfile.is_enabled.is_(True),
#             )
#             .first()
#         )
#
#
#         if st:
#             out.update({
#                 "profile_type": "staff",
#                 "department_id": int(st.department_id) if st.department_id else None,
#                 "faculty_id": int(st.faculty_id) if st.faculty_id else None,
#                 "semester_id": None,
#                 "semester_number": None,
#             })
#             log.info("[materials.scope] resolved staff scope=%s", out)
#             return out
#
#         return out
#     # ----------------------------
#     # list/detail query builder
#     # ----------------------------
#     def _semester_priority_expr(self, current_semester_number: Optional[int]):
#         if not current_semester_number:
#             return None
#
#         current_semester_number = int(current_semester_number)
#
#         return case(
#             (
#                 Semester.number >= current_semester_number,
#                 Semester.number - current_semester_number,
#             ),
#             else_=(1000 + Semester.number - current_semester_number),
#         )
#
#     def _use_semester_priority(self, *, scope: Dict[str, Any], filters: Dict[str, Any]) -> bool:
#         enabled = True
#
#         if scope.get("profile_type") != "student":
#             enabled = False
#         elif not scope.get("semester_number"):
#             enabled = False
#         elif filters.get("semester_id") or filters.get("course_id") or filters.get("chapter_id"):
#             enabled = False
#
#
#         return enabled
#
#     def _apply_list_ordering(self, stmt, *, scope: Dict[str, Any], filters: Dict[str, Any]):
#         if self._use_semester_priority(scope=scope, filters=filters):
#             sem_priority = self._semester_priority_expr(scope.get("semester_number"))
#
#             return stmt.order_by(
#                 sem_priority.asc(),
#                 func.coalesce(Semester.number, 0).asc(),
#                 Material.id.desc(),
#             )
#
#
#         return stmt.order_by(Material.id.desc())
#
#     def _apply_cursor_boundary(
#             self,
#             stmt,
#             *,
#             scope: Dict[str, Any],
#             filters: Dict[str, Any],
#             last_id: Optional[int],
#             last_priority: Optional[int],
#             last_semester_number: Optional[int],
#     ):
#
#
#         if not last_id:
#
#             return stmt
#
#         if self._use_semester_priority(scope=scope, filters=filters):
#             if last_priority is None or last_semester_number is None:
#
#                 return stmt
#
#             sem_priority = self._semester_priority_expr(scope.get("semester_number"))
#             sem_num = func.coalesce(Semester.number, 0)
#
#
#             return stmt.where(
#                 or_(
#                     sem_priority > int(last_priority),
#                     and_(
#                         sem_priority == int(last_priority),
#                         sem_num > int(last_semester_number),
#                     ),
#                     and_(
#                         sem_priority == int(last_priority),
#                         sem_num == int(last_semester_number),
#                         Material.id < int(last_id),
#                     ),
#                 )
#             )
#
#
#         return stmt.where(Material.id < int(last_id))
#
#     def _base_stmt(self, *, company_id: int, filters: Dict[str, Any], is_enabled: Optional[bool]):
#         uid = self._current_user_id() or 0
#         scope = self._current_user_scope(company_id=company_id)
#
#         use_sem_priority = self._use_semester_priority(scope=scope, filters=filters)
#         sem_priority_expr = self._semester_priority_expr(scope.get("semester_number")) if use_sem_priority else None
#
#
#
#         ui = (
#             select(
#                 StudentMaterialInteraction.material_id.label("m_id"),
#                 func.coalesce(StudentMaterialInteraction.is_favorite, False).label("is_favorite"),
#                 func.coalesce(StudentMaterialInteraction.view_count, 0).label("u_view_count"),
#                 func.coalesce(StudentMaterialInteraction.download_count, 0).label("u_download_count"),
#                 StudentMaterialInteraction.last_viewed_at.label("last_viewed_at"),
#                 StudentMaterialInteraction.last_downloaded_at.label("last_downloaded_at"),
#             )
#             .where(
#                 StudentMaterialInteraction.company_id == int(company_id),
#                 StudentMaterialInteraction.user_id == int(uid),
#             )
#             .subquery("ui")
#         )
#
#         has_mat_view = hasattr(Material, "view_count")
#         has_mat_down = hasattr(Material, "download_count")
#
#         if has_mat_view and has_mat_down:
#             view_expr = func.coalesce(getattr(Material, "view_count"), 0)
#             down_expr = func.coalesce(getattr(Material, "download_count"), 0)
#         else:
#             agg = (
#                 select(
#                     StudentMaterialInteraction.material_id.label("m_id"),
#                     func.coalesce(func.sum(StudentMaterialInteraction.view_count), 0).label("view_count"),
#                     func.coalesce(func.sum(StudentMaterialInteraction.download_count), 0).label("download_count"),
#                 )
#                 .where(StudentMaterialInteraction.company_id == int(company_id))
#                 .group_by(StudentMaterialInteraction.material_id)
#                 .subquery("agg")
#             )
#             view_expr = func.coalesce(agg.c.view_count, 0)
#             down_expr = func.coalesce(agg.c.download_count, 0)
#
#         stmt = (
#             select(
#                 Material.id.label("material_id"),
#                 Material.title.label("title"),
#                 Material.description.label("description"),
#                 Material.material_type.label("material_type"),
#                 Material.file_url.label("file_url"),
#                 Material.file_size_mb.label("file_size_mb"),
#                 Material.page_count.label("page_count"),
#                 Material.slide_count.label("slide_count"),
#                 Material.is_enabled.label("is_enabled"),
#                 Material.is_downloadable.label("is_downloadable"),
#                 Material.created_at.label("created_at"),
#                 Material.updated_at.label("updated_at"),
#
#                 view_expr.label("view_count"),
#                 down_expr.label("download_count"),
#
#                 Course.id.label("course_id"),
#                 Course.title.label("course_title"),
#                 Course.code.label("course_code"),
#
#                 Chapter.id.label("chapter_id"),
#                 Chapter.title.label("chapter_title"),
#                 Chapter.number.label("chapter_number"),
#
#                 Semester.id.label("semester_id"),
#                 Semester.number.label("semester_number"),
#                 Semester.name.label("semester_name"),
#
#                 AcademicYear.id.label("academic_year_id"),
#                 AcademicYear.name.label("academic_year_name"),
#
#                 Department.id.label("department_id"),
#                 Department.name.label("department_name"),
#
#                 func.coalesce(ui.c.is_favorite, False).label("is_favorite"),
#                 func.coalesce(ui.c.u_view_count, 0).label("user_view_count"),
#                 func.coalesce(ui.c.u_download_count, 0).label("user_download_count"),
#                 ui.c.last_viewed_at.label("last_viewed_at"),
#                 ui.c.last_downloaded_at.label("last_downloaded_at"),
#
#                 func.coalesce(Semester.number, 0).label("sort_semester_number"),
#                 (
#                     sem_priority_expr.label("sort_semester_priority")
#                     if sem_priority_expr is not None
#                     else literal(None).label("sort_semester_priority")
#                 ),
#             )
#             .select_from(Material)
#             .join(Course, and_(Course.id == Material.course_id, Course.company_id == int(company_id)))
#             .outerjoin(Chapter, and_(Chapter.id == Material.chapter_id, Chapter.company_id == int(company_id)))
#             .outerjoin(Semester, and_(Semester.id == Course.semester_id, Semester.company_id == int(company_id)))
#             .outerjoin(AcademicYear,
#                        and_(AcademicYear.id == Semester.academic_year_id, AcademicYear.company_id == int(company_id)))
#             .outerjoin(Department,
#                        and_(Department.id == Course.department_id, Department.company_id == int(company_id)))
#             .outerjoin(ui, ui.c.m_id == Material.id)
#             .where(Material.company_id == int(company_id))
#         )
#
#         if is_enabled is True:
#             stmt = stmt.where(Material.is_enabled.is_(True))
#         elif is_enabled is False:
#             stmt = stmt.where(Material.is_enabled.is_(False))
#
#         scoped_department_id = scope.get("department_id")
#         if scoped_department_id:
#
#             stmt = stmt.where(Course.department_id == int(scoped_department_id))
#         else:
#             log.info("[materials.base] no scoped department restriction")
#
#         if filters.get("course_id"):
#
#             stmt = stmt.where(Material.course_id == int(filters["course_id"]))
#
#         if filters.get("chapter_id"):
#
#             stmt = stmt.where(Material.chapter_id == int(filters["chapter_id"]))
#
#         if filters.get("material_type"):
#
#             stmt = stmt.where(
#                 func.lower(func.cast(Material.material_type, db.String)) == filters["material_type"].lower()
#             )
#
#         if filters.get("department_id"):
#
#             stmt = stmt.where(Course.department_id == int(filters["department_id"]))
#
#         if filters.get("semester_id"):
#
#             stmt = stmt.where(Course.semester_id == int(filters["semester_id"]))
#
#         if filters.get("academic_year_id"):
#
#             stmt = stmt.where(Semester.academic_year_id == int(filters["academic_year_id"]))
#
#         search = (filters.get("search") or "").strip()
#         if search:
#
#             like = f"%{search.lower()}%"
#             stmt = stmt.where(
#                 func.lower(func.coalesce(Material.title, "")).like(like)
#                 | func.lower(func.coalesce(Material.description, "")).like(like)
#             )
#
#
#         return stmt
#
#     # ----------------------------
#     # LIST cursor (descending id)
#     # ----------------------------
#
#     def list_materials_cursor(
#             self,
#             *,
#             company_id: int,
#             limit: int,
#             last_id: Optional[int],
#             filters: Dict[str, Any],
#             is_enabled: Optional[bool],
#             last_priority: Optional[int] = None,
#             last_semester_number: Optional[int] = None,
#     ) -> Tuple[List[MaterialListRow], int, bool, Optional[Dict[str, Any]]]:
#         scope = self._current_user_scope(company_id=company_id)
#
#
#
#         base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)
#
#         base = self._apply_cursor_boundary(
#             base,
#             scope=scope,
#             filters=filters,
#             last_id=last_id,
#             last_priority=last_priority,
#             last_semester_number=last_semester_number,
#         )
#
#         base = self._apply_list_ordering(
#             base,
#             scope=scope,
#             filters=filters,
#         ).limit(int(limit) + 1)
#
#         rows = list(self.s.execute(base).all())
#
#         has_more = len(rows) > limit
#         rows = rows[:limit]
#
#         count_base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)
#         count_stmt = select(func.count()).select_from(count_base.order_by(None).subquery())
#         total = int(self.s.scalar(count_stmt) or 0)
#
#
#         shaped = [MaterialListRow(**r._asdict()) for r in rows]
#
#         next_cursor_payload = None
#         if has_more and shaped:
#             last = shaped[-1]
#
#             if self._use_semester_priority(scope=scope, filters=filters):
#                 next_cursor_payload = {
#                     "last_id": int(last.material_id),
#                     "last_priority": int(last.sort_semester_priority or 0),
#                     "last_semester_number": int(last.sort_semester_number or 0),
#                 }
#             else:
#                 next_cursor_payload = {
#                     "last_id": int(last.material_id),
#                 }
#
#
#         return shaped, total, has_more, next_cursor_payload
#     # ----------------------------
#     # LIST page
#     # ----------------------------
#
#     def list_materials_page(
#             self,
#             *,
#             company_id: int,
#             page: int,
#             per_page: int,
#             filters: Dict[str, Any],
#             is_enabled: Optional[bool],
#     ) -> Tuple[List[MaterialListRow], int, int]:
#         scope = self._current_user_scope(company_id=company_id)
#
#
#         base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)
#
#         count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
#         total = int(self.s.scalar(count_stmt) or 0)
#         pages = max((total + per_page - 1) // per_page, 1)
#         page = min(max(page, 1), pages)
#         offset = (page - 1) * per_page
#
#
#
#         base = self._apply_list_ordering(
#             base,
#             scope=scope,
#             filters=filters,
#         ).offset(offset).limit(per_page)
#
#         rows = list(self.s.execute(base).all())
#
#         # extra debug sample
#         if rows:
#             first = rows[0]._asdict()
#             log.info(
#                 "[materials.page] first row sample material_id=%s course_id=%s department_id=%s semester_id=%s",
#                 first.get("material_id"),
#                 first.get("course_id"),
#                 first.get("department_id"),
#                 first.get("semester_id"),
#             )
#         else:
#             log.warning("[materials.page] query returned zero rows")
#
#         shaped = [MaterialListRow(**r._asdict()) for r in rows]
#         return shaped, total, pages
#         # ----------------------------
#         # DETAIL
#         # ----------------------------
#
#     def get_material_detail(self, *, company_id: int, material_id: int) -> Optional[MaterialDetailRow]:
#         base = self._base_stmt(company_id=company_id, filters={}, is_enabled=None)
#         base = base.where(Material.id == int(material_id)).limit(1)
#         row = self.s.execute(base).first()
#         if not row:
#             return None
#         return MaterialDetailRow(**row._asdict())
#
#     # ----------------------------
#     # response shaping
#     # ----------------------------
#
#     def _file_extension_from_url(self, file_url: Optional[str]) -> Optional[str]:
#         if not file_url:
#             return None
#         # If file_url is our /api/media/file/<key> we can extract extension from ".../file.<ext>.enc"
#         # fallback: try from URL path
#         parts = file_url.split("/")
#         last = parts[-1] if parts else ""
#         if ".enc" in last and "file" in last:
#             # file.pptx.enc -> pptx
#             base = last.replace(".enc", "")
#             if "." in base:
#                 return base.rsplit(".", 1)[-1].lower()
#         if "." in last:
#             return last.rsplit(".", 1)[-1].lower()
#         return None
#
#     def _material_type_value(self, material_type):
#         if material_type is None:
#             return None
#         return getattr(material_type, "value", str(material_type)).lower()
#
#     # def _download_url_from_file_url(self, file_url: Optional[str], external_base: str) -> Optional[str]:
#     #     if not file_url:
#     #         return None
#     #
#     #     # if already absolute or relative media file path, swap /file/ -> /download/
#     #     return file_url.replace("/api/media/file/", "/api/media/download/")
#     def _normalize_media_url(self, file_url: Optional[str], external_base: str) -> Optional[str]:
#         if not file_url:
#             return None
#
#         external_base = (external_base or "http://localhost:7000").rstrip("/")
#
#         marker = "/api/media/file/"
#         if marker in file_url:
#             file_key = file_url.split(marker, 1)[1]
#             return f"{external_base}{marker}{file_key}"
#
#         return file_url
#
#     def _download_url_from_file_url(self, file_url: Optional[str], external_base: str) -> Optional[str]:
#         read_url = self._normalize_media_url(file_url, external_base)
#         if not read_url:
#             return None
#
#         return read_url.replace("/api/media/file/", "/api/media/download/")
#     def _can_preview_in_browser(self, ext: Optional[str]) -> bool:
#         if not ext:
#             return False
#         return ext.lower() in {
#             "pdf",
#             "png",
#             "jpg",
#             "jpeg",
#             "webp",
#             "gif",
#             "bmp",
#             "txt",
#             "mp4",
#             "webm",
#             "mp3",
#             "wav",
#         }
#     def shape_material_list_row(self, r: MaterialListRow, *, external_base: str) -> Dict[str, Any]:
#         ext = self._file_extension_from_url(r.file_url)
#         read_url = self._normalize_media_url(r.file_url, external_base)
#         download_url = self._download_url_from_file_url(r.file_url, external_base)
#
#         return {
#             "id": int(r.material_id),
#             "title": r.title,
#             # "material_type": str(r.material_type).lower() if r.material_type else None,
#             "material_type": self._material_type_value(r.material_type),
#             "description": r.description,
#
#             "file": {
#                 "read_url": read_url,
#                 "download_url": download_url,
#                 "extension": ext,
#                 "size_mb": float(r.file_size_mb) if r.file_size_mb is not None else None,
#                 "page_count": int(r.page_count) if r.page_count is not None else None,
#                 "slide_count": int(r.slide_count) if r.slide_count is not None else None,
#                 "can_preview_in_browser": self._can_preview_in_browser(ext),
#             },
#
#             "flags": {
#                 "is_enabled": bool(r.is_enabled),
#                 "is_downloadable": bool(r.is_downloadable),
#             },
#
#             "stats": {
#                 "view_count": int(r.view_count or 0),
#                 "download_count": int(r.download_count or 0),
#             },
#
#             "context": {
#                 "academic_year": (
#                     {"id": int(r.academic_year_id), "name": r.academic_year_name}
#                     if r.academic_year_id else None
#                 ),
#                 "semester": (
#                     {"id": int(r.semester_id), "number": r.semester_number, "name": r.semester_name}
#                     if r.semester_id else None
#                 ),
#                 "department": (
#                     {"id": int(r.department_id), "name": r.department_name}
#                     if r.department_id else None
#                 ),
#                 "course": {
#                     "id": int(r.course_id),
#                     "title": r.course_title,
#                     "code": r.course_code,
#                 },
#                 "chapter": (
#                     {"id": int(r.chapter_id), "number": r.chapter_number, "title": r.chapter_title}
#                     if r.chapter_id else None
#                 ),
#             },
#
#             "user_state": {
#                 "is_favorite": bool(r.is_favorite),
#                 "view_count": int(r.user_view_count or 0),
#                 "download_count": int(r.user_download_count or 0),
#                 "last_viewed_at": r.last_viewed_at.isoformat() if r.last_viewed_at else None,
#                 "last_downloaded_at": r.last_downloaded_at.isoformat() if r.last_downloaded_at else None,
#             },
#
#             "created_at": r.created_at.isoformat() if r.created_at else None,
#             "updated_at": r.updated_at.isoformat() if r.updated_at else None,
#         }
#
#     def shape_material_detail_row(self, r: MaterialDetailRow, *, external_base: str, company_id: int) -> Dict[str, Any]:
#         out = self.shape_material_list_row(r, external_base=external_base)
#
#         mat = self.s.query(Material).filter(
#             Material.company_id == int(company_id),
#             Material.id == int(r.material_id),
#         ).first()
#
#         if mat is not None and hasattr(mat, "learning_objectives"):
#             out["learning_objectives"] = getattr(mat, "learning_objectives") or []
#         else:
#             out["learning_objectives"] = []
#
#         return out
#
#     def _filters_base_stmt(self, *, company_id: int, filters: Dict[str, Any]):
#         """
#         Base stmt for filter-options only.
#         It is lighter than list stmt and only joins what filter UI needs.
#         """
#         scope = self._current_user_scope(company_id=company_id)
#
#         stmt = (
#             select(
#                 Material.id.label("material_id"),
#                 Course.id.label("course_id"),
#                 Course.title.label("course_title"),
#                 Chapter.id.label("chapter_id"),
#                 Chapter.title.label("chapter_title"),
#                 Chapter.number.label("chapter_number"),
#                 Semester.id.label("semester_id"),
#                 Semester.name.label("semester_name"),
#                 Semester.number.label("semester_number"),
#                 AcademicYear.id.label("academic_year_id"),
#                 AcademicYear.name.label("academic_year_name"),
#                 Department.id.label("department_id"),
#                 Department.name.label("department_name"),
#             )
#             .select_from(Material)
#             .join(Course, and_(Course.id == Material.course_id, Course.company_id == int(company_id)))
#             .outerjoin(Chapter, and_(Chapter.id == Material.chapter_id, Chapter.company_id == int(company_id)))
#             .outerjoin(Semester, and_(Semester.id == Course.semester_id, Semester.company_id == int(company_id)))
#             .outerjoin(AcademicYear,
#                        and_(AcademicYear.id == Semester.academic_year_id, AcademicYear.company_id == int(company_id)))
#             .outerjoin(Department,
#                        and_(Department.id == Course.department_id, Department.company_id == int(company_id)))
#             .where(
#                 Material.company_id == int(company_id),
#                 Material.is_enabled.is_(True),
#                 Course.is_enabled.is_(True),
#             )
#         )
#
#         # hard user scope restriction
#         scoped_department_id = scope.get("department_id")
#         if scoped_department_id:
#             stmt = stmt.where(Course.department_id == int(scoped_department_id))
#
#         # currently selected filters
#         if filters.get("department_id"):
#             stmt = stmt.where(Course.department_id == int(filters["department_id"]))
#
#         if filters.get("academic_year_id"):
#             stmt = stmt.where(Semester.academic_year_id == int(filters["academic_year_id"]))
#
#         if filters.get("semester_id"):
#             stmt = stmt.where(Course.semester_id == int(filters["semester_id"]))
#
#         if filters.get("course_id"):
#             stmt = stmt.where(Course.id == int(filters["course_id"]))
#
#         if filters.get("chapter_id"):
#             stmt = stmt.where(Chapter.id == int(filters["chapter_id"]))
#
#         search = (filters.get("search") or "").strip()
#         if search:
#             like = f"%{search.lower()}%"
#             stmt = stmt.where(
#                 func.lower(func.coalesce(Material.title, "")).like(like)
#                 | func.lower(func.coalesce(Material.description, "")).like(like)
#                 | func.lower(func.coalesce(Course.title, "")).like(like)
#                 | func.lower(func.coalesce(Chapter.title, "")).like(like)
#             )
#
#         return stmt
#
#     def get_material_filter_options(self, *, company_id: int, filters: Dict[str, Any]) -> Dict[str, Any]:
#         """
#         Returns filter options for the materials screen only.
#
#         Rules:
#         - semesters: all semesters in allowed scope having materials
#         - courses:
#             * no semester selected -> []
#             * semester selected -> only courses in that semester
#         - chapters:
#             * no course selected -> []
#             * course selected -> chapters in that course having materials
#         """
#         scope = self._current_user_scope(company_id=company_id)
#
#         # ----------------------------
#         # semesters (always available)
#         # ----------------------------
#         semester_filters = {
#             "department_id": filters.get("department_id"),
#             "academic_year_id": filters.get("academic_year_id"),
#             "search": filters.get("search"),
#         }
#         semester_base = self._filters_base_stmt(
#             company_id=company_id,
#             filters=semester_filters,
#         ).subquery("semester_base")
#
#         semester_rows = self.s.execute(
#             select(
#                 semester_base.c.semester_id.label("id"),
#                 func.coalesce(
#                     semester_base.c.semester_name,
#                     func.concat("Semester ", semester_base.c.semester_number),
#                 ).label("label"),
#                 func.count(func.distinct(semester_base.c.material_id)).label("count"),
#                 semester_base.c.semester_number.label("sort_number"),
#             )
#             .where(semester_base.c.semester_id.isnot(None))
#             .group_by(
#                 semester_base.c.semester_id,
#                 semester_base.c.semester_name,
#                 semester_base.c.semester_number,
#             )
#             .order_by(semester_base.c.semester_number.asc(), semester_base.c.semester_id.asc())
#         ).all()
#
#         semesters = [
#             {
#                 "id": int(r.id),
#                 "label": r.label,
#                 "count": int(r.count or 0),
#             }
#             for r in semester_rows
#         ]
#
#         # ----------------------------
#         # courses (ONLY after semester selected)
#         # ----------------------------
#         courses: List[Dict[str, Any]] = []
#         if filters.get("semester_id"):
#             course_filters = {
#                 "department_id": filters.get("department_id"),
#                 "academic_year_id": filters.get("academic_year_id"),
#                 "semester_id": filters.get("semester_id"),
#                 "search": filters.get("search"),
#             }
#             course_base = self._filters_base_stmt(
#                 company_id=company_id,
#                 filters=course_filters,
#             ).subquery("course_base")
#
#             course_rows = self.s.execute(
#                 select(
#                     course_base.c.course_id.label("id"),
#                     course_base.c.course_title.label("label"),
#                     func.count(func.distinct(course_base.c.material_id)).label("count"),
#                 )
#                 .where(course_base.c.course_id.isnot(None))
#                 .group_by(course_base.c.course_id, course_base.c.course_title)
#                 .order_by(course_base.c.course_title.asc(), course_base.c.course_id.asc())
#             ).all()
#
#             courses = [
#                 {
#                     "id": int(r.id),
#                     "label": r.label,
#                     "count": int(r.count or 0),
#                 }
#                 for r in course_rows
#             ]
#
#         # ----------------------------
#         # chapters (ONLY after course selected)
#         # ----------------------------
#         chapters: List[Dict[str, Any]] = []
#         if filters.get("course_id"):
#             chapter_filters = {
#                 "department_id": filters.get("department_id"),
#                 "academic_year_id": filters.get("academic_year_id"),
#                 "semester_id": filters.get("semester_id"),
#                 "course_id": filters.get("course_id"),
#                 "search": filters.get("search"),
#             }
#             chapter_base = self._filters_base_stmt(
#                 company_id=company_id,
#                 filters=chapter_filters,
#             ).subquery("chapter_base")
#
#             chapter_rows = self.s.execute(
#                 select(
#                     chapter_base.c.chapter_id.label("id"),
#                     chapter_base.c.chapter_title.label("label"),
#                     func.count(func.distinct(chapter_base.c.material_id)).label("count"),
#                     chapter_base.c.chapter_number.label("sort_number"),
#                 )
#                 .where(chapter_base.c.chapter_id.isnot(None))
#                 .group_by(
#                     chapter_base.c.chapter_id,
#                     chapter_base.c.chapter_title,
#                     chapter_base.c.chapter_number,
#                 )
#                 .order_by(chapter_base.c.chapter_number.asc(), chapter_base.c.chapter_id.asc())
#             ).all()
#
#             chapters = [
#                 {
#                     "id": int(r.id),
#                     "label": r.label,
#                     "count": int(r.count or 0),
#                 }
#                 for r in chapter_rows
#             ]
#
#         return {
#             "selected": {
#                 "academic_year_id": int(filters["academic_year_id"]) if filters.get("academic_year_id") else None,
#                 "semester_id": int(filters["semester_id"]) if filters.get("semester_id") else None,
#                 "course_id": int(filters["course_id"]) if filters.get("course_id") else None,
#                 "chapter_id": int(filters["chapter_id"]) if filters.get("chapter_id") else None,
#             },
#             "options": {
#                 "semesters": semesters,
#                 "courses": courses,
#                 "chapters": chapters,
#             },
#             "scope": {
#                 "profile_type": scope.get("profile_type"),
#                 "department_id": int(scope["department_id"]) if scope.get("department_id") else None,
#             },
#         }
#
#
#
#     # ----------------------------
#     # tracking helpers
#     # ----------------------------
#     def _material_exists_for_event(
#         self,
#         *,
#         company_id: int,
#         material_id: int,
#         require_downloadable: bool = False,
#     ) -> bool:
#         stmt = select(exists().where(
#             Material.company_id == int(company_id),
#             Material.id == int(material_id),
#             Material.is_enabled.is_(True),
#             *( [Material.is_downloadable.is_(True)] if require_downloadable else [] ),
#         ))
#         return bool(self.s.scalar(stmt))
#
#     def _interaction_snapshot(
#         self,
#         *,
#         company_id: int,
#         material_id: int,
#         user_id: int,
#     ) -> Dict[str, Any]:
#         row = self.s.execute(
#             select(
#                 Material.id.label("material_id"),
#                 Material.view_count.label("global_view_count"),
#                 Material.download_count.label("global_download_count"),
#                 func.coalesce(StudentMaterialInteraction.view_count, 0).label("user_view_count"),
#                 func.coalesce(StudentMaterialInteraction.download_count, 0).label("user_download_count"),
#                 StudentMaterialInteraction.last_viewed_at.label("last_viewed_at"),
#                 StudentMaterialInteraction.last_downloaded_at.label("last_downloaded_at"),
#             )
#             .select_from(Material)
#             .outerjoin(
#                 StudentMaterialInteraction,
#                 and_(
#                     StudentMaterialInteraction.company_id == Material.company_id,
#                     StudentMaterialInteraction.material_id == Material.id,
#                     StudentMaterialInteraction.user_id == int(user_id),
#                 ),
#             )
#             .where(
#                 Material.company_id == int(company_id),
#                 Material.id == int(material_id),
#             )
#             .limit(1)
#         ).first()
#
#         if not row:
#             return {
#                 "material_id": int(material_id),
#                 "global_view_count": 0,
#                 "global_download_count": 0,
#                 "user_view_count": 0,
#                 "user_download_count": 0,
#                 "last_viewed_at": None,
#                 "last_downloaded_at": None,
#             }
#
#         d = row._asdict()
#         return {
#             "material_id": int(d["material_id"]),
#             "global_view_count": int(d["global_view_count"] or 0),
#             "global_download_count": int(d["global_download_count"] or 0),
#             "user_view_count": int(d["user_view_count"] or 0),
#             "user_download_count": int(d["user_download_count"] or 0),
#             "last_viewed_at": d["last_viewed_at"].isoformat() if d["last_viewed_at"] else None,
#             "last_downloaded_at": d["last_downloaded_at"].isoformat() if d["last_downloaded_at"] else None,
#         }
#
#     def increment_view(
#         self,
#         *,
#         company_id: int,
#         material_id: int,
#         user_id: int,
#         cooldown_seconds: int = 3600,
#     ) -> Dict[str, Any]:
#         """
#         Count a view only if:
#         - material exists and is enabled
#         - the user's last_viewed_at is older than cooldown window
#         """
#         if not self._material_exists_for_event(
#             company_id=company_id,
#             material_id=material_id,
#             require_downloadable=False,
#         ):
#             return {
#                 "counted": False,
#                 "reason": "Material not found or disabled.",
#                 **self._interaction_snapshot(
#                     company_id=company_id,
#                     material_id=material_id,
#                     user_id=user_id,
#                 ),
#             }
#
#         cutoff_dt = datetime.now(timezone.utc) - timedelta(seconds=int(cooldown_seconds))
#
#         stmt_user = pg_insert(StudentMaterialInteraction).values(
#             company_id=int(company_id),
#             user_id=int(user_id),
#             material_id=int(material_id),
#             is_favorite=False,
#             view_count=1,
#             download_count=0,
#             last_viewed_at=func.now(),
#         )
#
#         stmt_user = stmt_user.on_conflict_do_update(
#             index_elements=["company_id", "user_id", "material_id"],
#             set_={
#                 "view_count": StudentMaterialInteraction.view_count + 1,
#                 "last_viewed_at": func.now(),
#             },
#             where=sa_or(
#                 StudentMaterialInteraction.last_viewed_at.is_(None),
#                 StudentMaterialInteraction.last_viewed_at < cutoff_dt,
#             ),
#         ).returning(StudentMaterialInteraction.material_id)
#
#         user_row = self.s.execute(stmt_user).first()
#
#         # cooldown active => do not increment global counter
#         if not user_row:
#             return {
#                 "counted": False,
#                 "reason": "Cooldown active.",
#                 **self._interaction_snapshot(
#                     company_id=company_id,
#                     material_id=material_id,
#                     user_id=user_id,
#                 ),
#             }
#
#         stmt_global = (
#             update(Material)
#             .where(
#                 Material.company_id == int(company_id),
#                 Material.id == int(material_id),
#                 Material.is_enabled.is_(True),
#             )
#             .values(view_count=Material.view_count + 1)
#         )
#         self.s.execute(stmt_global)
#         self.s.flush()
#
#         return {
#             "counted": True,
#             "reason": None,
#             **self._interaction_snapshot(
#                 company_id=company_id,
#                 material_id=material_id,
#                 user_id=user_id,
#             ),
#         }
#
#     def increment_download(
#         self,
#         *,
#         company_id: int,
#         material_id: int,
#         user_id: int,
#     ) -> Dict[str, Any]:
#         """
#         Always count download when user explicitly clicks download.
#         """
#         if not self._material_exists_for_event(
#             company_id=company_id,
#             material_id=material_id,
#             require_downloadable=True,
#         ):
#             return {
#                 "counted": False,
#                 "reason": "Material not found, disabled, or not downloadable.",
#                 **self._interaction_snapshot(
#                     company_id=company_id,
#                     material_id=material_id,
#                     user_id=user_id,
#                 ),
#             }
#
#         stmt_user = pg_insert(StudentMaterialInteraction).values(
#             company_id=int(company_id),
#             user_id=int(user_id),
#             material_id=int(material_id),
#             is_favorite=False,
#             view_count=0,
#             download_count=1,
#             last_downloaded_at=func.now(),
#         )
#
#         stmt_user = stmt_user.on_conflict_do_update(
#             index_elements=["company_id", "user_id", "material_id"],
#             set_={
#                 "download_count": StudentMaterialInteraction.download_count + 1,
#                 "last_downloaded_at": func.now(),
#             },
#         ).returning(StudentMaterialInteraction.material_id)
#
#         self.s.execute(stmt_user)
#
#         stmt_global = (
#             update(Material)
#             .where(
#                 Material.company_id == int(company_id),
#                 Material.id == int(material_id),
#                 Material.is_enabled.is_(True),
#                 Material.is_downloadable.is_(True),
#             )
#             .values(download_count=Material.download_count + 1)
#         )
#         self.s.execute(stmt_global)
#         self.s.flush()
#
#         return {
#             "counted": True,
#             "reason": None,
#             **self._interaction_snapshot(
#                 company_id=company_id,
#                 material_id=material_id,
#                 user_id=user_id,
#             ),
#         }
#
#
#
#
#     def set_favorite(
#         self,
#         *,
#         company_id: int,
#         material_id: int,
#         user_id: int,
#         is_favorite: bool,
#     ) -> Dict[str, Any]:
#         if not self._material_exists_for_event(
#             company_id=company_id,
#             material_id=material_id,
#             require_downloadable=False,
#         ):
#             return {
#                 "counted": False,
#                 "reason": "Material not found or disabled.",
#                 **self._interaction_snapshot(
#                     company_id=company_id,
#                     material_id=material_id,
#                     user_id=user_id,
#                 ),
#             }
#
#         stmt_user = pg_insert(StudentMaterialInteraction).values(
#             company_id=int(company_id),
#             user_id=int(user_id),
#             material_id=int(material_id),
#             is_favorite=bool(is_favorite),
#             view_count=0,
#             download_count=0,
#             last_viewed_at=None,
#             last_downloaded_at=None,
#         )
#
#         stmt_user = stmt_user.on_conflict_do_update(
#             index_elements=["company_id", "user_id", "material_id"],
#             set_={
#                 "is_favorite": bool(is_favorite),
#             },
#         ).returning(StudentMaterialInteraction.material_id)
#
#         self.s.execute(stmt_user)
#         self.s.flush()
#
#         snap = self._interaction_snapshot(
#             company_id=company_id,
#             material_id=material_id,
#             user_id=user_id,
#         )
#
#         return {
#             "counted": True,
#             "reason": None,
#             "is_favorite": bool(is_favorite),
#             **snap,
#         }
#
#     def list_favorite_materials_page(
#         self,
#         *,
#         company_id: int,
#         user_id: int,
#         page: int,
#         per_page: int,
#         external_base: str,
#     ) -> Tuple[List[Dict[str, Any]], int, int]:
#         page = max(int(page or 1), 1)
#         allowed = {10, 20, 50, 500}
#         per_page = per_page if int(per_page or 20) in allowed else 20
#
#         base = (
#             select(Material.id)
#             .select_from(StudentMaterialInteraction)
#             .join(
#                 Material,
#                 and_(
#                     Material.id == StudentMaterialInteraction.material_id,
#                     Material.company_id == int(company_id),
#                 ),
#             )
#             .where(
#                 StudentMaterialInteraction.company_id == int(company_id),
#                 StudentMaterialInteraction.user_id == int(user_id),
#                 StudentMaterialInteraction.is_favorite.is_(True),
#                 Material.is_enabled.is_(True),
#             )
#             .order_by(StudentMaterialInteraction.updated_at.desc(), Material.id.desc())
#         )
#
#         count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
#         total = int(self.s.scalar(count_stmt) or 0)
#         pages = max((total + per_page - 1) // per_page, 1)
#         page = min(page, pages)
#         offset = (page - 1) * per_page
#
#         material_ids = list(
#             self.s.scalars(base.offset(offset).limit(per_page)).all()
#         )
#
#         rows: List[Dict[str, Any]] = []
#         for mid in material_ids:
#             detail_row = self.get_material_detail(company_id=company_id, material_id=int(mid))
#             if detail_row:
#                 rows.append(self.shape_material_list_row(detail_row, external_base=external_base))
#
#         return rows, total, pages
# src/cmcp/modules/materials/repository.py (UPDATED)
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional, Any, Dict, Tuple, List
from flask import g
from sqlalchemy import exists, func, select, and_, case, literal, update, or_
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from sqlalchemy import update, or_ as sa_or
from sqlalchemy.dialects.postgresql import insert as pg_insert

from cmcp.config.database import db
from cmcp.core.base_repo import BaseRepository
from cmcp.modules.materials.models import Material, StudentMaterialInteraction
from cmcp.modules.academic.models import (
    Course,
    CourseOffering,  # NEW
    CourseChapter,  # NEW (replaces old Chapter)
    Semester,
    AcademicYear,
    Department,
    Faculty
)
from cmcp.modules.education_people.models import StudentProfile, StaffProfile

log = logging.getLogger(__name__)


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

    # context - UPDATED for new model structure
    course_id: int
    course_title: str
    course_code: Optional[str]

    course_offering_id: Optional[int]  # NEW
    custom_title: Optional[str]  # NEW
    credit_hours: Optional[int]  # NEW

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

    faculty_id: Optional[int]  # NEW
    faculty_name: Optional[str]  # NEW

    # user state
    is_favorite: bool
    user_view_count: int
    user_download_count: int
    last_viewed_at: Optional[Any]
    last_downloaded_at: Optional[Any]

    # internal sort helpers
    sort_semester_number: Optional[int] = None
    sort_semester_priority: Optional[int] = None

MaterialDetailRow = MaterialListRow

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
        """Check if a course definition exists"""
        stmt = select(exists().where(
            Course.company_id == int(company_id),
            Course.id == int(course_id),
            Course.is_enabled.is_(True)
        ))
        return bool(self.s.scalar(stmt))

    def course_offering_exists(self, *, company_id: int, offering_id: int) -> bool:
        """Check if a course offering exists and is valid"""
        stmt = select(exists().where(
            CourseOffering.company_id == int(company_id),
            CourseOffering.id == int(offering_id),
            CourseOffering.is_enabled.is_(True)
        ))
        return bool(self.s.scalar(stmt))

    def chapter_get(self, *, company_id: int, chapter_id: int) -> Optional[CourseChapter]:
        """Get a course chapter (UPDATED to use CourseChapter)"""
        return self.s.query(CourseChapter).filter(
            CourseChapter.company_id == int(company_id),
            CourseChapter.id == int(chapter_id),
        ).first()

    def title_exists_in_scope(
            self,
            *,
            company_id: int,
            course_offering_id: int,  # CHANGED: now uses offering instead of course_id
            chapter_id: Optional[int],
            title: str,
            exclude_id: Optional[int] = None,
    ) -> bool:
        """Check if a material title exists in a specific offering scope"""
        conds = [
            Material.company_id == int(company_id),
            Material.course_offering_id == int(course_offering_id),  # CHANGED
            Material.chapter_id.is_(None) if chapter_id is None else (Material.chapter_id == int(chapter_id)),
            func.lower(Material.title) == func.lower(title.strip()),
        ]
        if exclude_id:
            conds.append(Material.id != int(exclude_id))
        stmt = select(exists().where(*conds))
        return bool(self.s.scalar(stmt))

    def chapter_belongs_to_offering(
            self,
            *,
            company_id: int,
            chapter_id: int,
            offering_id: int
    ) -> bool:
        """Check if a chapter belongs to a specific course offering"""
        ch = self.chapter_get(company_id=company_id, chapter_id=chapter_id)
        if not ch:
            return False
        return int(ch.course_offering_id) == int(offering_id)

    def has_interactions(self, *, company_id: int, material_id: int) -> bool:
        stmt = select(exists().where(
            StudentMaterialInteraction.company_id == int(company_id),
            StudentMaterialInteraction.material_id == int(material_id),
        ))
        return bool(self.s.scalar(stmt))

    def _current_user_scope(self, *, company_id: int) -> Dict[str, Any]:
        """Get current user's academic scope (department, semester, etc.)"""
        uid = self._current_user_id()
        out = {
            "user_id": int(uid) if uid is not None else None,
            "profile_type": None,
            "department_id": None,
            "faculty_id": None,
            "semester_id": None,
            "semester_number": None,
        }

        if uid is None:
            return out

        # Check student profile first
        sp = (
            self.s.query(
                StudentProfile.department_id.label("department_id"),
                StudentProfile.faculty_id.label("faculty_id"),
                StudentProfile.semester_id.label("semester_id"),
                Semester.number.label("semester_number"),
            )
            .outerjoin(
                Semester,
                and_(
                    Semester.id == StudentProfile.semester_id,
                    Semester.company_id == int(company_id),
                ),
            )
            .filter(
                StudentProfile.company_id == int(company_id),
                StudentProfile.user_id == int(uid),
                StudentProfile.is_enabled.is_(True),
            )
            .first()
        )

        if sp:
            out.update({
                "profile_type": "student",
                "department_id": int(sp.department_id) if sp.department_id else None,
                "faculty_id": int(sp.faculty_id) if sp.faculty_id else None,
                "semester_id": int(sp.semester_id) if sp.semester_id else None,
                "semester_number": int(sp.semester_number) if sp.semester_number else None,
            })
            return out

        # Check staff profile
        st = (
            self.s.query(
                StaffProfile.department_id.label("department_id"),
                StaffProfile.faculty_id.label("faculty_id"),
            )
            .filter(
                StaffProfile.company_id == int(company_id),
                StaffProfile.user_id == int(uid),
                StaffProfile.is_enabled.is_(True),
            )
            .first()
        )

        if st:
            out.update({
                "profile_type": "staff",
                "department_id": int(st.department_id) if st.department_id else None,
                "faculty_id": int(st.faculty_id) if st.faculty_id else None,
                "semester_id": None,
                "semester_number": None,
            })
            log.info("[materials.scope] resolved staff scope=%s", out)
            return out

        return out

    # ----------------------------
    # list/detail query builder (UPDATED)
    # ----------------------------

    def _semester_priority_expr(self, current_semester_number: Optional[int]):
        if not current_semester_number:
            return None
        current_semester_number = int(current_semester_number)
        return case(
            (
                Semester.number >= current_semester_number,
                Semester.number - current_semester_number,
            ),
            else_=(1000 + Semester.number - current_semester_number),
        )

    def _use_semester_priority(self, *, scope: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        enabled = True
        if scope.get("profile_type") != "student":
            enabled = False
        elif not scope.get("semester_number"):
            enabled = False
        elif filters.get("semester_id") or filters.get("course_id") or filters.get("chapter_id"):
            enabled = False
        return enabled

    def _apply_list_ordering(self, stmt, *, scope: Dict[str, Any], filters: Dict[str, Any]):
        if self._use_semester_priority(scope=scope, filters=filters):
            sem_priority = self._semester_priority_expr(scope.get("semester_number"))
            return stmt.order_by(
                sem_priority.asc(),
                func.coalesce(Semester.number, 0).asc(),
                Material.id.desc(),
            )
        return stmt.order_by(Material.id.desc())

    def _apply_cursor_boundary(
            self,
            stmt,
            *,
            scope: Dict[str, Any],
            filters: Dict[str, Any],
            last_id: Optional[int],
            last_priority: Optional[int],
            last_semester_number: Optional[int],
    ):
        if not last_id:
            return stmt

        if self._use_semester_priority(scope=scope, filters=filters):
            if last_priority is None or last_semester_number is None:
                return stmt

            sem_priority = self._semester_priority_expr(scope.get("semester_number"))
            sem_num = func.coalesce(Semester.number, 0)

            return stmt.where(
                or_(
                    sem_priority > int(last_priority),
                    and_(
                        sem_priority == int(last_priority),
                        sem_num > int(last_semester_number),
                    ),
                    and_(
                        sem_priority == int(last_priority),
                        sem_num == int(last_semester_number),
                        Material.id < int(last_id),
                    ),
                )
            )

        return stmt.where(Material.id < int(last_id))

    def _base_stmt(self, *, company_id: int, filters: Dict[str, Any], is_enabled: Optional[bool]):
        """Base statement for material queries - UPDATED for new model structure"""
        uid = self._current_user_id() or 0
        scope = self._current_user_scope(company_id=company_id)

        use_sem_priority = self._use_semester_priority(scope=scope, filters=filters)
        sem_priority_expr = self._semester_priority_expr(scope.get("semester_number")) if use_sem_priority else None

        # User interactions subquery
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

        # Global stats
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

        # Build the main query with new joins
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

                # Course information
                Course.id.label("course_id"),
                Course.title.label("course_title"),
                Course.code.label("course_code"),

                # Course offering information (NEW)
                CourseOffering.id.label("course_offering_id"),
                CourseOffering.custom_title.label("custom_title"),
                CourseOffering.credit_hours.label("credit_hours"),

                # Chapter information (now from CourseChapter)
                CourseChapter.id.label("chapter_id"),
                CourseChapter.title.label("chapter_title"),
                CourseChapter.number.label("chapter_number"),

                # Semester information
                Semester.id.label("semester_id"),
                Semester.number.label("semester_number"),
                Semester.name.label("semester_name"),

                # Academic year
                AcademicYear.id.label("academic_year_id"),
                AcademicYear.name.label("academic_year_name"),

                # Department
                Department.id.label("department_id"),
                Department.name.label("department_name"),

                # Faculty (NEW)
                Faculty.id.label("faculty_id"),
                Faculty.name.label("faculty_name"),

                func.coalesce(ui.c.is_favorite, False).label("is_favorite"),
                func.coalesce(ui.c.u_view_count, 0).label("user_view_count"),
                func.coalesce(ui.c.u_download_count, 0).label("user_download_count"),
                ui.c.last_viewed_at.label("last_viewed_at"),
                ui.c.last_downloaded_at.label("last_downloaded_at"),

                func.coalesce(Semester.number, 0).label("sort_semester_number"),
                (
                    sem_priority_expr.label("sort_semester_priority")
                    if sem_priority_expr is not None
                    else literal(None).label("sort_semester_priority")
                ),
            )
            .select_from(Material)
            # NEW JOIN STRUCTURE: Material -> CourseOffering -> Course/Semester/Department
            .join(
                CourseOffering,
                and_(
                    CourseOffering.id == Material.course_offering_id,
                    CourseOffering.company_id == int(company_id)
                )
            )
            .join(
                Course,
                and_(
                    Course.id == CourseOffering.course_id,
                    Course.company_id == int(company_id)
                )
            )
            .outerjoin(
                CourseChapter,
                and_(
                    CourseChapter.id == Material.chapter_id,
                    CourseChapter.company_id == int(company_id)
                )
            )
            .outerjoin(
                Semester,
                and_(
                    Semester.id == CourseOffering.semester_id,
                    Semester.company_id == int(company_id)
                )
            )
            .outerjoin(
                AcademicYear,
                and_(
                    AcademicYear.id == Semester.academic_year_id,
                    AcademicYear.company_id == int(company_id)
                )
            )
            .outerjoin(
                Department,
                and_(
                    Department.id == CourseOffering.department_id,
                    Department.company_id == int(company_id)
                )
            )
            .outerjoin(
                Faculty,
                and_(
                    Faculty.id == Department.faculty_id,
                    Faculty.company_id == int(company_id)
                )
            )
            .outerjoin(ui, ui.c.m_id == Material.id)
            .where(Material.company_id == int(company_id))
        )

        # Apply is_enabled filter
        if is_enabled is True:
            stmt = stmt.where(Material.is_enabled.is_(True))
        elif is_enabled is False:
            stmt = stmt.where(Material.is_enabled.is_(False))

        # Apply department scope from user profile
        scoped_department_id = scope.get("department_id")
        if scoped_department_id:
            stmt = stmt.where(CourseOffering.department_id == int(scoped_department_id))
        else:
            log.info("[materials.base] no scoped department restriction")

        # Apply filters
        if filters.get("course_id"):
            stmt = stmt.where(Course.id == int(filters["course_id"]))

        if filters.get("course_offering_id"):  # NEW filter
            stmt = stmt.where(CourseOffering.id == int(filters["course_offering_id"]))

        if filters.get("chapter_id"):
            stmt = stmt.where(Material.chapter_id == int(filters["chapter_id"]))

        if filters.get("material_type"):
            stmt = stmt.where(
                func.lower(func.cast(Material.material_type, db.String)) == filters["material_type"].lower()
            )

        if filters.get("department_id"):
            stmt = stmt.where(CourseOffering.department_id == int(filters["department_id"]))

        if filters.get("semester_id"):
            stmt = stmt.where(CourseOffering.semester_id == int(filters["semester_id"]))

        if filters.get("academic_year_id"):
            stmt = stmt.where(Semester.academic_year_id == int(filters["academic_year_id"]))

        # Search filter
        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(Material.title, "")).like(like)
                | func.lower(func.coalesce(Material.description, "")).like(like)
                | func.lower(func.coalesce(Course.title, "")).like(like)
                | func.lower(func.coalesce(CourseChapter.title, "")).like(like)
            )

        return stmt

    # ----------------------------
    # LIST methods (unchanged signatures, updated internals)
    # ----------------------------

    def list_materials_cursor(
            self,
            *,
            company_id: int,
            limit: int,
            last_id: Optional[int],
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
            last_priority: Optional[int] = None,
            last_semester_number: Optional[int] = None,
    ) -> Tuple[List[MaterialListRow], int, bool, Optional[Dict[str, Any]]]:
        scope = self._current_user_scope(company_id=company_id)

        base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)
        base = self._apply_cursor_boundary(
            base,
            scope=scope,
            filters=filters,
            last_id=last_id,
            last_priority=last_priority,
            last_semester_number=last_semester_number,
        )
        base = self._apply_list_ordering(base, scope=scope, filters=filters).limit(int(limit) + 1)

        rows = list(self.s.execute(base).all())
        has_more = len(rows) > limit
        rows = rows[:limit]

        # Count total
        count_base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)
        count_stmt = select(func.count()).select_from(count_base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)

        shaped = [MaterialListRow(**r._asdict()) for r in rows]

        next_cursor_payload = None
        if has_more and shaped:
            last = shaped[-1]
            if self._use_semester_priority(scope=scope, filters=filters):
                next_cursor_payload = {
                    "last_id": int(last.material_id),
                    "last_priority": int(last.sort_semester_priority or 0),
                    "last_semester_number": int(last.sort_semester_number or 0),
                }
            else:
                next_cursor_payload = {"last_id": int(last.material_id)}

        return shaped, total, has_more, next_cursor_payload

    def list_materials_page(
            self,
            *,
            company_id: int,
            page: int,
            per_page: int,
            filters: Dict[str, Any],
            is_enabled: Optional[bool],
    ) -> Tuple[List[MaterialListRow], int, int]:
        scope = self._current_user_scope(company_id=company_id)

        base = self._base_stmt(company_id=company_id, filters=filters, is_enabled=is_enabled)

        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)
        pages = max((total + per_page - 1) // per_page, 1)
        page = min(max(page, 1), pages)
        offset = (page - 1) * per_page

        base = self._apply_list_ordering(base, scope=scope, filters=filters).offset(offset).limit(per_page)

        rows = list(self.s.execute(base).all())

        if rows:
            first = rows[0]._asdict()
            log.info(
                "[materials.page] first row sample material_id=%s course_id=%s offering_id=%s department_id=%s",
                first.get("material_id"),
                first.get("course_id"),
                first.get("course_offering_id"),
                first.get("department_id"),
            )
        else:
            log.warning("[materials.page] query returned zero rows")

        shaped = [MaterialListRow(**r._asdict()) for r in rows]
        return shaped, total, pages

    def get_material_detail(self, *, company_id: int, material_id: int) -> Optional[MaterialDetailRow]:
        base = self._base_stmt(company_id=company_id, filters={}, is_enabled=None)
        base = base.where(Material.id == int(material_id)).limit(1)
        row = self.s.execute(base).first()
        if not row:
            return None
        return MaterialDetailRow(**row._asdict())

    # ----------------------------
    # response shaping (unchanged except for adding offering context)
    # ----------------------------

    def _file_extension_from_url(self, file_url: Optional[str]) -> Optional[str]:
        if not file_url:
            return None
        parts = file_url.split("/")
        last = parts[-1] if parts else ""
        if ".enc" in last and "file" in last:
            base = last.replace(".enc", "")
            if "." in base:
                return base.rsplit(".", 1)[-1].lower()
        if "." in last:
            return last.rsplit(".", 1)[-1].lower()
        return None

    def _material_type_value(self, material_type):
        if material_type is None:
            return None
        return getattr(material_type, "value", str(material_type)).lower()

    def _normalize_media_url(self, file_url: Optional[str], external_base: str) -> Optional[str]:
        if not file_url:
            return None
        external_base = (external_base or "http://localhost:7000").rstrip("/")
        marker = "/api/media/file/"
        if marker in file_url:
            file_key = file_url.split(marker, 1)[1]
            return f"{external_base}{marker}{file_key}"
        return file_url

    def _download_url_from_file_url(self, file_url: Optional[str], external_base: str) -> Optional[str]:
        read_url = self._normalize_media_url(file_url, external_base)
        if not read_url:
            return None
        return read_url.replace("/api/media/file/", "/api/media/download/")

    def _can_preview_in_browser(self, ext: Optional[str]) -> bool:
        if not ext:
            return False
        return ext.lower() in {
            "pdf", "png", "jpg", "jpeg", "webp", "gif", "bmp", "txt", "mp4", "webm", "mp3", "wav",
        }

    def shape_material_list_row(self, r: MaterialListRow, *, external_base: str) -> Dict[str, Any]:
        ext = self._file_extension_from_url(r.file_url)
        read_url = self._normalize_media_url(r.file_url, external_base)
        download_url = self._download_url_from_file_url(r.file_url, external_base)

        return {
            "id": int(r.material_id),
            "title": r.title,
            "material_type": self._material_type_value(r.material_type),
            "description": r.description,
            "file": {
                "read_url": read_url,
                "download_url": download_url,
                "extension": ext,
                "size_mb": float(r.file_size_mb) if r.file_size_mb is not None else None,
                "page_count": int(r.page_count) if r.page_count is not None else None,
                "slide_count": int(r.slide_count) if r.slide_count is not None else None,
                "can_preview_in_browser": self._can_preview_in_browser(ext),
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
                "faculty": (  # NEW
                    {"id": int(r.faculty_id), "name": r.faculty_name}
                    if r.faculty_id else None
                ),
                "course": {
                    "id": int(r.course_id),
                    "title": r.course_title,
                    "code": r.course_code,
                },
                "course_offering": (  # NEW
                    {
                        "id": int(r.course_offering_id),
                        "custom_title": r.custom_title,
                        "credit_hours": r.credit_hours,
                    }
                    if r.course_offering_id else None
                ),
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

    def shape_material_detail_row(self, r: MaterialDetailRow, *, external_base: str, company_id: int) -> Dict[str, Any]:
        out = self.shape_material_list_row(r, external_base=external_base)

        mat = self.s.query(Material).filter(
            Material.company_id == int(company_id),
            Material.id == int(r.material_id),
        ).first()

        if mat is not None and hasattr(mat, "learning_objectives"):
            out["learning_objectives"] = getattr(mat, "learning_objectives") or []
        else:
            out["learning_objectives"] = []

        return out

    # ----------------------------
    # Filter options (UPDATED)
    # ----------------------------

    def _filters_base_stmt(self, *, company_id: int, filters: Dict[str, Any]):
        """Base stmt for filter-options - UPDATED for new model structure"""
        scope = self._current_user_scope(company_id=company_id)

        stmt = (
            select(
                Material.id.label("material_id"),
                Course.id.label("course_id"),
                Course.title.label("course_title"),
                CourseOffering.id.label("course_offering_id"),  # NEW
                CourseChapter.id.label("chapter_id"),
                CourseChapter.title.label("chapter_title"),
                CourseChapter.number.label("chapter_number"),
                Semester.id.label("semester_id"),
                Semester.name.label("semester_name"),
                Semester.number.label("semester_number"),
                AcademicYear.id.label("academic_year_id"),
                AcademicYear.name.label("academic_year_name"),
                Department.id.label("department_id"),
                Department.name.label("department_name"),
                Faculty.id.label("faculty_id"),  # NEW
                Faculty.name.label("faculty_name"),  # NEW
            )
            .select_from(Material)
            .join(
                CourseOffering,
                and_(
                    CourseOffering.id == Material.course_offering_id,
                    CourseOffering.company_id == int(company_id)
                )
            )
            .join(
                Course,
                and_(
                    Course.id == CourseOffering.course_id,
                    Course.company_id == int(company_id)
                )
            )
            .outerjoin(
                CourseChapter,
                and_(
                    CourseChapter.id == Material.chapter_id,
                    CourseChapter.company_id == int(company_id)
                )
            )
            .outerjoin(
                Semester,
                and_(
                    Semester.id == CourseOffering.semester_id,
                    Semester.company_id == int(company_id)
                )
            )
            .outerjoin(
                AcademicYear,
                and_(
                    AcademicYear.id == Semester.academic_year_id,
                    AcademicYear.company_id == int(company_id)
                )
            )
            .outerjoin(
                Department,
                and_(
                    Department.id == CourseOffering.department_id,
                    Department.company_id == int(company_id)
                )
            )
            .outerjoin(
                Faculty,
                and_(
                    Faculty.id == Department.faculty_id,
                    Faculty.company_id == int(company_id)
                )
            )
            .where(
                Material.company_id == int(company_id),
                Material.is_enabled.is_(True),
                Course.is_enabled.is_(True),
                CourseOffering.is_enabled.is_(True),  # NEW
            )
        )

        # Apply user scope
        scoped_department_id = scope.get("department_id")
        if scoped_department_id:
            stmt = stmt.where(CourseOffering.department_id == int(scoped_department_id))

        # Apply filters
        if filters.get("department_id"):
            stmt = stmt.where(CourseOffering.department_id == int(filters["department_id"]))

        if filters.get("faculty_id"):  # NEW filter
            stmt = stmt.where(Faculty.id == int(filters["faculty_id"]))

        if filters.get("academic_year_id"):
            stmt = stmt.where(Semester.academic_year_id == int(filters["academic_year_id"]))

        if filters.get("semester_id"):
            stmt = stmt.where(CourseOffering.semester_id == int(filters["semester_id"]))

        if filters.get("course_id"):
            stmt = stmt.where(Course.id == int(filters["course_id"]))

        if filters.get("course_offering_id"):  # NEW filter
            stmt = stmt.where(CourseOffering.id == int(filters["course_offering_id"]))

        if filters.get("chapter_id"):
            stmt = stmt.where(CourseChapter.id == int(filters["chapter_id"]))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(func.coalesce(Material.title, "")).like(like)
                | func.lower(func.coalesce(Material.description, "")).like(like)
                | func.lower(func.coalesce(Course.title, "")).like(like)
                | func.lower(func.coalesce(CourseChapter.title, "")).like(like)
            )

        return stmt

    def get_material_filter_options(self, *, company_id: int, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Returns filter options for materials - UPDATED to work with new model"""
        scope = self._current_user_scope(company_id=company_id)

        # Get semesters
        semester_filters = {
            "department_id": filters.get("department_id"),
            "faculty_id": filters.get("faculty_id"),  # NEW
            "academic_year_id": filters.get("academic_year_id"),
            "search": filters.get("search"),
        }
        semester_base = self._filters_base_stmt(
            company_id=company_id,
            filters=semester_filters,
        ).subquery("semester_base")

        semester_rows = self.s.execute(
            select(
                semester_base.c.semester_id.label("id"),
                func.coalesce(
                    semester_base.c.semester_name,
                    func.concat("Semester ", semester_base.c.semester_number),
                ).label("label"),
                func.count(func.distinct(semester_base.c.material_id)).label("count"),
                semester_base.c.semester_number.label("sort_number"),
            )
            .where(semester_base.c.semester_id.isnot(None))
            .group_by(
                semester_base.c.semester_id,
                semester_base.c.semester_name,
                semester_base.c.semester_number,
            )
            .order_by(semester_base.c.semester_number.asc(), semester_base.c.semester_id.asc())
        ).all()

        semesters = [
            {"id": int(r.id), "label": r.label, "count": int(r.count or 0)}
            for r in semester_rows
        ]

        # Get courses (only after semester selected)
        courses: List[Dict[str, Any]] = []
        if filters.get("semester_id"):
            course_filters = {
                "department_id": filters.get("department_id"),
                "faculty_id": filters.get("faculty_id"),
                "academic_year_id": filters.get("academic_year_id"),
                "semester_id": filters.get("semester_id"),
                "search": filters.get("search"),
            }
            course_base = self._filters_base_stmt(
                company_id=company_id,
                filters=course_filters,
            ).subquery("course_base")

            course_rows = self.s.execute(
                select(
                    course_base.c.course_id.label("id"),
                    course_base.c.course_title.label("label"),
                    func.count(func.distinct(course_base.c.material_id)).label("count"),
                )
                .where(course_base.c.course_id.isnot(None))
                .group_by(course_base.c.course_id, course_base.c.course_title)
                .order_by(course_base.c.course_title.asc(), course_base.c.course_id.asc())
            ).all()

            courses = [
                {"id": int(r.id), "label": r.label, "count": int(r.count or 0)}
                for r in course_rows
            ]

        # Get chapters (only after course selected)
        chapters: List[Dict[str, Any]] = []
        if filters.get("course_id"):
            chapter_filters = {
                "department_id": filters.get("department_id"),
                "faculty_id": filters.get("faculty_id"),
                "academic_year_id": filters.get("academic_year_id"),
                "semester_id": filters.get("semester_id"),
                "course_id": filters.get("course_id"),
                "search": filters.get("search"),
            }
            chapter_base = self._filters_base_stmt(
                company_id=company_id,
                filters=chapter_filters,
            ).subquery("chapter_base")

            chapter_rows = self.s.execute(
                select(
                    chapter_base.c.chapter_id.label("id"),
                    chapter_base.c.chapter_title.label("label"),
                    func.count(func.distinct(chapter_base.c.material_id)).label("count"),
                    chapter_base.c.chapter_number.label("sort_number"),
                )
                .where(chapter_base.c.chapter_id.isnot(None))
                .group_by(
                    chapter_base.c.chapter_id,
                    chapter_base.c.chapter_title,
                    chapter_base.c.chapter_number,
                )
                .order_by(chapter_base.c.chapter_number.asc(), chapter_base.c.chapter_id.asc())
            ).all()

            chapters = [
                {"id": int(r.id), "label": r.label, "count": int(r.count or 0)}
                for r in chapter_rows
            ]

        return {
            "selected": {
                "academic_year_id": int(filters["academic_year_id"]) if filters.get("academic_year_id") else None,
                "semester_id": int(filters["semester_id"]) if filters.get("semester_id") else None,
                "course_id": int(filters["course_id"]) if filters.get("course_id") else None,
                "chapter_id": int(filters["chapter_id"]) if filters.get("chapter_id") else None,
                "faculty_id": int(filters["faculty_id"]) if filters.get("faculty_id") else None,
            },
            "options": {
                "semesters": semesters,
                "courses": courses,
                "chapters": chapters,
            },
            "scope": {
                "profile_type": scope.get("profile_type"),
                "department_id": int(scope["department_id"]) if scope.get("department_id") else None,
                "faculty_id": int(scope["faculty_id"]) if scope.get("faculty_id") else None,
            },
        }

    # ----------------------------
    # tracking methods (mostly unchanged, but material validation updated)
    # ----------------------------

    def _material_exists_for_event(
            self,
            *,
            company_id: int,
            material_id: int,
            require_downloadable: bool = False,
    ) -> bool:
        stmt = select(exists().where(
            Material.company_id == int(company_id),
            Material.id == int(material_id),
            Material.is_enabled.is_(True),
            *([Material.is_downloadable.is_(True)] if require_downloadable else []),
        ))
        return bool(self.s.scalar(stmt))

    def _interaction_snapshot(
            self,
            *,
            company_id: int,
            material_id: int,
            user_id: int,
    ) -> Dict[str, Any]:
        row = self.s.execute(
            select(
                Material.id.label("material_id"),
                Material.view_count.label("global_view_count"),
                Material.download_count.label("global_download_count"),
                func.coalesce(StudentMaterialInteraction.view_count, 0).label("user_view_count"),
                func.coalesce(StudentMaterialInteraction.download_count, 0).label("user_download_count"),
                StudentMaterialInteraction.last_viewed_at.label("last_viewed_at"),
                StudentMaterialInteraction.last_downloaded_at.label("last_downloaded_at"),
            )
            .select_from(Material)
            .outerjoin(
                StudentMaterialInteraction,
                and_(
                    StudentMaterialInteraction.company_id == Material.company_id,
                    StudentMaterialInteraction.material_id == Material.id,
                    StudentMaterialInteraction.user_id == int(user_id),
                ),
            )
            .where(
                Material.company_id == int(company_id),
                Material.id == int(material_id),
            )
            .limit(1)
        ).first()

        if not row:
            return {
                "material_id": int(material_id),
                "global_view_count": 0,
                "global_download_count": 0,
                "user_view_count": 0,
                "user_download_count": 0,
                "last_viewed_at": None,
                "last_downloaded_at": None,
            }

        d = row._asdict()
        return {
            "material_id": int(d["material_id"]),
            "global_view_count": int(d["global_view_count"] or 0),
            "global_download_count": int(d["global_download_count"] or 0),
            "user_view_count": int(d["user_view_count"] or 0),
            "user_download_count": int(d["user_download_count"] or 0),
            "last_viewed_at": d["last_viewed_at"].isoformat() if d["last_viewed_at"] else None,
            "last_downloaded_at": d["last_downloaded_at"].isoformat() if d["last_downloaded_at"] else None,
        }

    def increment_view(
            self,
            *,
            company_id: int,
            material_id: int,
            user_id: int,
            cooldown_seconds: int = 3600,
    ) -> Dict[str, Any]:
        if not self._material_exists_for_event(
                company_id=company_id,
                material_id=material_id,
                require_downloadable=False,
        ):
            return {
                "counted": False,
                "reason": "Material not found or disabled.",
                **self._interaction_snapshot(
                    company_id=company_id,
                    material_id=material_id,
                    user_id=user_id,
                ),
            }

        cutoff_dt = datetime.now(timezone.utc) - timedelta(seconds=int(cooldown_seconds))

        stmt_user = pg_insert(StudentMaterialInteraction).values(
            company_id=int(company_id),
            user_id=int(user_id),
            material_id=int(material_id),
            is_favorite=False,
            view_count=1,
            download_count=0,
            last_viewed_at=func.now(),
        )

        stmt_user = stmt_user.on_conflict_do_update(
            index_elements=["company_id", "user_id", "material_id"],
            set_={
                "view_count": StudentMaterialInteraction.view_count + 1,
                "last_viewed_at": func.now(),
            },
            where=sa_or(
                StudentMaterialInteraction.last_viewed_at.is_(None),
                StudentMaterialInteraction.last_viewed_at < cutoff_dt,
            ),
        ).returning(StudentMaterialInteraction.material_id)

        user_row = self.s.execute(stmt_user).first()

        if not user_row:
            return {
                "counted": False,
                "reason": "Cooldown active.",
                **self._interaction_snapshot(
                    company_id=company_id,
                    material_id=material_id,
                    user_id=user_id,
                ),
            }

        stmt_global = (
            update(Material)
            .where(
                Material.company_id == int(company_id),
                Material.id == int(material_id),
                Material.is_enabled.is_(True),
            )
            .values(view_count=Material.view_count + 1)
        )
        self.s.execute(stmt_global)
        self.s.flush()

        return {
            "counted": True,
            "reason": None,
            **self._interaction_snapshot(
                company_id=company_id,
                material_id=material_id,
                user_id=user_id,
            ),
        }

    def increment_download(
            self,
            *,
            company_id: int,
            material_id: int,
            user_id: int,
    ) -> Dict[str, Any]:
        if not self._material_exists_for_event(
                company_id=company_id,
                material_id=material_id,
                require_downloadable=True,
        ):
            return {
                "counted": False,
                "reason": "Material not found, disabled, or not downloadable.",
                **self._interaction_snapshot(
                    company_id=company_id,
                    material_id=material_id,
                    user_id=user_id,
                ),
            }

        stmt_user = pg_insert(StudentMaterialInteraction).values(
            company_id=int(company_id),
            user_id=int(user_id),
            material_id=int(material_id),
            is_favorite=False,
            view_count=0,
            download_count=1,
            last_downloaded_at=func.now(),
        )

        stmt_user = stmt_user.on_conflict_do_update(
            index_elements=["company_id", "user_id", "material_id"],
            set_={
                "download_count": StudentMaterialInteraction.download_count + 1,
                "last_downloaded_at": func.now(),
            },
        ).returning(StudentMaterialInteraction.material_id)

        self.s.execute(stmt_user)

        stmt_global = (
            update(Material)
            .where(
                Material.company_id == int(company_id),
                Material.id == int(material_id),
                Material.is_enabled.is_(True),
                Material.is_downloadable.is_(True),
            )
            .values(download_count=Material.download_count + 1)
        )
        self.s.execute(stmt_global)
        self.s.flush()

        return {
            "counted": True,
            "reason": None,
            **self._interaction_snapshot(
                company_id=company_id,
                material_id=material_id,
                user_id=user_id,
            ),
        }

    def set_favorite(
            self,
            *,
            company_id: int,
            material_id: int,
            user_id: int,
            is_favorite: bool,
    ) -> Dict[str, Any]:
        if not self._material_exists_for_event(
                company_id=company_id,
                material_id=material_id,
                require_downloadable=False,
        ):
            return {
                "counted": False,
                "reason": "Material not found or disabled.",
                **self._interaction_snapshot(
                    company_id=company_id,
                    material_id=material_id,
                    user_id=user_id,
                ),
            }

        stmt_user = pg_insert(StudentMaterialInteraction).values(
            company_id=int(company_id),
            user_id=int(user_id),
            material_id=int(material_id),
            is_favorite=bool(is_favorite),
            view_count=0,
            download_count=0,
            last_viewed_at=None,
            last_downloaded_at=None,
        )

        stmt_user = stmt_user.on_conflict_do_update(
            index_elements=["company_id", "user_id", "material_id"],
            set_={
                "is_favorite": bool(is_favorite),
            },
        ).returning(StudentMaterialInteraction.material_id)

        self.s.execute(stmt_user)
        self.s.flush()

        snap = self._interaction_snapshot(
            company_id=company_id,
            material_id=material_id,
            user_id=user_id,
        )

        return {
            "counted": True,
            "reason": None,
            "is_favorite": bool(is_favorite),
            **snap,
        }

    def list_favorite_materials_page(
            self,
            *,
            company_id: int,
            user_id: int,
            page: int,
            per_page: int,
            external_base: str,
    ) -> Tuple[List[Dict[str, Any]], int, int]:
        page = max(int(page or 1), 1)
        allowed = {10, 20, 50, 500}
        per_page = per_page if int(per_page or 20) in allowed else 20

        base = (
            select(Material.id)
            .select_from(StudentMaterialInteraction)
            .join(
                Material,
                and_(
                    Material.id == StudentMaterialInteraction.material_id,
                    Material.company_id == int(company_id),
                ),
            )
            .where(
                StudentMaterialInteraction.company_id == int(company_id),
                StudentMaterialInteraction.user_id == int(user_id),
                StudentMaterialInteraction.is_favorite.is_(True),
                Material.is_enabled.is_(True),
            )
            .order_by(StudentMaterialInteraction.updated_at.desc(), Material.id.desc())
        )

        count_stmt = select(func.count()).select_from(base.order_by(None).subquery())
        total = int(self.s.scalar(count_stmt) or 0)
        pages = max((total + per_page - 1) // per_page, 1)
        page = min(page, pages)
        offset = (page - 1) * per_page

        material_ids = list(self.s.scalars(base.offset(offset).limit(per_page)).all())

        rows: List[Dict[str, Any]] = []
        for mid in material_ids:
            detail_row = self.get_material_detail(company_id=company_id, material_id=int(mid))
            if detail_row:
                rows.append(self.shape_material_list_row(detail_row, external_base=external_base))

        return rows, total, pages