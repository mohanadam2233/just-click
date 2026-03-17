"use client";

import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import { useSession } from "@/providers/SessionProvider";

export default function usePermission() {
  const { user } = useSession();

  return {
    can: (perm) => hasPermission(user, perm),
    canAny: (perms) => hasAnyPermission(user, perms),
    isAdmin: user?.permissions?.includes("*"),
  };
}
