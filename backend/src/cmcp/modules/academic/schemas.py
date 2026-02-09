from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class _BaseIn(BaseModel):
    # 🚫 reject unknown fields like company_id
    model_config = ConfigDict(extra="forbid")


# ----------------------------
# Faculty
# ----------------------------
class FacultyCreate(_BaseIn):
    name: str
    code: Optional[str] = None


class FacultyUpdate(_BaseIn):
    name: Optional[str] = None
    code: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Department
# ----------------------------
class DepartmentCreate(_BaseIn):
    faculty_id: int
    name: str
    code: Optional[str] = None


class DepartmentUpdate(_BaseIn):
    faculty_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Academic Year
# ----------------------------
class AcademicYearCreate(_BaseIn):
    name: str


class AcademicYearUpdate(_BaseIn):
    name: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Semester
# ----------------------------
class SemesterCreate(_BaseIn):
    academic_year_id: int
    number: int
    name: Optional[str] = None

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: int):
        if v < 1:
            raise ValueError("Semester number must be at least 1")
        return v


class SemesterUpdate(_BaseIn):
    academic_year_id: Optional[int] = None
    number: Optional[int] = None
    name: Optional[str] = None
    is_enabled: Optional[bool] = None

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: Optional[int]):
        if v is not None and v < 1:
            raise ValueError("Semester number must be at least 1")
        return v


# ----------------------------
# Course
# ----------------------------
class CourseCreate(_BaseIn):
    department_id: int
    semester_id: int
    title: str
    code: Optional[str] = None
    description: Optional[str] = None


class CourseUpdate(_BaseIn):
    department_id: Optional[int] = None
    semester_id: Optional[int] = None
    title: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Chapter
# ----------------------------
class ChapterCreate(_BaseIn):
    course_id: int
    number: int
    title: str
    description: Optional[str] = None

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: int):
        if v < 1:
            raise ValueError("Chapter number must be at least 1")
        return v


class ChapterUpdate(_BaseIn):
    course_id: Optional[int] = None
    number: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: Optional[int]):
        if v is not None and v < 1:
            raise ValueError("Chapter number must be at least 1")
        return v


# ----------------------------
# Common
# ----------------------------
class BulkDeleteIn(_BaseIn):
    ids: List[int] = Field(..., min_length=1)
