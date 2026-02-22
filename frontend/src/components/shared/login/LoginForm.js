
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLogin } from "@/features/auth/hooks";
import { useSession } from "@/providers/SessionProvider";

const LoginForm = () => {
  const router = useRouter();
  const loginMut = useLogin();
  const { user } = useSession();

  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // simple guard
    if (!form.username.trim() || !form.password.trim()) {
      toast.error("Please enter username and password.");
      return;
    }

    try {
      await loginMut.mutateAsync({
        username: form.username.trim(),
        password: form.password,
      });

      toast.success("Login successful.");
      router.replace("/dashboard");
    } catch (e2) {
      toast.error(e2?.message || "Login failed");
    }
  };

  const labelCls =
    "block text-[12.5px] font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  const inputCls =
    "w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 " +
    "bg-white dark:bg-gray-900/30 px-3.5 text-sm text-gray-900 dark:text-white " +
    "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
    "focus:outline-none focus:border-primaryColor/50 focus:ring-4 focus:ring-primaryColor/10 transition";

  const btnBase =
    "w-full h-11 rounded-lg text-white text-sm font-semibold transition " +
    "focus:outline-none focus:ring-4 focus:ring-primaryColor/20";

  const btnEnabled = "bg-primaryColor hover:bg-primaryColor/90";
  const btnDisabled = "bg-primaryColor/60 cursor-not-allowed";

  const isLoading = loginMut.isPending;

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Sign in
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          New here?{" "}
          <Link
            href="/signup"
            className="text-primaryColor font-semibold hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className={labelCls} htmlFor="username">
            Username <span className="text-red-400">*</span>
          </label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={onChange}
            type="text"
            placeholder="Enter username"
            className={inputCls}
            autoComplete="username"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className={labelCls} htmlFor="password">
              Password <span className="text-red-400">*</span>
            </label>

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs font-semibold text-primaryColor hover:underline disabled:opacity-60"
              disabled={isLoading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <input
            id="password"
            name="password"
            value={form.password}
            onChange={onChange}
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className={inputCls}
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 text-primaryColor focus:ring-primaryColor/20"
              disabled={isLoading}
            />
            Remember me
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-primaryColor font-semibold hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className={`${btnBase} ${isLoading ? btnDisabled : btnEnabled}`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;