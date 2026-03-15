"use client";

import { useState } from "react";

export default function TagInput({
  value = [],
  onChange,
  placeholder = "Type and press Enter",
  disabled = false,
}) {
  const [input, setInput] = useState("");

  const addTag = (rawValue) => {
    const tag = String(rawValue || "").trim();
    if (!tag) return;

    const exists = value.some(
      (item) => item.toLowerCase() === tag.toLowerCase(),
    );
    if (exists) {
      setInput("");
      return;
    }

    onChange?.([...(value || []), tag]);
    setInput("");
  };

  const removeTag = (indexToRemove) => {
    onChange?.(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }

    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="w-full min-h-[42px] px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-transparent rounded focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-1 focus-within:border-blue-500 focus-within:ring-blue-500 text-gray-900 dark:text-gray-200 transition-colors">
      <div className="flex flex-wrap gap-2 items-center">
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-200"
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
        Press Enter or comma to add each learning objective
      </p>
    </div>
  );
}
