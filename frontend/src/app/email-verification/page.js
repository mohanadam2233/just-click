"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Info, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo1 from "@/assets/images/logo/logo_1.png";

// Types for our different UI states
// VerificationState = 'loading' | 'success' | 'already_verified' | 'expired' | 'invalid';

export default function VerificationPage() {
  const [status, setStatus] = useState("loading");

  // Simulated logic - in a real app, you'd trigger your API call here
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set this to any state to test the UI
      setStatus("success");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      {/* Logo Placeholder - Matches Edurock Header */}
      <div className="mb-8 flex items-center gap-2">
        <Image src={logo1} alt="edurock logo" />
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 text-center border border-slate-100">
        {/* 1. LOADING STATE */}
        {status === "loading" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">
              Verifying your email...
            </h1>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <p className="text-slate-500 text-sm">
                Please wait, this may take a few seconds.
              </p>
            </div>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {status === "success" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-800">
                Email verified!
              </h1>
              <p className="text-slate-600">
                Your account is now pending admin approval.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/login"
                className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-200"
              >
                Go to Login
              </Link>
              <Link
                href="/"
                className="text-sm text-slate-400 hover:text-purple-600 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {/* 3. ALREADY VERIFIED */}
        {status === "already_verified" && (
          <div className="space-y-6">
            <Info className="w-20 h-20 text-blue-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-800">
              This email is already verified.
            </h1>
            <Link
              href="/login"
              className="block w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* 4. EXPIRED TOKEN */}
        {status === "expired" && (
          <div className="space-y-6">
            <XCircle className="w-20 h-20 text-rose-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-800">
                Verification link expired.
              </h1>
              <p className="text-slate-600 text-sm">
                Please register again or request a new verification email.
              </p>
            </div>
            <button className="w-full py-3 px-6 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-xl transition-all">
              Resend verification email
            </button>
          </div>
        )}

        {/* 5. INVALID TOKEN */}
        {status === "invalid" && (
          <div className="space-y-6">
            <XCircle className="w-20 h-20 text-rose-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-800">
              Invalid verification link.
            </h1>
            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                className="w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-xl"
              >
                Go to Register
              </Link>
              <button className="text-sm font-medium text-slate-500 hover:text-pink-500 flex items-center justify-center gap-1">
                Contact support <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
