"use client";

import { useQuery } from "@tanstack/react-query";
import { materialsApi } from "./api";
import { materialsKeys } from "./keys";

export function useMaterialsList() {
  return useQuery({
    queryKey: materialsKeys.list(),
    queryFn: materialsApi.list,
    staleTime: 60 * 1000,
  });
}

export function useMaterialDetail(id) {
  return useQuery({
    queryKey: materialsKeys.detail(id),
    queryFn: () => materialsApi.detail(id),
    enabled: !!id,
  });
}