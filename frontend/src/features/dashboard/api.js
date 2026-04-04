import { fetchJSON } from "@/lib/http";

export const dashboardApi = {
  getAdminSummary: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.months) searchParams.append("months", params.months);
    const qs = searchParams.toString();
    return fetchJSON(`/education_people/dashboard/admin-summary${qs ? `?${qs}` : ""}`);
  },
};
