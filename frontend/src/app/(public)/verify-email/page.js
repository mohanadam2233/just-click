"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/features/auth/hooks";
import Preloader from "@/components/shared/others/Preloader";

// smart status classifier (keeps backend logic)
function classify({ success, message }) {
  const msg = String(message || "").toLowerCase();

  if (success === true) return "verified";
  if (msg.includes("pending admin approval")) return "pending";
  if (msg.includes("expired")) return "expired";

  // some backends may say "already verified" etc
  if (msg.includes("verified successfully") || msg.includes("email verified")) return "verified";

  return "error";
}

// minimal, premium icons (inline SVG, no deps)
function Icon({ status }) {
  const cls =
    "flex items-center justify-center w-12 h-12 rounded-2xl " +
    "ring-1 ring-inset ";

  if (status === "verified") {
    return (
      <div className={cls + "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className={cls + "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20"}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className={cls + "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20"}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cls + "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20"}>
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const verifyMut = useVerifyEmail();

  const username = sp.get("username") || "";
  const token = sp.get("token") || "";

  const canVerify = useMemo(() => !!username && !!token, [username, token]);

  const [ui, setUi] = useState({
    status: "idle", // idle | loading | verified | pending | expired | error
    message: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!canVerify) {
        setUi({
          status: "error",
          message: "Invalid verification link. Missing username or token.",
        });
        return;
      }

      setUi({ status: "loading", message: "" });

      try {
        const res = await verifyMut.mutateAsync({ username, token });
        if (cancelled) return;

        const msg = res?.message || "";
        setUi({
          status: classify({ success: res?.success, message: msg }),
          message: msg,
        });
      } catch (err) {
        if (cancelled) return;

        // ✅ your fetchJSON throws APIError with .info (not err.response)
        const backendMsg = err?.info?.message || err?.message || "Verification failed.";
        setUi({
          status: classify({ success: false, message: backendMsg }),
          message: backendMsg,
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canVerify, username, token]);

  if (ui.status === "loading" || ui.status === "idle") return <Preloader />;

  const isVerified = ui.status === "verified";
  const isPending = ui.status === "pending";
  const isExpired = ui.status === "expired";
  const isError = ui.status === "error";

  const title =
    isVerified ? "Email verified" :
    isPending ? "Email verified — pending approval" :
    isExpired ? "Link expired" :
    "Verification failed";

  const subtitle =
    isVerified ? "Your email address is confirmed." :
    isPending ? "Your account will be reviewed by the admin team." :
    isExpired ? "This verification link is no longer valid." :
    "We couldn’t verify your email with this link.";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-white dark:bg-[#0B1120]">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-none backdrop-blur p-8">
          <div className="flex items-start gap-4">
            <Icon status={ui.status} />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Backend message (always exact) */}
          <p className="mt-6 text-[15px] leading-relaxed text-gray-700 dark:text-gray-200">
            {ui.message}
          </p>

          {/* Subtle details row */}
          <div className="mt-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Student ID</span>
              <span className="font-semibold text-gray-900 dark:text-white">{username || "—"}</span>
            </div>
          </div>

          {/* Minimal next steps only when pending */}
          {isPending && (
            <div className="mt-6 rounded-2xl border border-sky-200/70 dark:border-sky-500/20 bg-sky-50/60 dark:bg-sky-500/5 p-4">
              <div className="text-sm font-semibold text-sky-900 dark:text-sky-300">
                What happens next
              </div>
              <ul className="mt-2 space-y-2 text-sm text-sky-900/80 dark:text-sky-200/80">
                <li>• Admin verifies your student ID.</li>
                <li>• You’ll receive an email with a temporary password.</li>
                <li>• Then you can log in using your Student ID + temporary password.</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="h-11 rounded-2xl bg-primaryColor hover:bg-primaryColor/90 text-white text-sm font-semibold flex items-center justify-center transition active:scale-[0.99]"
            >
              Continue to login
            </Link>

            <Link
              href="/"
              className="h-11 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm font-semibold flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
            >
              Return home
            </Link>
          </div>

          {/* Help text only for expired/error */}
          {(isExpired || isError) && (
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              If your link expired, please register again or request a new verification email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}