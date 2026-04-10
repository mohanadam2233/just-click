from typing import Dict, Any, List
from sqlalchemy import or_, desc, asc, select, func
from cmcp.config.database import db
from cmcp.modules.auth.models import User, UserAffiliation
from cmcp.modules.education_people.models import StaffProfile
from cmcp.modules.academic.models import Faculty, Department
from cmcp.common.email.outbox_model import EmailOutbox
from cmcp.core.base_repo import BaseRepository

class AdminStaffRepository:
    def __init__(self, session=None):
        self.s = session or db.session
        self.profiles = BaseRepository(StaffProfile, self.s)

    def _build_query(self, company_id: int, filters: Dict[str, Any]):
        q = (
            select(StaffProfile, User, Faculty, Department)
            .join(User, User.id == StaffProfile.user_id)
            .outerjoin(Faculty, Faculty.id == StaffProfile.faculty_id)
            .outerjoin(Department, Department.id == StaffProfile.department_id)
            .where(StaffProfile.company_id == company_id)
        )

        search = filters.get("search")
        if search:
            q = q.where(
                or_(
                    StaffProfile.full_name.ilike(f"%{search}%"),
                    StaffProfile.staff_id.ilike(f"%{search}%"),
                    User.username.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                )
            )

        if filters.get("faculty_id"):
            q = q.where(StaffProfile.faculty_id == filters["faculty_id"])
        
        if filters.get("department_id"):
            q = q.where(StaffProfile.department_id == filters["department_id"])

        user_type = filters.get("user_type")
        if user_type:
            q = q.where(User.user_type == user_type)
            
        status = filters.get("status")
        if status:
            q = q.where(User.status == status)
            
        is_enabled = filters.get("is_enabled")
        if is_enabled is not None:
            q = q.where(StaffProfile.is_enabled.is_(is_enabled))

        return q

    def list_staff(self, company_id: int, limit: int, offset: int, filters: Dict[str, Any]):
        q = self._build_query(company_id, filters)
        
        count_stmt = select(func.count()).select_from(q.subquery())
        total = self.s.scalar(count_stmt) or 0
        
        q = q.order_by(StaffProfile.id.desc()).offset(offset).limit(limit)
        rows = self.s.execute(q).all()
        
        results = []
        for row in rows:
            prof, usr, fac, dept = row
            
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
                    "staff_id": prof.staff_id,
                    "is_enabled": prof.is_enabled,
                },
                "context": {
                    "faculty": {"id": fac.id, "name": fac.name} if fac else None,
                    "department": {"id": dept.id, "name": dept.name} if dept else None,
                },
                "created_at": prof.created_at.isoformat() if prof.created_at else None,
            })
            
        return results, total

    def get_staff(self, company_id: int, staff_profile_id: int):
        q = self._build_query(company_id, {})
        q = q.where(StaffProfile.id == int(staff_profile_id))
        
        row = self.s.execute(q).first()

        if not row:
            return None

        prof, usr, fac, dept = row

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
                "staff_id": prof.staff_id,
                "is_enabled": prof.is_enabled,
            },
            "context": {
                "faculty": {"id": fac.id, "name": fac.name} if fac else None,
                "department": {"id": dept.id, "name": dept.name} if dept else None,
            },
            "flags": {
                "is_enabled": prof.is_enabled,
            },
            "audit": {
                "created_at": prof.created_at.isoformat() if prof.created_at else None,
                "updated_at": prof.updated_at.isoformat() if prof.updated_at else None,
            }
        }
