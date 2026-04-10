from typing import Optional, Dict, Any, List
from sqlalchemy import or_, desc, asc, select, func
from cmcp.config.database import db
from cmcp.modules.auth.models import User, UserAffiliation
from cmcp.modules.education_people.models import StudentProfile, Classroom
from cmcp.modules.academic.models import Faculty, Department, Semester
from cmcp.common.email.outbox_model import EmailOutbox
from cmcp.core.base_repo import BaseRepository

class AdminStudentsRepository:
    def __init__(self, session=None):
        self.s = session or db.session
        self.profiles = BaseRepository(StudentProfile, self.s)

    def _build_query(self, company_id: int, filters: Dict[str, Any]):
        q = (
            select(StudentProfile, User, Faculty, Department, Semester, Classroom)
            .join(User, User.id == StudentProfile.user_id)
            .outerjoin(Faculty, Faculty.id == StudentProfile.faculty_id)
            .outerjoin(Department, Department.id == StudentProfile.department_id)
            .outerjoin(Semester, Semester.id == StudentProfile.semester_id)
            .outerjoin(Classroom, Classroom.id == StudentProfile.classroom_id)
            .where(StudentProfile.company_id == company_id)
        )

        search = filters.get("search")
        if search:
            q = q.where(
                or_(
                    StudentProfile.full_name.ilike(f"%{search}%"),
                    StudentProfile.student_id.ilike(f"%{search}%"),
                    User.username.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                )
            )

        if filters.get("faculty_id"):
            q = q.where(StudentProfile.faculty_id == filters["faculty_id"])
        
        if filters.get("department_id"):
            q = q.where(StudentProfile.department_id == filters["department_id"])

        if filters.get("semester_id"):
            q = q.where(StudentProfile.semester_id == filters["semester_id"])

        if filters.get("classroom_id"):
            q = q.where(StudentProfile.classroom_id == filters["classroom_id"])
            
        is_enabled = filters.get("is_enabled")
        if is_enabled is not None:
            q = q.where(StudentProfile.is_enabled.is_(is_enabled))

        return q

    def list_students(self, company_id: int, limit: int, offset: int, filters: Dict[str, Any]):
        q = self._build_query(company_id, filters)
        
        count_stmt = select(func.count()).select_from(q.subquery())
        total = self.s.scalar(count_stmt) or 0
        
        q = q.order_by(StudentProfile.id.desc()).offset(offset).limit(limit)
        rows = self.s.execute(q).all()
        
        results = []
        for row in rows:
            prof, usr, fac, dept, sem, cls = row
            
            results.append({
                "id": prof.id,
                "user": {
                    "id": usr.id,
                    "username": usr.username,
                    "email": usr.email,
                },
                "profile": {
                    "id": prof.id,
                    "full_name": prof.full_name,
                    "student_id": prof.student_id,
                    "is_enabled": prof.is_enabled,
                },
                "context": {
                    "faculty": {"id": fac.id, "name": fac.name} if fac else None,
                    "department": {"id": dept.id, "name": dept.name} if dept else None,
                    "semester": {"id": sem.id, "name": sem.name, "number": getattr(sem, "number", None)} if sem else None,
                },
                "created_at": prof.created_at.isoformat() if prof.created_at else None,
            })
            
        return results, total

    def get_student(self, company_id: int, student_profile_id: int):
        q = self._build_query(company_id, {})
        q = q.where(StudentProfile.id == int(student_profile_id))
        
        row = self.s.execute(q).first()

        if not row:
            return None

        prof, usr, fac, dept, sem, cls = row

        return {
            "id": prof.id,
            "user": {
                "id": usr.id,
                "username": usr.username,
                "email": usr.email,
                "is_enabled": usr.is_enabled,
            },
            "profile": {
                "id": prof.id,
                "full_name": prof.full_name,
                "student_id": prof.student_id,
                "is_enabled": prof.is_enabled,
            },
            "context": {
                "faculty": {"id": fac.id, "name": fac.name} if fac else None,
                "department": {"id": dept.id, "name": dept.name} if dept else None,
                "semester": {"id": sem.id, "name": sem.name, "number": getattr(sem, "number", None)} if sem else None,
                "classroom": {"id": cls.id, "name": cls.name, "room_number": getattr(cls, "room_number", None)} if cls else None,
            },
            "flags": {
                "is_enabled": prof.is_enabled,
            },
            "audit": {
                "created_at": prof.created_at.isoformat() if prof.created_at else None,
                "updated_at": prof.updated_at.isoformat() if prof.updated_at else None,
            }
        }
