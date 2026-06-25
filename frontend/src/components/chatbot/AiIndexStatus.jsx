"use client";

export default function AiIndexStatus({ status }) {
  if (status === "indexed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        AI Ready
      </span>
    );
  }

  if (status === "failed") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        AI is unavailable for this material. Please contact admin or try again later.
      </div>
    );
  }

  if (status === "pending" || status === "indexing") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        AI is preparing this material. This usually takes a moment after upload.
      </div>
    );
  }

  return null;
}
