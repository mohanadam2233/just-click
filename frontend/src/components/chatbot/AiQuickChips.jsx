"use client";

const QUICK_CHIPS = [
  "Summarize this material",
  "Explain simply",
  "Make a quiz",
  "Generate Q&A",
  "Key exam points",
];

export default function AiQuickChips({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {QUICK_CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
