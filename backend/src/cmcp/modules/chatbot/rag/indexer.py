from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from cmcp.config.database import db
from cmcp.config.settings import settings
from cmcp.core.exceptions import BusinessValidationError
from cmcp.modules.academic.models import Course, CourseChapter, CourseOffering, Semester
from cmcp.modules.chatbot.models import ChatbotMaterialIndex
from cmcp.modules.chatbot.rag.chunker import chunk_text
from cmcp.modules.chatbot.rag.embeddings import embed_texts, get_embedding_model
from cmcp.modules.chatbot.rag.extractor import (
    _extract_text,
    compute_hash,
    material_filename,
    read_material_file,
)
from cmcp.modules.chatbot.rag.vector_store import add_chunks, delete_material_chunks
from cmcp.modules.materials.models import Material


def normalize_label(value: str) -> str:
    return str(value or "").strip().lower()


def semester_label(semester: Optional[Semester]) -> str:
    if not semester:
        return "Unassigned Semester"
    if semester.name:
        return semester.name.strip()
    return f"Semester {semester.number}"


def _resolve_academic_context(material: Material) -> dict[str, Any]:
    offering: Optional[CourseOffering] = material.course_offering
    course: Optional[Course] = offering.course if offering else None
    chapter: Optional[CourseChapter] = material.chapter
    semester: Optional[Semester] = offering.semester if offering else None
    department = offering.department if offering else None
    faculty = department.faculty if department else None
    academic_year = semester.academic_year if semester else None

    return {
        "company_id": int(material.company_id),
        "material_id": int(material.id),
        "course_id": int(course.id) if course else None,
        "course_offering_id": int(offering.id) if offering else None,
        "chapter_id": int(chapter.id) if chapter else None,
        "semester_id": int(semester.id) if semester else None,
        "department_id": int(department.id) if department else None,
        "faculty_id": int(faculty.id) if faculty else None,
        "academic_year_id": int(academic_year.id) if academic_year else None,
        "material_title": material.title or "",
        "course_title": course.title if course else material.title,
        "course_code": course.code if course else "",
        "chapter_label": f"Chapter {chapter.number}: {chapter.title}" if chapter else "",
        "semester_label": semester_label(semester),
        "subject_name": course.title if course else material.title,
    }


def index_material(material: Material, *, force: bool = False) -> dict[str, Any]:
    ctx = _resolve_academic_context(material)
    file_bytes, filename = read_material_file(material)
    file_hash = compute_hash(file_bytes)

    chunk_size = settings.CHATBOT_CHUNK_SIZE
    chunk_overlap = settings.CHATBOT_CHUNK_OVERLAP
    embedding_provider = settings.CHATBOT_EMBEDDING_PROVIDER
    embedding_model = settings.CHATBOT_EMBEDDING_MODEL

    existing = ChatbotMaterialIndex.query.filter_by(
        company_id=int(material.company_id),
        material_id=int(material.id),
    ).first()

    if (
        existing
        and existing.file_hash == file_hash
        and existing.embedding_model == embedding_model
        and existing.chunk_size == chunk_size
        and existing.chunk_overlap == chunk_overlap
        and existing.index_status == "indexed"
        and not force
    ):
        return {
            "material_id": int(material.id),
            "status": "skipped",
            "chunk_count": int(existing.chunk_count),
            "index_status": existing.index_status,
        }

    if not existing:
        existing = ChatbotMaterialIndex(
            company_id=int(material.company_id),
            material_id=int(material.id),
            file_hash=file_hash,
            chunk_count=0,
            semester_label=normalize_label(ctx["semester_label"]),
            subject_name=ctx["subject_name"],
            source_name=filename,
        )
        db.session.add(existing)

    existing.index_status = "indexing"
    existing.last_error = None
    db.session.flush()

    try:
        delete_material_chunks(int(material.company_id), int(material.id))

        text = _extract_text(file_bytes, filename)
        if not text.strip():
            raise BusinessValidationError("No readable text could be extracted from this material.")

        chunks = chunk_text(text, chunk_size=chunk_size, overlap=chunk_overlap)
        if not chunks:
            raise BusinessValidationError("No useful text chunks could be extracted from this material.")

        model = get_embedding_model()
        embedding_dimension = int(model.get_sentence_embedding_dimension())
        batch_size = 32
        all_vectors: list[list[float]] = []
        for i in range(0, len(chunks), batch_size):
            all_vectors.extend(embed_texts(chunks[i:i + batch_size]))

        ids = [f"mat_{material.id}_{uuid.uuid4().hex[:12]}" for _ in chunks]
        metadatas = [
            {
                "company_id": ctx["company_id"],
                "material_id": ctx["material_id"],
                "course_id": ctx["course_id"] or 0,
                "course_offering_id": ctx["course_offering_id"] or 0,
                "chapter_id": ctx["chapter_id"] or 0,
                "semester_id": ctx["semester_id"] or 0,
                "department_id": ctx["department_id"] or 0,
                "faculty_id": ctx["faculty_id"] or 0,
                "academic_year_id": ctx["academic_year_id"] or 0,
                "chunk_index": idx,
                "source_name": filename,
                "material_title": ctx["material_title"],
                "course_title": ctx["course_title"],
                "course_code": ctx["course_code"] or "",
                "chapter_label": ctx["chapter_label"] or "",
                "semester_label": ctx["semester_label"],
            }
            for idx, _chunk in enumerate(chunks)
        ]

        add_chunks(chunks=chunks, vectors=all_vectors, metadatas=metadatas, ids=ids)

        existing.file_hash = file_hash
        existing.chunk_count = len(chunks)
        existing.semester_label = normalize_label(ctx["semester_label"])
        existing.subject_name = ctx["subject_name"]
        existing.source_name = filename
        existing.course_id = ctx["course_id"]
        existing.course_offering_id = ctx["course_offering_id"]
        existing.chapter_id = ctx["chapter_id"]
        existing.semester_id = ctx["semester_id"]
        existing.department_id = ctx["department_id"]
        existing.faculty_id = ctx["faculty_id"]
        existing.academic_year_id = ctx["academic_year_id"]
        existing.embedding_provider = embedding_provider
        existing.embedding_model = embedding_model
        existing.embedding_dimension = embedding_dimension
        existing.chunk_size = chunk_size
        existing.chunk_overlap = chunk_overlap
        existing.index_status = "indexed"
        existing.indexed_at = datetime.now(timezone.utc)
        existing.last_error = None
        db.session.flush()

        return {
            "material_id": int(material.id),
            "status": "indexed",
            "chunk_count": len(chunks),
            "index_status": "indexed",
        }
    except Exception as exc:
        existing.index_status = "failed"
        existing.last_error = str(exc)
        db.session.flush()
        raise
