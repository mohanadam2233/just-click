from __future__ import annotations

import uuid
from typing import Any, Optional

from flask import g
from sqlalchemy import select

from cmcp.config.database import db
from cmcp.core.exceptions import BusinessValidationError, NotFoundError
from cmcp.modules.academic.models import Course, CourseOffering, Semester
from cmcp.modules.chatbot.models import ChatMessage, ChatSession
from cmcp.modules.chatbot.rag import answer_question, index_material, normalize_label, semester_label
from cmcp.modules.materials.models import Material


class ChatbotService:
    def _user_id(self) -> int:
        user = getattr(g, "current_user", None) or {}
        user_id = user.get("user_id") or user.get("id")
        if not user_id:
            raise BusinessValidationError("Authenticated user is missing.")
        return int(user_id)

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

    def _subject_materials(self, *, company_id: int, semester: str, subject: str) -> list[Material]:
        norm_semester = normalize_label(semester)
        stmt = (
            select(Material)
            .join(CourseOffering, CourseOffering.id == Material.course_offering_id)
            .join(Course, Course.id == CourseOffering.course_id)
            .outerjoin(Semester, Semester.id == CourseOffering.semester_id)
            .where(
                Material.company_id == int(company_id),
                Material.is_enabled.is_(True),
                Material.file_url.is_not(None),
                Course.title == subject,
            )
            .order_by(Material.id.asc())
        )
        return [
            material
            for material in db.session.scalars(stmt).all()
            if normalize_label(semester_label(material.course_offering.semester if material.course_offering else None)) == norm_semester
        ]

    def ensure_subject_indexed(self, *, company_id: int, semester: str, subject: str) -> dict[str, Any]:
        materials = self._subject_materials(company_id=company_id, semester=semester, subject=subject)
        indexed = []
        skipped = []
        failed = []
        for material in materials:
            try:
                result = index_material(material, force=False)
                if result["status"] == "indexed":
                    indexed.append(result)
                else:
                    skipped.append(result)
            except Exception as exc:
                failed.append({"material_id": int(material.id), "message": str(exc)})
        return {"indexed": indexed, "skipped": skipped, "failed": failed}

    def ask(self, *, company_id: int, session_id: str, question: str, semester: str, subject: str) -> dict[str, Any]:
        session = self._get_session(company_id=company_id, session_id=session_id)
        question = (question or "").strip()
        semester = (semester or "").strip()
        subject = (subject or "").strip()
        if not question or not semester or not subject:
            raise BusinessValidationError("Question, semester, and subject are required.")

        db.session.add(ChatMessage(
            company_id=int(company_id),
            session_id=session.id,
            role_name="user",
            message_text=question,
        ))
        db.session.flush()

        self.ensure_subject_indexed(company_id=company_id, semester=semester, subject=subject)
        result = answer_question(int(company_id), session.id, semester, subject, question)

        db.session.add(ChatMessage(
            company_id=int(company_id),
            session_id=session.id,
            role_name="assistant",
            message_text=result.get("answer") or "",
        ))
        db.session.flush()
        return result

    def index_material(self, *, company_id: int, material_id: int, force: bool = False) -> dict[str, Any]:
        material = db.session.get(Material, int(material_id))
        if not material or int(material.company_id) != int(company_id):
            raise NotFoundError("Material not found.")
        return index_material(material, force=force)

    def index_subject(self, *, company_id: int, semester: str, subject: str, force: bool = False) -> dict[str, Any]:
        materials = self._subject_materials(company_id=company_id, semester=semester, subject=subject)
        results = []
        for material in materials:
            results.append(index_material(material, force=force))
        return {"results": results}
