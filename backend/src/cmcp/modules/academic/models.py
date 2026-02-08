# app/apps/education_academic/models.py
from __future__ import annotations

from typing import Optional

from sqlalchemy import UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel, TenantMixin


class Faculty(BaseModel, TenantMixin):
    __tablename__ = "edu_faculties"

    name: Mapped[str] = mapped_column(db.String(150), nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(db.String(30), nullable=True, index=True)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    departments: Mapped[list["Department"]] = db.relationship(
        "Department",
        back_populates="faculty",
        cascade="all, delete-orphan",
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("company_id", "name", name="uq_edu_faculties_company_name"),
        UniqueConstraint("company_id", "code", name="uq_edu_faculties_company_code"),
    )


class Department(BaseModel, TenantMixin):
    __tablename__ = "edu_departments"

    faculty_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_faculties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(db.String(150), nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(db.String(30), nullable=True, index=True)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    faculty: Mapped["Faculty"] = db.relationship("Faculty", back_populates="departments", lazy="select")

    courses: Mapped[list["Course"]] = db.relationship(
        "Course",
        back_populates="department",
        cascade="all, delete-orphan",
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("company_id", "faculty_id", "name", name="uq_edu_depts_company_faculty_name"),
        UniqueConstraint("company_id", "code", name="uq_edu_depts_company_code"),
    )


class AcademicYear(BaseModel, TenantMixin):
    __tablename__ = "edu_academic_years"

    name: Mapped[str] = mapped_column(
        db.String(20),
        nullable=False,
        index=True,
        comment="e.g. 2025/2026"
    )

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    semesters: Mapped[list["Semester"]] = db.relationship(
        "Semester",
        back_populates="academic_year",
        cascade="all, delete-orphan",
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("company_id", "name", name="uq_edu_years_company_name"),
    )


class Semester(BaseModel, TenantMixin):
    __tablename__ = "edu_semesters"

    academic_year_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_academic_years.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    number: Mapped[int] = mapped_column(
        db.Integer,
        nullable=False,
        index=True,
        comment="1..8 (or any number your university uses)"
    )

    name: Mapped[Optional[str]] = mapped_column(
        db.String(50),
        nullable=True,
        comment="Optional label e.g. 'Semester 1'"
    )

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    academic_year: Mapped["AcademicYear"] = db.relationship("AcademicYear", back_populates="semesters", lazy="select")

    courses: Mapped[list["Course"]] = db.relationship(
        "Course",
        back_populates="semester",
        cascade="all, delete-orphan",
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("company_id", "academic_year_id", "number", name="uq_edu_sem_company_year_number"),
        CheckConstraint("number >= 1", name="ck_edu_sem_number_min"),
    )


class Course(BaseModel, TenantMixin):
    __tablename__ = "edu_courses"

    department_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_departments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    semester_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_semesters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)  # "Python"
    code: Mapped[Optional[str]] = mapped_column(db.String(50), nullable=True, index=True)

    description: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    department: Mapped["Department"] = db.relationship("Department", back_populates="courses", lazy="select")
    semester: Mapped["Semester"] = db.relationship("Semester", back_populates="courses", lazy="select")

    chapters: Mapped[list["Chapter"]] = db.relationship(
        "Chapter",
        back_populates="course",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="Chapter.number.asc()",
    )

    __table_args__ = (
        UniqueConstraint("company_id", "semester_id", "department_id", "title", name="uq_edu_course_scope_title"),
        UniqueConstraint("company_id", "code", name="uq_edu_courses_company_code"),
    )


class Chapter(BaseModel, TenantMixin):
    __tablename__ = "edu_chapters"

    course_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    number: Mapped[int] = mapped_column(db.Integer, nullable=False, index=True)  # Chapter 1,2,3...
    title: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    course: Mapped["Course"] = db.relationship("Course", back_populates="chapters", lazy="select")

    __table_args__ = (
        UniqueConstraint("company_id", "course_id", "number", name="uq_edu_chapters_course_number"),
        CheckConstraint("number >= 1", name="ck_edu_chapters_number_min"),
    )
