from typing import Dict, Any, List
from sqlalchemy import or_, desc, asc, select, func
from cmcp.config.database import db
from cmcp.modules.auth.models import User, UserAffiliation
from cmcp.modules.education_people.models import StudentProfile, StaffProfile
from cmcp.modules.academic.models import Faculty, Department, Semester
from cmcp.common.email.outbox_model import EmailOutbox

class AdminOnboardingRepository:
    def __init__(self, session=None):
        self.s = session or db.session

    def _build_query(self, company_id: int, filters: Dict[str, Any]):
        q = (
            select(EmailOutbox, User, StudentProfile, StaffProfile, Faculty, Department, Semester)
            .outerjoin(User, (EmailOutbox.ref_type == "User") & (EmailOutbox.ref_id == User.id))
            .outerjoin(StudentProfile, StudentProfile.user_id == User.id)
            .outerjoin(StaffProfile, StaffProfile.user_id == User.id)
            .outerjoin(Faculty, or_(Faculty.id == StudentProfile.faculty_id, Faculty.id == StaffProfile.faculty_id))
            .outerjoin(Department, or_(Department.id == StudentProfile.department_id, Department.id == StaffProfile.department_id))
            .outerjoin(Semester, Semester.id == StudentProfile.semester_id)
            .where(EmailOutbox.company_id == company_id)
        )

        search = filters.get("search")
        if search:
            q = q.where(
                or_(
                    User.username.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                    StudentProfile.full_name.ilike(f"%{search}%"),
                    StaffProfile.full_name.ilike(f"%{search}%"),
                )
            )

        if filters.get("user_type"):
            q = q.where(User.user_type == filters["user_type"])

        status = filters.get("status")
        if status:
            if "|" in status:
                q = q.where(User.status.in_(status.split("|")))
            else:
                q = q.where(User.status == status)

        if filters.get("faculty_id"):
            q = q.where(or_(StudentProfile.faculty_id == filters["faculty_id"], StaffProfile.faculty_id == filters["faculty_id"]))
        
        if filters.get("department_id"):
            q = q.where(or_(StudentProfile.department_id == filters["department_id"], StaffProfile.department_id == filters["department_id"]))

        ob_status = filters.get("email_outbox_status")
        if ob_status:
            q = q.where(EmailOutbox.status == ob_status)

        return q

    def _format_row(self, row):
        ob, usr, stu, sta, fac, dept, sem = row

        prof_id = stu.id if stu else (sta.id if sta else None)
        prof_name = stu.full_name if stu else (sta.full_name if sta else None)
        prof_identifier = stu.student_id if stu else (sta.staff_id if sta else None)
        
        # safely handle usr potentially being None due to outerjoin
        email_verified = False
        awaiting_admin = False
        approved = False
        rejected = False
        if usr:
            email_verified = bool(usr.email_verified_at)
            awaiting_admin = (usr.status.value == "pending_approval") if hasattr(usr.status, "value") else (str(usr.status) == "pending_approval")
            approved = (usr.status.value == "active") if hasattr(usr.status, "value") else (str(usr.status) == "active")
            rejected = (usr.status.value == "rejected") if hasattr(usr.status, "value") else (str(usr.status) == "rejected")

        res = {
            "id": ob.id,
            "user": {
                "id": usr.id,
                "username": usr.username,
                "email": usr.email,
                "user_type": usr.user_type.value if hasattr(usr.user_type, "value") else str(usr.user_type),
                "status": usr.status.value if hasattr(usr.status, "value") else str(usr.status),
                "is_enabled": usr.is_enabled,
                "email_verified_at": usr.email_verified_at.isoformat() if usr.email_verified_at else None,
                "email_verify_expires_at": usr.email_verify_expires_at.isoformat() if usr.email_verify_expires_at else None,
                "last_login": usr.last_login.isoformat() if usr.last_login else None,
                "must_change_password": usr.must_change_password,
                "temp_password_expires_at": usr.temp_password_expires_at.isoformat() if usr.temp_password_expires_at else None,
            } if usr else None,
            "profile" if not getattr(self, "_detail_mode", False) else "profile": {
                "id": prof_id,
                "full_name": prof_name,
                "student_id" if stu else ("staff_id" if sta else "identifier"): prof_identifier,
            },
            "context": {
                "faculty": {"id": fac.id, "name": fac.name} if fac else None,
                "department": {"id": dept.id, "name": dept.name} if dept else None,
                "semester": {"id": sem.id, "name": sem.name, "number": getattr(sem, "number", None)} if sem else None,
                "classroom": None
            },
            "email_outbox": {
                "id": ob.id,
                "to_email": ob.to_email,
                "subject": ob.subject,
                "template": ob.template,
                "payload_json": ob.payload_json,
                "status": ob.status,
                "tries": ob.tries,
                "last_error": ob.last_error,
                "locked_at": ob.locked_at.isoformat() if ob.locked_at else None,
                "sent_at": ob.sent_at.isoformat() if ob.sent_at else None,
                "ref_type": ob.ref_type,
                "ref_id": ob.ref_id,
                "company_id": ob.company_id
            },
            "verification": {
                "email_verified_at": usr.email_verified_at.isoformat() if (usr and usr.email_verified_at) else None,
                "email_verify_expires_at": usr.email_verify_expires_at.isoformat() if (usr and usr.email_verify_expires_at) else None,
            },
            "progress": {
                "email_verified": email_verified,
                "awaiting_admin": awaiting_admin,
                "approved": approved,
                "rejected": rejected
            },
            "actions_allowed": {
                "can_approve": awaiting_admin,
                "can_reject": awaiting_admin,
                "can_resend_email": ob.template == "verify_email",
            },
            "audit": {
                "created_at": ob.created_at.isoformat() if hasattr(ob, "created_at") and ob.created_at else None,
                "updated_at": ob.updated_at.isoformat() if hasattr(ob, "updated_at") and ob.updated_at else None,
                "approved_at": usr.approved_at.isoformat() if (usr and usr.approved_at) else None,
                "approved_by": usr.approved_by if usr else None,
                "rejected_at": usr.rejected_at.isoformat() if (usr and usr.rejected_at) else None,
                "rejected_by": usr.rejected_by if usr else None,
                "rejection_reason": usr.rejection_reason if usr else None,
            }
        }

        # Handle list-specific renaming
        if getattr(self, "_list_mode", False):
            if "profile" in res:
                res["profile_preview"] = res.pop("profile")
            if "verification" in res: del res["verification"]
            if "audit" in res: del res["audit"]
            if "email_outbox" in res:
                del res["email_outbox"]["payload_json"]
                del res["email_outbox"]["subject"]
                del res["email_outbox"]["locked_at"]
                del res["email_outbox"]["ref_type"]
                del res["email_outbox"]["ref_id"]
                del res["email_outbox"]["company_id"]

        return res

    def list_onboarding(self, company_id: int, limit: int, offset: int, filters: Dict[str, Any]):
        q = self._build_query(company_id, filters)
        
        count_stmt = select(func.count()).select_from(q.subquery())
        total = self.s.scalar(count_stmt) or 0
        
        q = q.order_by(EmailOutbox.id.desc()).offset(offset).limit(limit)
        rows = self.s.execute(q).all()
        
        self._list_mode = True
        self._detail_mode = False
        results = [self._format_row(r) for r in rows]
        self._list_mode = False
            
        return results, total

    def get_onboarding(self, company_id: int, outbox_id: int):
        q = self._build_query(company_id, {})
        q = q.where(EmailOutbox.id == int(outbox_id))
        row = self.s.execute(q).first()

        if not row:
            return None

        self._detail_mode = True
        self._list_mode = False
        res = self._format_row(row)
        self._detail_mode = False
        return res
