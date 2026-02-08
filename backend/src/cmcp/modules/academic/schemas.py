from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


# ----------------------------
# Faculty
# ----------------------------
class FacultyCreate(BaseModel):
    name: str
    code: Optional[str] = None


class FacultyUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Department
# ----------------------------
class DepartmentCreate(BaseModel):
    faculty_id: int
    name: str
    code: Optional[str] = None


class DepartmentUpdate(BaseModel):
    faculty_id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Academic Year
# ----------------------------
class AcademicYearCreate(BaseModel):
    name: str


class AcademicYearUpdate(BaseModel):
    name: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Semester
# ----------------------------
class SemesterCreate(BaseModel):
    academic_year_id: int
    number: int
    name: Optional[str] = None

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: int):
        if v < 1:
            raise ValueError("Semester number must be at least 1")
        return v


class SemesterUpdate(BaseModel):
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
class CourseCreate(BaseModel):
    department_id: int
    semester_id: int
    title: str
    code: Optional[str] = None
    description: Optional[str] = None


class CourseUpdate(BaseModel):
    department_id: Optional[int] = None
    semester_id: Optional[int] = None
    title: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Chapter
# ----------------------------
class ChapterCreate(BaseModel):
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


class ChapterUpdate(BaseModel):
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
class BulkDeleteIn(BaseModel):
    ids: List[int] = Field(..., min_length=1)
