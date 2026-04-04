"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";
import { dashboardKeys } from "./keys";

export function useAdminDashboardSummary(params = {}, options = {}) {
  return useQuery({
    queryKey: dashboardKeys.adminSummary(params),
    queryFn: () => dashboardApi.getAdminSummary(params),
    ...options,
  });
}
