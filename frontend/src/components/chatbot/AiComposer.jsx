"use client";

import { useRef } from "react";

export default function AiComposer({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = "Ask about this material...",
  isWide = false,
}) {
  const textareaRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  return (
    <div className={`flex-shrink-0 border-t border-[#e2e8f0] dark:border-[#2d3548] ${isWide ? "px-6 py-4" : "px-3 py-2.5"}`}>
      <div className={`mx-auto flex items-end gap-2 ${isWide ? "max-w-3xl" : ""}`}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="max-h-[5.5rem] min-h-[40px] flex-1 resize-none rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-3.5 py-2.5 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#313a4d] dark:bg-[#1c212b] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500/50 dark:focus:ring-indigo-500/10"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
