"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "./api";
import { authKeys } from "./keys";

export function useMe(opts = {}) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...opts,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}