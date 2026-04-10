from typing import Dict, Any, Tuple
from cmcp.modules.admin_onboarding.repository import AdminOnboardingRepository
from cmcp.core.exceptions import NotFoundError
from cmcp.common.cache import cached_list, cached_detail

class AdminOnboardingService:
    def __init__(self):
        self.repo = AdminOnboardingRepository()

    def list_onboarding(self, company_id: int, page: int, limit: int, filters: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
        params = {
            "mode": "page",
            "page": page,
            "limit": limit,
            "filters": filters
        }
        
        def builder():
            offset = (page - 1) * limit
            rows, total = self.repo.list_onboarding(company_id, limit, offset, filters)
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
            entity="admin_onboarding:list",
            company_id=company_id,
            params=params,
            scope="default",
            ttl=20,
            builder=builder
        )
        return True, "OK", out

    def get_onboarding(self, company_id: int, outbox_id: int) -> Tuple[bool, str, Dict[str, Any]]:
        def builder():
            return self.repo.get_onboarding(company_id, outbox_id)
            
        data = cached_detail(
            entity="admin_onboarding:detail",
            company_id=company_id,
            record_id=outbox_id,
            ttl=20,
            builder=builder
        )
        if not data:
            raise NotFoundError("Onboarding record not found")
        return True, "OK", {"data": data}
