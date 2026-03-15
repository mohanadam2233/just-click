"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

function CheckIcon({ className = "h-3 w-3" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3.5 8.2L6.5 11.2L12.5 5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CheckboxField({
  checked = false,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(value) => onChange?.(!!value)}
      disabled={disabled}
      className={[
        "shrink-0 h-4 w-4 rounded-[3px] border transition-colors",
        "flex items-center justify-center",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-white border-gray-300 text-transparent hover:border-gray-400",
        "dark:border-slate-600 dark:bg-slate-900",
        checked ? "dark:bg-blue-600 dark:border-blue-600 dark:text-white" : "",
        className,
      ].join(" ")}
    >
      <CheckboxPrimitive.Indicator forceMount>
        <CheckIcon className="h-3 w-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
