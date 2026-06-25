"use client";

export default function AiSourceChips({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <div className="ml-9 flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-400">Sources:</span>
      {sources.map((source, index) => {
        const label = [
          source.source_name,
          source.chapter_label,
          source.chunk_index != null ? `chunk ${source.chunk_index}` : null,
        ].filter(Boolean).join(" · ");

        return (
          <span
            key={`${label}-${index}`}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          >
            {label || "Material chunk"}
          </span>
        );
      })}
    </div>
  );
}
