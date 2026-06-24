from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from flask import g
from sqlalchemy import select

from cmcp.config.database import db
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.modules.academic.models import Course, CourseOffering, Semester
from cmcp.modules.chatbot.jobs import is_indexable_material, schedule_index_job, schedule_index_for_material
from cmcp.modules.chatbot.models import ChatbotIndexJob, ChatbotMaterialIndex, ChatMessage, ChatSession
from cmcp.modules.chatbot.rag import (
    answer_material_question,
    index_material,
    material_where_filter,
    normalize_label,
    semester_label,
)
from cmcp.modules.materials.models import Material
from cmcp.modules.materials.repository import MaterialsRepo


class ChatbotService:
    def __init__(self):
        self.materials_repo = MaterialsRepo()

    def _user_id(self) -> int:
        user = getattr(g, "current_user", None) or {}
        user_id = user.get("user_id") or user.get("id")
        if not user_id:
            raise BusinessValidationError("Authenticated user is missing.")
        return int(user_id)

    def _validate_material_access(self, *, company_id: int, material_id: int) -> Material:
        row = self.materials_repo.get_material_detail(
            company_id=company_id,
            material_id=material_id,
        )
        if not row:
            reason = self.materials_repo.get_student_material_access_message(
                company_id=company_id,
                material_id=material_id,
            )
            raise NotFoundError(reason or "Material not found.")

        material = db.session.get(Material, int(material_id))
        if not material or int(material.company_id) != int(company_id):
            raise NotFoundError("Material not found.")
        return material

    def _resolve_material_context(self, material: Material) -> dict[str, Any]:
        offering: Optional[CourseOffering] = material.course_offering
        course: Optional[Course] = offering.course if offering else None
        chapter = material.chapter
        semester: Optional[Semester] = offering.semester if offering else None
        department = offering.department if offering else None
        faculty = department.faculty if department else None
        academic_year = semester.academic_year if semester else None

        sem_label = semester_label(semester)
        course_title = course.title if course else material.title

        return {
            "material_id": int(material.id),
            "material_title": material.title,
            "course_id": int(course.id) if course else None,
            "course_offering_id": int(offering.id) if offering else None,
            "chapter_id": int(chapter.id) if chapter else None,
            "semester_id": int(semester.id) if semester else None,
            "department_id": int(department.id) if department else None,
            "faculty_id": int(faculty.id) if faculty else None,
            "academic_year_id": int(academic_year.id) if academic_year else None,
            "semester_label": sem_label,
            "subject_name": course_title,
            "course_title": course_title,
            "course_code": course.code if course else "",
            "chapter_label": f"Chapter {chapter.number}: {chapter.title}" if chapter else "",
            "display": {
                "material_title": material.title,
                "course_title": course_title,
                "course_code": course.code if course else "",
                "chapter_label": f"Chapter {chapter.number}: {chapter.title}" if chapter else "",
                "semester_label": sem_label,
            },
        }

    def _index_status_for_material(self, *, company_id: int, material_id: int) -> dict[str, Any]:
        row = ChatbotMaterialIndex.query.filter_by(
            company_id=int(company_id),
            material_id=int(material_id),
        ).first()
        if not row:
            return {
                "material_id": int(material_id),
                "index_status": "pending",
                "indexed_at": None,
                "chunk_count": 0,
                "last_error": None,
            }
        return {
            "material_id": int(material_id),
            "index_status": row.index_status,
            "indexed_at": row.indexed_at.isoformat() if row.indexed_at else None,
            "chunk_count": int(row.chunk_count or 0),
            "last_error": row.last_error,
        }

    def list_semesters(self, *, company_id: int) -> list[str]:
        stmt = (
            select(Semester)
            .join(CourseOffering, CourseOffering.semester_id == Semester.id)
            .join(Material, Material.course_offering_id == CourseOffering.id)
            .where(
                Material.company_id == int(company_id),
                Material.is_enabled.is_(True),
                Material.file_url.is_not(None),
            )
            .distinct()
            .order_by(Semester.number.asc())
        )
        rows = db.session.scalars(stmt).all()
        labels = [semester_label(row) for row in rows]
        return list(dict.fromkeys(labels))

    def list_subjects(self, *, company_id: int, semester: str) -> list[str]:
        norm_semester = normalize_label(semester)
        stmt = (
            select(Course.title, Semester)
            .join(CourseOffering, CourseOffering.course_id == Course.id)
            .join(Material, Material.course_offering_id == CourseOffering.id)
            .outerjoin(Semester, Semester.id == CourseOffering.semester_id)
            .where(
                Material.company_id == int(company_id),
                Material.is_enabled.is_(True),
                Material.file_url.is_not(None),
            )
            .order_by(Course.title.asc())
        )
        subjects = []
        for title, sem in db.session.execute(stmt).all():
            if normalize_label(semester_label(sem)) == norm_semester:
                subjects.append(title)
        return sorted(set(subjects), key=str.lower)

    def create_material_session(
        self,
        *,
        company_id: int,
        material_id: int,
        scope: str = "material",
    ) -> dict[str, Any]:
        material = self._validate_material_access(company_id=company_id, material_id=material_id)
        ctx = self._resolve_material_context(material)
        scope = (scope or "material").strip().lower() or "material"

        session_id = uuid.uuid4().hex
        vector_filter = material_where_filter(int(company_id), int(material_id))

        session = ChatSession(
            id=session_id,
            company_id=int(company_id),
            user_id=self._user_id(),
            semester_label=ctx["semester_label"],
            subject_name=ctx["subject_name"],
            title=ctx["material_title"],
            material_id=int(material_id),
            course_id=ctx["course_id"],
            course_offering_id=ctx["course_offering_id"],
            chapter_id=ctx["chapter_id"],
            semester_id=ctx["semester_id"],
            department_id=ctx["department_id"],
            faculty_id=ctx["faculty_id"],
            academic_year_id=ctx["academic_year_id"],
            scope=scope,
            context_json=ctx["display"],
            vector_filter_json=vector_filter,
        )
        db.session.add(session)
        db.session.flush()

        index_status = self._index_status_for_material(company_id=company_id, material_id=material_id)
        return {
            "session_id": session_id,
            "context": ctx["display"],
            "index_status": index_status["index_status"],
        }

    def create_session(self, *, company_id: int, semester: str, subject: str) -> dict[str, Any]:
        semester = (semester or "").strip()
        subject = (subject or "").strip()
        if not semester or not subject:
            raise BusinessValidationError("Semester and subject are required.")

        session_id = uuid.uuid4().hex
        session = ChatSession(
            id=session_id,
            company_id=int(company_id),
            user_id=self._user_id(),
            semester_label=semester,
            subject_name=subject,
            title=f"{subject} - {semester}",
            scope="subject",
        )
        db.session.add(session)
        db.session.flush()
        return {"session_id": session_id}

    def _get_session(self, *, company_id: int, session_id: str) -> ChatSession:
        session = db.session.get(ChatSession, session_id)
        if not session or int(session.company_id) != int(company_id) or int(session.user_id) != self._user_id():
            raise NotFoundError("Chat session not found.")
        return session

    def history(self, *, company_id: int, session_id: str) -> list[dict[str, str]]:
        session = self._get_session(company_id=company_id, session_id=session_id)
        return [
            {"role": row.role_name, "content": row.message_text}
            for row in session.messages
        ]

    def delete_session(self, *, company_id: int, session_id: str) -> dict[str, Any]:
        session = self._get_session(company_id=company_id, session_id=session_id)
        db.session.delete(session)
        db.session.flush()
        return {"session_id": session_id}

    def get_index_status(self, *, company_id: int, material_id: int) -> tuple[dict[str, Any], bool]:
        material = self._validate_material_access(company_id=company_id, material_id=material_id)
        status = self._index_status_for_material(company_id=company_id, material_id=material_id)
        queued = False

        if status["index_status"] in ("pending", "failed", "stale") and is_indexable_material(material):
            active_job = ChatbotIndexJob.query.filter(
                ChatbotIndexJob.company_id == int(company_id),
                ChatbotIndexJob.material_id == int(material_id),
                ChatbotIndexJob.status.in_(["pending", "processing"]),
            ).first()
            if not active_job:
                schedule_index_for_material(material, trigger_type="system_reindex")
                queued = True
                if status["index_status"] == "pending":
                    status["index_status"] = "indexing"

        return status, queued

    def ask(self, *, company_id: int, session_id: str, question: str) -> dict[str, Any]:
        session = self._get_session(company_id=company_id, session_id=session_id)
        question = (question or "").strip()
        if not question:
            raise BusinessValidationError("Question is required.")

        if not session.material_id:
            raise BusinessValidationError("This session is not linked to a material.")

        material_id = int(session.material_id)
        self._validate_material_access(company_id=company_id, material_id=material_id)

        index_row = ChatbotMaterialIndex.query.filter_by(
            company_id=int(company_id),
            material_id=material_id,
        ).first()
        if not index_row or index_row.index_status != "indexed":
            return {
                "answer": "AI is still preparing this material. Please try again shortly.",
                "sources": [],
                "mode_used": "auto",
            }

        db.session.add(ChatMessage(
            company_id=int(company_id),
            session_id=session.id,
            role_name="user",
            message_text=question,
        ))
        db.session.flush()

        material_title = (session.context_json or {}).get("material_title") or session.title or "this material"
        result = answer_material_question(
            company_id=int(company_id),
            material_id=material_id,
            session_id=session.id,
            question=question,
            material_title=material_title,
        )

        db.session.add(ChatMessage(
            company_id=int(company_id),
            session_id=session.id,
            role_name="assistant",
            message_text=result.get("answer") or "",
        ))
        db.session.flush()
        return result

    def enqueue_reindex_material(
        self,
        *,
        company_id: int,
        material_id: int,
        trigger_type: str = "manual_reindex",
    ) -> dict[str, Any]:
        material = db.session.get(Material, int(material_id))
        if not material or int(material.company_id) != int(company_id):
            raise NotFoundError("Material not found.")
        job = schedule_index_for_material(
            material,
            trigger_type=trigger_type,
            requested_by_user_id=self._user_id(),
        )
        if not job:
            raise BusinessValidationError("This material cannot be indexed.")
        return {"job_id": int(job.id), "material_id": int(material_id), "status": job.status}

    def enqueue_index_missing(self, *, company_id: int) -> dict[str, Any]:
        indexed_ids = {
            row.material_id
            for row in ChatbotMaterialIndex.query.filter_by(company_id=int(company_id)).all()
        }
        materials = Material.query.filter(
            Material.company_id == int(company_id),
            Material.is_enabled.is_(True),
            Material.file_url.is_not(None),
        ).all()
        count = 0
        for material in materials:
            if int(material.id) in indexed_ids:
                continue
            if schedule_index_for_material(material, trigger_type="system_reindex"):
                count += 1
        return {"queued": count}

    def enqueue_reindex_failed(self, *, company_id: int) -> dict[str, Any]:
        rows = ChatbotMaterialIndex.query.filter_by(
            company_id=int(company_id),
            index_status="failed",
        ).all()
        count = 0
        for row in rows:
            schedule_index_job(
                company_id=int(company_id),
                material_id=int(row.material_id),
                trigger_type="system_reindex",
                requested_by_user_id=self._user_id(),
            )
            count += 1
        return {"queued": count}

    def enqueue_reindex_stale(self, *, company_id: int) -> dict[str, Any]:
        rows = ChatbotMaterialIndex.query.filter(
            ChatbotMaterialIndex.company_id == int(company_id),
            ChatbotMaterialIndex.index_status.in_(["stale", "pending"]),
        ).all()
        count = 0
        for row in rows:
            schedule_index_job(
                company_id=int(company_id),
                material_id=int(row.material_id),
                trigger_type="system_reindex",
                requested_by_user_id=self._user_id(),
            )
            count += 1
        return {"queued": count}

    def index_material(self, *, company_id: int, material_id: int, force: bool = False) -> dict[str, Any]:
        material = db.session.get(Material, int(material_id))
        if not material or int(material.company_id) != int(company_id):
            raise NotFoundError("Material not found.")
        return index_material(material, force=force)

    def claim_next_index_job(self) -> Optional[ChatbotIndexJob]:
        stmt = (
            select(ChatbotIndexJob)
            .where(ChatbotIndexJob.status == "pending")
            .order_by(ChatbotIndexJob.created_at.asc())
            .limit(1)
            .with_for_update(skip_locked=True)
        )
        job = db.session.scalars(stmt).first()
        if not job:
            return None
        job.status = "processing"
        job.attempt_count = int(job.attempt_count or 0) + 1
        job.started_at = datetime.now(timezone.utc)
        db.session.flush()
        return job

    def process_index_job(self, job: ChatbotIndexJob) -> None:
        material = db.session.get(Material, int(job.material_id))
        if not material:
            job.status = "failed"
            job.error_message = "Material not found."
            job.finished_at = datetime.now(timezone.utc)
            return

        try:
            index_material(material, force=True)
            job.status = "completed"
            job.error_message = None
            job.finished_at = datetime.now(timezone.utc)
        except Exception as exc:
            from cmcp.config.settings import settings

            max_attempts = int(settings.CHATBOT_INDEX_WORKER_MAX_ATTEMPTS)
            job.status = "failed" if int(job.attempt_count) >= max_attempts else "pending"
            job.error_message = str(exc)
            job.finished_at = datetime.now(timezone.utc)
