# app/apps/education_academic/models.py
from __future__ import annotations

from typing import Optional

from sqlalchemy import UniqueConstraint, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel, TenantMixin
from sqlalchemy import UniqueConstraint, CheckConstraint, Index, text

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

    faculty: Mapped["Faculty"] = db.relationship(
        "Faculty",
        back_populates="departments",
        lazy="select",
    )

    # A department can offer many course offerings
    course_offerings: Mapped[list["CourseOffering"]] = db.relationship(
        "CourseOffering",
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
        comment="e.g. 2025/2026",
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
        comment="1..8 (or any number your university uses)",
    )

    name: Mapped[Optional[str]] = mapped_column(
        db.String(50),
        nullable=True,
        comment="Optional label e.g. 'Semester 1'",
    )

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    academic_year: Mapped["AcademicYear"] = db.relationship(
        "AcademicYear",
        back_populates="semesters",
        lazy="select",
    )

    course_offerings: Mapped[list["CourseOffering"]] = db.relationship(
        "CourseOffering",
        back_populates="semester",
        cascade="all, delete-orphan",
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("company_id", "academic_year_id", "number", name="uq_edu_sem_company_year_number"),
        CheckConstraint("number >= 1", name="ck_edu_sem_number_min"),
    )


class Course(BaseModel, TenantMixin):
    """
    The reusable course definition/blueprint.
    e.g. "Mathematics 101", "Introduction to Networks".

    This has NO department and NO semester attached.
    Both the Computer Applications dept AND the Networks dept
    can point to the SAME Course record — no duplication.
    """
    __tablename__ = "edu_courses"

    title: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(db.String(50), nullable=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    # One course definition can have many offerings across departments/semesters
    offerings: Mapped[list["CourseOffering"]] = db.relationship(
        "CourseOffering",
        back_populates="course",
        cascade="all, delete-orphan",
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("company_id", "title", name="uq_edu_courses_company_title"),
        UniqueConstraint("company_id", "code", name="uq_edu_courses_company_code"),
    )
class CourseOffering(BaseModel, TenantMixin):
    __tablename__ = "edu_course_offerings"

    course_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    department_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_departments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    semester_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_semesters.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    custom_title: Mapped[Optional[str]] = mapped_column(db.String(200), nullable=True)
    credit_hours: Mapped[Optional[int]] = mapped_column(db.Integer, nullable=True)

    is_enabled: Mapped[bool] = mapped_column(
        db.Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    course: Mapped["Course"] = db.relationship(
        "Course",
        back_populates="offerings",
        lazy="select",
    )

    department: Mapped["Department"] = db.relationship(
        "Department",
        back_populates="course_offerings",
        lazy="select",
    )

    semester: Mapped["Semester"] = db.relationship(
        "Semester",
        back_populates="course_offerings",
        lazy="select",
    )

    chapters: Mapped[list["CourseChapter"]] = db.relationship(
        "CourseChapter",
        back_populates="course_offering",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="CourseChapter.number.asc()",
    )

    # Important:
    # Do not use cascade="all, delete-orphan" here.
    # Materials are learning records and should not be accidentally deleted
    # when an offering is deleted.
    materials: Mapped[list["Material"]] = db.relationship(
        "Material",
        back_populates="course_offering",
        lazy="select",
    )

    __table_args__ = (
        # PostgreSQL-safe uniqueness for nullable semester_id.
        # Normal UniqueConstraint does not protect NULL semester_id duplicates.
        Index(
            "uq_edu_course_offering_scope_no_semester",
            "company_id",
            "course_id",
            "department_id",
            unique=True,
            postgresql_where=text("semester_id IS NULL"),
        ),
        Index(
            "uq_edu_course_offering_scope_with_semester",
            "company_id",
            "course_id",
            "department_id",
            "semester_id",
            unique=True,
            postgresql_where=text("semester_id IS NOT NULL"),
        ),
        CheckConstraint(
            "(credit_hours IS NULL) OR (credit_hours >= 0)",
            name="ck_edu_course_offering_credit_hours_min",
        ),
        Index("ix_edu_course_offerings_company_department", "company_id", "department_id"),
        Index("ix_edu_course_offerings_company_semester", "company_id", "semester_id"),
        Index("ix_edu_course_offerings_company_course", "company_id", "course_id"),
    )

class CourseChapter(BaseModel, TenantMixin):
    __tablename__ = "edu_course_chapters"

    course_offering_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_course_offerings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    number: Mapped[int] = mapped_column(db.Integer, nullable=False, index=True)
    title: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    course_offering: Mapped["CourseOffering"] = db.relationship(
        "CourseOffering",
        back_populates="chapters",
        lazy="select",
    )

    materials: Mapped[list["Material"]] = db.relationship(
        "Material",
        back_populates="chapter",
        lazy="select",
    )

    __table_args__ = (
        # THIS line right here guarantees no duplicate numbers inside the SAME offering.
        # But allows other offerings to reuse the same numbers!
        UniqueConstraint(
            "company_id", "course_offering_id", "number",
            name="uq_edu_course_chapters_offering_number",
        ),
        CheckConstraint("number >= 1", name="ck_edu_course_chapters_number_min"),
    )