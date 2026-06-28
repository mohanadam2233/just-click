"use client";

export default function AiIndexStatus({ status }) {
  if (status === "indexed") {
    return null;
  }

  if (status === "failed") {
    return (
      <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">
        AI is unavailable for this material. Please contact admin or try again later.
      </p>
    );
  }

  if (status === "pending" || status === "indexing") {
    return (
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        AI is preparing this material. This usually takes a moment after upload.
      </p>
    );
  }

  return null;
}
