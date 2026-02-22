"use client";

import React from "react";
import { authApi } from "@/features/auth/api";
import { useQuery } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/keys";

const SessionCtx = React.createContext(null);

export function useSession() {
  return React.useContext(SessionCtx);
}

export default function SessionProvider({ children }) {
  const q = useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
  });

  const user = q.data?.data?.user || null;

  const value = React.useMemo(() => {
    return {
      ...q,
      user,
      roles: user?.roles || [],
      permissions: user?.permissions || [],
    };
  }, [q, user]);

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}