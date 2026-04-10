from typing import Dict, Any, Tuple
from cmcp.modules.admin_staff.repository import AdminStaffRepository
from cmcp.core.exceptions import NotFoundError, BusinessValidationError
from cmcp.common.cache import cached_list, cached_detail
from cmcp.core.base_service import BaseService
from cmcp.modules.education_people.models import StaffProfile

class AdminStaffService:
    def __init__(self):
        self.repo = AdminStaffRepository()
        self.svc = BaseService(StaffProfile, session=self.repo.s, tx_mode="external")

    def list_staff(self, company_id: int, page: int, limit: int, filters: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        params = {
            "mode": "page",
            "page": page,
            "limit": limit,
            "filters": filters
        }
        
        def builder():
            offset = (page - 1) * limit
            rows, total = self.repo.list_staff(company_id, limit, offset, filters)
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
            entity="admin_staff:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder
        )
        return True, "OK", out

    def get_staff(self, company_id: int, staff_profile_id: int) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            return self.repo.get_staff(company_id, staff_profile_id)
            
        data = cached_detail(
            entity="admin_staff:detail",
            company_id=company_id,
            record_id=staff_profile_id,
            ttl=20,
            builder=builder
        )
        if not data:
            raise NotFoundError("Staff profile not found")
        return True, "OK", {"data": data}

    def update_staff(self, company_id: int, staff_profile_id: int, data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            ok, msg, out = self.svc.update(company_id=company_id, id=staff_profile_id, data=data, return_public=False)
            if not ok:
                raise BusinessValidationError(msg)
                
            updated = self.repo.get_staff(company_id, staff_profile_id)
            return True, "Staff updated successfully.", {"data": updated}
        except Exception as e:
            return False, f"Unexpected error: {e}", {}
