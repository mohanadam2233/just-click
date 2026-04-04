"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { authKeys } from "./keys";

export function useMyProfilePage(opts = {}) {
  return useQuery({
    queryKey: [...authKeys.me(), "profile-page"],
    queryFn: authApi.getMyProfilePage,
    staleTime: 5 * 60 * 1000,
    ...opts,
  });
}

export function useUpdateMyProfilePage(opts = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateMyProfilePage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...authKeys.me(), "profile-page"] });
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
    ...opts,
  });
}

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
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      // clear current user immediately
      qc.setQueryData(authKeys.me(), null);

      // remove all auth cache
      qc.removeQueries({ queryKey: authKeys.root });

      // optional: invalidate everything depending on auth
      await qc.invalidateQueries();
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  });
}
