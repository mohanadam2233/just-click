# src/cmcp/modules/academic/schemas.py
from __future__ import annotations

from typing import Optional, List, Dict, Any
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
        if v > 12:
            raise ValueError("Semester number cannot exceed 12")
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
        if v is not None and v > 12:
            raise ValueError("Semester number cannot exceed 12")
        return v


# ----------------------------
# Course (Base Course Definition - UPDATED)
# ----------------------------
class CourseCreate(_BaseIn):
    title: str
    code: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = True


class CourseUpdate(_BaseIn):
    title: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None


# ----------------------------
# Course Offering (NEW)
# ----------------------------
class CourseOfferingCreate(_BaseIn):
    course_id: int
    department_id: int
    semester_id: int
    custom_title: Optional[str] = None
    credit_hours: Optional[int] = None
    is_enabled: Optional[bool] = True

    @field_validator("credit_hours")
    @classmethod
    def validate_credit_hours(cls, v: Optional[int]):
        if v is not None and v < 0:
            raise ValueError("Credit hours cannot be negative")
        if v is not None and v > 30:
            raise ValueError("Credit hours cannot exceed 30")
        return v


class CourseOfferingUpdate(_BaseIn):
    course_id: Optional[int] = None
    department_id: Optional[int] = None
    semester_id: Optional[int] = None
    custom_title: Optional[str] = None
    credit_hours: Optional[int] = None
    is_enabled: Optional[bool] = None

    @field_validator("credit_hours")
    @classmethod
    def validate_credit_hours(cls, v: Optional[int]):
        if v is not None and v < 0:
            raise ValueError("Credit hours cannot be negative")
        if v is not None and v > 30:
            raise ValueError("Credit hours cannot exceed 30")
        return v


# ----------------------------
# Course Chapter (UPDATED - belongs to offering)
# ----------------------------
class CourseChapterCreate(_BaseIn):
    course_offering_id: int
    number: int
    title: str
    description: Optional[str] = None
    is_enabled: Optional[bool] = True

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: int):
        if v < 1:
            raise ValueError("Chapter number must be at least 1")
        return v


class CourseChapterUpdate(_BaseIn):
    course_offering_id: Optional[int] = None
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


class CourseChapterNestedCreate(_BaseIn):
    id: Optional[int] = None
    number: int
    title: str
    description: Optional[str] = None
    is_enabled: Optional[bool] = True

    @field_validator("number")
    @classmethod
    def validate_number(cls, v: int):
        if v < 1:
            raise ValueError("Chapter number must be at least 1")
        return v


class CourseOfferingCreateNested(_BaseIn):
    course_id: int
    department_id: int
    semester_id: int
    custom_title: Optional[str] = None
    credit_hours: Optional[int] = None
    is_enabled: Optional[bool] = True
    chapters: Optional[List[CourseChapterNestedCreate]] = None

    @field_validator("credit_hours")
    @classmethod
    def validate_credit_hours(cls, v: Optional[int]):
        if v is not None and v < 0:
            raise ValueError("Credit hours cannot be negative")
        if v is not None and v > 30:
            raise ValueError("Credit hours cannot exceed 30")
        return v


class CourseOfferingForCourseCreate(_BaseIn):
    department_id: int
    semester_id: int
    custom_title: Optional[str] = None
    credit_hours: Optional[int] = None
    is_enabled: Optional[bool] = True
    chapters: Optional[List[CourseChapterNestedCreate]] = None

    @field_validator("credit_hours")
    @classmethod
    def validate_credit_hours(cls, v: Optional[int]):
        if v is not None and v < 0:
            raise ValueError("Credit hours cannot be negative")
        if v is not None and v > 30:
            raise ValueError("Credit hours cannot exceed 30")
        return v


class CourseOfferingUpdateWithChapters(CourseOfferingUpdate):
    chapters: Optional[List[CourseChapterNestedCreate]] = None
    chapter_missing_row_action: Optional[str] = "disable"


class CourseCreateNested(CourseCreate):
    offerings: Optional[List[CourseOfferingForCourseCreate]] = None


class CourseOfferingBulkCreate(_BaseIn):
    course_id: Optional[int] = None
    offerings: List[CourseOfferingForCourseCreate] = Field(..., min_length=1)


class CourseOfferingBulkUpdate(_BaseIn):
    ids: List[int] = Field(..., min_length=1)
    patch: Dict[str, Any] = Field(..., min_length=1)


# ----------------------------
# Common
# ----------------------------
class BulkDeleteIn(_BaseIn):
    ids: List[int] = Field(..., min_length=1)
