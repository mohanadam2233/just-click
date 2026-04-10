from typing import Dict, Any, Tuple
from cmcp.modules.admin_students.repository import AdminStudentsRepository
from cmcp.core.exceptions import NotFoundError, BusinessValidationError
from cmcp.common.cache import cached_list, cached_detail
from cmcp.core.base_service import BaseService
from cmcp.modules.education_people.models import StudentProfile

class AdminStudentsService:
    def __init__(self):
        self.repo = AdminStudentsRepository()
        self.svc = BaseService(StudentProfile, session=self.repo.s, tx_mode="external")

    def list_students(self, company_id: int, page: int, limit: int, filters: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        params = {
            "mode": "page",
            "page": page,
            "limit": limit,
            "filters": filters
        }
        
        def builder():
            offset = (page - 1) * limit
            rows, total = self.repo.list_students(company_id, limit, offset, filters)
            return {
                "data": rows,
                "meta": {
                    "total_count": total
                },
                "pagination": {
                    "limit": limit,
                    "next_cursor": None,
                    "has_more": (offset + limit) < total
                }
            }
            
        out = cached_list(
            entity="admin_students:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder
        )
        return True, "OK", out

    def get_student(self, company_id: int, student_profile_id: int) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            return self.repo.get_student(company_id, student_profile_id)
            
        data = cached_detail(
            entity="admin_students:detail",
            company_id=company_id,
            record_id=student_profile_id,
            ttl=20,
            builder=builder
        )
        if not data:
            raise NotFoundError("Student not found")
        return True, "OK", {"data": data}

    def update_student(self, company_id: int, student_profile_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ok, msg, out = self.svc.update(company_id=company_id, id=student_profile_id, data=data, return_public=False)
            if not ok:
                raise BusinessValidationError(msg)
                
            updated = self.repo.get_student(company_id, student_profile_id)
            return True, "Student updated successfully.", {"data": updated}
        except Exception as e:
            return False, f"Unexpected error: {e}", {}
