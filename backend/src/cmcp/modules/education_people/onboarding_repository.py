from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from cmcp.config.database import db
from cmcp.modules.auth.models import User, UserStatusEnum, UserTypeEnum, UserAffiliation
from cmcp.modules.academic.models import Faculty, Department, Semester, AcademicYear
from cmcp.modules.education_people.models import StudentProfile, Classroom


@dataclass
class OnboardingStudentRow:
    user_id: int
    profile_id: int
    username: str
    email: str
    status: str
    user_is_enabled: bool
    profile_is_enabled: bool
    email_verified_at: Any
    approved_at: Any
    rejected_at: Any
    created_at: Any
    updated_at: Any

    full_name: str
    student_id: str

    faculty_id: Optional[int]
    faculty_name: Optional[str]
    department_id: Optional[int]
    department_name: Optional[str]
    semester_id: Optional[int]
    semester_name: Optional[str]
    semester_number: Optional[int]
    academic_year_id: Optional[int]
    academic_year_name: Optional[str]
    classroom_id: Optional[int]
    classroom_name: Optional[str]
    classroom_room_number: Optional[str]

    affiliation_id: Optional[int]
    affiliation_is_enabled: Optional[bool]


class OnboardingQueueRepository:
    def __init__(self, session: Optional[Session] = None):
        self.s: Session = session or db.session

    def _status_value(self, status) -> str:
        return getattr(status, "value", str(status)).lower()

    def _base_stmt(self, *, company_id: int):
        cid = int(company_id)

        return (
            select(
                User.id.label("user_id"),
                StudentProfile.id.label("profile_id"),
                User.username,
                User.email,
                User.status,
                User.is_enabled.label("user_is_enabled"),
                StudentProfile.is_enabled.label("profile_is_enabled"),
                User.email_verified_at,
                User.approved_at,
                User.rejected_at,
                User.created_at,
                User.updated_at,
                StudentProfile.full_name,
                StudentProfile.student_id,
                Faculty.id.label("faculty_id"),
                Faculty.name.label("faculty_name"),
                Department.id.label("department_id"),
                Department.name.label("department_name"),
                Semester.id.label("semester_id"),
                Semester.name.label("semester_name"),
                Semester.number.label("semester_number"),
                AcademicYear.id.label("academic_year_id"),
                AcademicYear.name.label("academic_year_name"),
                Classroom.id.label("classroom_id"),
                Classroom.name.label("classroom_name"),
                Classroom.room_number.label("classroom_room_number"),
                UserAffiliation.id.label("affiliation_id"),
                UserAffiliation.is_enabled.label("affiliation_is_enabled"),
            )
            .select_from(StudentProfile)
            .join(User, User.id == StudentProfile.user_id)
            .outerjoin(
                Faculty,
                and_(
                    Faculty.id == StudentProfile.faculty_id,
                    Faculty.company_id == cid,
                ),
            )
            .outerjoin(
                Department,
                and_(
                    Department.id == StudentProfile.department_id,
                    Department.company_id == cid,
                ),
            )
            .outerjoin(
                Semester,
                and_(
                    Semester.id == StudentProfile.semester_id,
                    Semester.company_id == cid,
                ),
            )
            .outerjoin(
                AcademicYear,
                and_(
                    AcademicYear.id == Semester.academic_year_id,
                    AcademicYear.company_id == cid,
                ),
            )
            .outerjoin(
                Classroom,
                and_(
                    Classroom.id == StudentProfile.classroom_id,
                    Classroom.company_id == cid,
                ),
            )
            .outerjoin(
                UserAffiliation,
                and_(
                    UserAffiliation.user_id == User.id,
                    UserAffiliation.company_id == cid,
                    UserAffiliation.linked_entity_id == StudentProfile.id,
                ),
            )
            .where(
                StudentProfile.company_id == cid,
                User.user_type == UserTypeEnum.STUDENT,
            )
        )

    def _apply_filters(self, stmt, filters: Dict[str, Any]):
        status = (filters.get("status") or "pending_approval").strip().lower()

        if status not in {"all", "pending", "pending_email", "pending_approval", "active", "rejected"}:
            status = "pending_approval"

        if status == "pending":
            stmt = stmt.where(
                User.status.in_(
                    [
                        UserStatusEnum.PENDING_EMAIL,
                        UserStatusEnum.PENDING_APPROVAL,
                    ]
                )
            )
        elif status == "pending_email":
            stmt = stmt.where(User.status == UserStatusEnum.PENDING_EMAIL)
        elif status == "pending_approval":
            stmt = stmt.where(User.status == UserStatusEnum.PENDING_APPROVAL)
        elif status == "active":
            stmt = stmt.where(User.status == UserStatusEnum.ACTIVE)
        elif status == "rejected":
            stmt = stmt.where(User.status == UserStatusEnum.REJECTED)

        if filters.get("faculty_id"):
            stmt = stmt.where(StudentProfile.faculty_id == int(filters["faculty_id"]))

        if filters.get("department_id"):
            stmt = stmt.where(StudentProfile.department_id == int(filters["department_id"]))

        if filters.get("semester_id"):
            stmt = stmt.where(StudentProfile.semester_id == int(filters["semester_id"]))

        if filters.get("classroom_id"):
            stmt = stmt.where(StudentProfile.classroom_id == int(filters["classroom_id"]))

        verified = filters.get("email_verified")
        if verified is True:
            stmt = stmt.where(User.email_verified_at.isnot(None))
        elif verified is False:
            stmt = stmt.where(User.email_verified_at.is_(None))

        search = (filters.get("search") or "").strip()
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(func.coalesce(StudentProfile.full_name, "")).like(like),
                    func.lower(func.coalesce(StudentProfile.student_id, "")).like(like),
                    func.lower(func.coalesce(User.username, "")).like(like),
                    func.lower(func.coalesce(User.email, "")).like(like),
                    func.lower(func.coalesce(Department.name, "")).like(like),
                    func.lower(func.coalesce(Faculty.name, "")).like(like),
                )
            )

        return stmt

    def list_onboarding_students_page(
        self,
        *,
        company_id: int,
        page: int,
        per_page: int,
        filters: Dict[str, Any],
    ) -> Tuple[List[OnboardingStudentRow], int, int]:
        page = max(int(page or 1), 1)
        per_page = int(per_page or 20)
        per_page = per_page if per_page in {10, 20, 50, 100} else 20

        base = self._base_stmt(company_id=company_id)
        base = self._apply_filters(base, filters)
        base = base.order_by(User.created_at.asc(), User.id.asc())

        total = int(
            self.s.scalar(
                select(func.count()).select_from(base.order_by(None).subquery())
            )
            or 0
        )

        pages = max((total + per_page - 1) // per_page, 1)
        page = min(page, pages)
        offset = (page - 1) * per_page

        rows = self.s.execute(base.offset(offset).limit(per_page)).all()
        return [OnboardingStudentRow(**r._asdict()) for r in rows], total, pages

    def get_onboarding_student_detail(
        self,
        *,
        company_id: int,
        user_id: int,
    ) -> Optional[OnboardingStudentRow]:
        base = self._base_stmt(company_id=company_id)
        row = self.s.execute(base.where(User.id == int(user_id)).limit(1)).first()

        return OnboardingStudentRow(**row._asdict()) if row else None

    def shape_onboarding_list_row(self, r: OnboardingStudentRow) -> Dict[str, Any]:
        status = self._status_value(r.status)

        return {
            "user_id": int(r.user_id),
            "profile_id": int(r.profile_id),
            "full_name": r.full_name,
            "student_id": r.student_id,
            "email": r.email,
            "status": status,
            "can_approve": status == "pending_approval" and r.email_verified_at is not None,
            "email_verified": r.email_verified_at is not None,
            "academic": {
                "faculty": {"id": int(r.faculty_id), "name": r.faculty_name} if r.faculty_id else None,
                "department": {"id": int(r.department_id), "name": r.department_name} if r.department_id else None,
                "semester": {
                    "id": int(r.semester_id),
                    "name": r.semester_name,
                    "number": r.semester_number,
                } if r.semester_id else None,
            },
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }

    def shape_onboarding_detail_row(self, r: OnboardingStudentRow) -> Dict[str, Any]:
        out = self.shape_onboarding_list_row(r)

        out.update(
            {
                "username": r.username,
                "account": {
                    "user_is_enabled": bool(r.user_is_enabled),
                    "profile_is_enabled": bool(r.profile_is_enabled),
                    "affiliation_id": int(r.affiliation_id) if r.affiliation_id else None,
                    "affiliation_is_enabled": bool(r.affiliation_is_enabled)
                    if r.affiliation_is_enabled is not None
                    else None,
                    "email_verified_at": r.email_verified_at.isoformat() if r.email_verified_at else None,
                    "approved_at": r.approved_at.isoformat() if r.approved_at else None,
                    "rejected_at": r.rejected_at.isoformat() if r.rejected_at else None,
                },
                "academic": {
                    "faculty": {"id": int(r.faculty_id), "name": r.faculty_name} if r.faculty_id else None,
                    "department": {"id": int(r.department_id), "name": r.department_name} if r.department_id else None,
                    "semester": {
                        "id": int(r.semester_id),
                        "name": r.semester_name,
                        "number": r.semester_number,
                    } if r.semester_id else None,
                    "academic_year": {
                        "id": int(r.academic_year_id),
                        "name": r.academic_year_name,
                    } if r.academic_year_id else None,
                    "classroom": {
                        "id": int(r.classroom_id),
                        "name": r.classroom_name,
                        "room_number": r.classroom_room_number,
                    } if r.classroom_id else None,
                },
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            }
        )

        return out