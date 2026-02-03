from __future__ import annotations

from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel, TenantMixin


class Classroom(BaseModel, TenantMixin):
    """
    Example: CA222 (class group).
    """
    __tablename__ = "edu_classrooms"

    name: Mapped[str] = mapped_column(db.String(50), nullable=False, index=True)  # "CA222"
    room_number: Mapped[Optional[str]] = mapped_column(db.String(50), nullable=True, index=True)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("company_id", "name", name="uq_classrooms_company_name"),
    )


class StudentProfile(BaseModel, TenantMixin):
    __tablename__ = "student_profiles"

    user_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,
    )
    # "Student ID get from university"
    student_id: Mapped[str] = mapped_column(
        db.String(60),
        nullable=False,
        index=True,
        comment="University-issued Student ID"
    )

    faculty_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_faculties.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    department_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_departments.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    # "Class room name... like CA222"
    classroom_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_classrooms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Optional: if you want to save their current semester
    semester_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_semesters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("company_id", "student_id", name="uq_student_profiles_company_student_id"),
    )
