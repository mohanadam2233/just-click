import Link from "next/link";

export default function SignupSuccessPage({ searchParams }) {
  const message = searchParams?.message || "Registration submitted. Please check your email.";
  const email = searchParams?.email || "";
  const status = searchParams?.status || "";
  const studentId = searchParams?.student_id || "";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Check your email
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="mt-5 space-y-2 text-sm">
          {email ? (
            <div className="flex justify-between gap-3">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white font-medium">{email}</span>
            </div>
          ) : null}
          {studentId ? (
            <div className="flex justify-between gap-3">
              <span className="text-gray-500 dark:text-gray-400">Student ID</span>
              <span className="text-gray-900 dark:text-white font-medium">{studentId}</span>
            </div>
          ) : null}
          {status ? (
            <div className="flex justify-between gap-3">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <span className="text-gray-900 dark:text-white font-medium">{status}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="flex-1 h-11 rounded-xl bg-primaryColor hover:bg-primaryColor/90 text-white text-sm font-semibold flex items-center justify-center"
          >
            Go to login
          </Link>

          <Link
            href="/"
            className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}