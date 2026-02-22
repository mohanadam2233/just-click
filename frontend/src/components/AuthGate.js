"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, user, error } = useSession();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (!pathname.startsWith("/login")) router.replace("/login");
      return;
    }

    if (error?.status === 401 || error?.status === 403) {
      router.replace("/login");
    }
  }, [isLoading, user, error, router, pathname]);

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return null;
  return children;
}