"use client";

import { hasPermission } from "@/lib/permissions";
import { useSession } from "@/providers/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PermissionGate({ permission, children }) {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user || !hasPermission(user, permission)) {
      router.replace("/no-permission");
    }
  }, [user, isLoading, permission, router]);

  if (isLoading) return null;
  if (!user || !hasPermission(user, permission)) return null;

  return children;
}
