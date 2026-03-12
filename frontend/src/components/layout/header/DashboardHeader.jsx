"use client";

import { useLogout, useMe } from "@/features/auth/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const fallbackUser = {
  username: "User",
  userType: "user",
  primaryRole: "No role",
  initials: "U",
};

export default function DashboardHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  const { data: meData, isLoading: isMeLoading, isError: isMeError } = useMe();
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const apiUser = meData?.data?.user;

  const user = useMemo(() => {
    if (!apiUser) return fallbackUser;

    const username = apiUser?.username || fallbackUser.username;
    const userType = apiUser?.user_type || fallbackUser.userType;
    const roles = Array.isArray(apiUser?.roles) ? apiUser.roles : [];
    const primaryRole = roles[0] || fallbackUser.primaryRole;

    const initials =
      username
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || fallbackUser.initials;

    return {
      username,
      userType,
      primaryRole,
      initials,
    };
  }, [apiUser]);

  const safeUser = isMeError ? fallbackUser : user;

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await logoutMutation.mutateAsync();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header>
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-borderColor dark:border-borderColor-dark shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/materials" className="flex items-center">
              <span className="text-xl font-bold text-blackColor dark:text-whiteColor">
                Just<span className="text-primaryColor">Click</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-3 focus:outline-none"
                  aria-label="Profile menu"
                  type="button"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primaryColor to-secondaryColor flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow">
                    {isMeLoading ? (
                      <div className="h-4 w-5 rounded bg-white/30 animate-pulse" />
                    ) : (
                      safeUser.initials
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-blackColor dark:text-whiteColor transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-blackColor rounded-xl shadow-lg border border-borderColor dark:border-borderColor-dark overflow-hidden">
                    <div className="px-4 py-3 border-b border-borderColor dark:border-borderColor-dark">
                      {isMeLoading ? (
                        <div className="space-y-2">
                          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-blackColor dark:text-whiteColor">
                            {safeUser.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {safeUser.primaryRole}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-blackColor dark:text-whiteColor hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-blackColor dark:text-whiteColor hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Settings
                      </Link>

                      <div className="my-2 border-t border-borderColor dark:border-borderColor-dark" />

                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-left disabled:opacity-60 disabled:cursor-not-allowed"
                        type="button"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16 md:h-20" />
    </header>
  );
}
