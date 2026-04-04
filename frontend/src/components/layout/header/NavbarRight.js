"use client";

import MobileMenuOpen from "@/components/shared/buttons/MobileMenuOpen";
import { useLogout, useMe } from "@/features/auth/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const fallbackUser = {
  username: "User",
  userType: "user",
  primaryRole: "No role",
  initials: "U",
  roles: [],
};

function getInitials(username) {
  return (
    username
      ?.split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function getWorkspaceConfig(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const normalizedRoles = roles.map(normalizeRole);
  const userType = normalizeRole(user?.userType);

  if (normalizedRoles.includes("super admin")) {
    return { label: "Workspace", href: "/admin/dashboards/admin-dashboard" };
  }

  if (normalizedRoles.includes("teacher") || userType === "teacher") {
    return {
      label: "Workspace",
      href: "/teacher/dashboards/teacher-dashboard",
    };
  }

  if (normalizedRoles.includes("student") || userType === "student") {
    return { label: "Workspace", href: "/materials" };
  }

  if (userType === "admin") {
    return { label: "Workspace", href: "/admin/dashboards/admin-dashboard" };
  }

  return { label: "Workspace", href: "/materials" };
}

const NavbarRight = ({ isScrolled }) => {
  const router = useRouter();
  const { data: meData, isLoading, isError } = useMe();
  const logoutMutation = useLogout();

  const apiUser = meData?.data?.user;

  const user = useMemo(() => {
    if (!apiUser) return fallbackUser;

    const username = apiUser?.username || fallbackUser.username;
    const userType = apiUser?.user_type || fallbackUser.userType;
    const roles = Array.isArray(apiUser?.roles) ? apiUser.roles : [];
    const primaryRole = roles[0] || fallbackUser.primaryRole;

    return {
      username,
      userType,
      primaryRole,
      roles,
      initials: getInitials(username),
    };
  }, [apiUser]);

  const safeUser = isError ? fallbackUser : user;
  const workspace = useMemo(() => getWorkspaceConfig(safeUser), [safeUser]);

  const isLoggedIn = !!apiUser && !isError;

  const loginClass = isScrolled
    ? "text-gray-700 dark:text-gray-200 hover:text-primaryColor"
    : "text-blackColor/80 dark:text-whiteColor/80 hover:text-blackColor dark:hover:text-whiteColor";

  const btnClass =
    "bg-primaryColor text-white hover:shadow-lg hover:shadow-primaryColor/25";

  const ghostBtnClass =
    "text-sm font-semibold px-4 py-2 rounded-full border border-borderColor dark:border-borderColor-dark text-gray-700 dark:text-gray-200 hover:border-primaryColor hover:text-primaryColor transition-all";

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-3">
        {isLoading ? (
          <>
            <div className="h-9 w-24 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-9 w-28 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </>
        ) : isLoggedIn ? (
          <>
            <Link href="/materials" className={ghostBtnClass}>
              Materials
            </Link>

            <Link
              href={workspace.href}
              className={`text-sm font-bold px-5 py-2 rounded-full transition-all ${btnClass}`}
            >
              {workspace.label} →
            </Link>

            <Link
              href="/user-profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primaryColor text-sm font-bold text-white"
              title={safeUser.username}
            >
              {safeUser.initials}
            </Link>

            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className={`text-sm font-semibold transition-colors ${loginClass} disabled:opacity-50`}
            >
              {logoutMutation.isPending ? "Signing out..." : "Log out"}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className={`text-sm font-semibold transition-colors ${loginClass}`}
            >
              Log in
            </Link>

            <Link
              href="/register"
              className={`text-sm font-bold px-5 py-2 rounded-full transition-all ${btnClass}`}
            >
              Get started →
            </Link>
          </>
        )}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <MobileMenuOpen />
      </div>
    </div>
  );
};

export default NavbarRight;
