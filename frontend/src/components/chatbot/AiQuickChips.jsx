"use client";

const QUICK_CHIPS = [
  "Summarize this material",
  "Explain simply",
  "Make a quiz",
  "Generate Q&A",
  "Key exam points",
];

export default function AiQuickChips({ onSelect, disabled, isWide = false }) {
  return (
    <div className={`flex flex-shrink-0 flex-wrap gap-1.5 pb-2 ${isWide ? "px-6 max-w-3xl mx-auto w-full" : "px-3"}`}>
      {QUICK_CHIPS.map((chip) => (
        <button
          key={chip}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          className="rounded-full border border-[#dbe3ee] bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#313a4d] dark:bg-[#1f2633] dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
