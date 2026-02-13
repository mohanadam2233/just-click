# app/apps/education_people/models.py
from __future__ import annotations

from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel, TenantMixin


class Classroom(BaseModel, TenantMixin):
    __tablename__ = "edu_classrooms"

    name: Mapped[str] = mapped_column(db.String(50), nullable=False, index=True)  # "CA222"
    room_number: Mapped[Optional[str]] = mapped_column(db.String(50), nullable=True, index=True)
    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("company_id", "name", name="uq_classrooms_company_name"),
    )
# hello it's me zahra

class StudentProfile(BaseModel, TenantMixin):
    __tablename__ = "student_profiles"

    user_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,
    )

    full_name: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)

    student_id: Mapped[str] = mapped_column(
        db.String(60),
        nullable=False,
        index=True,
        comment="University-issued Student ID",
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

    classroom_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_classrooms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Optional: save their current semester number/grouping
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


class StaffProfile(BaseModel, TenantMixin):
    """
    For TEACHER / STAFF / ADMIN (any non-student user).
    """
    __tablename__ = "staff_profiles"

    user_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,
    )

    full_name: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)

    staff_id: Mapped[Optional[str]] = mapped_column(
        db.String(60),
        nullable=True,
        index=True,
        comment="Optional university staff/teacher ID",
    )

    faculty_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_faculties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    department_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("company_id", "staff_id", name="uq_staff_profiles_company_staff_id"),
    )
