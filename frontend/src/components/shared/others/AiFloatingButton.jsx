"use client";

import Link from "next/link";

export default function AiFloatingButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
      {/* Tooltip */}
      <span
        className="
          mb-1 translate-y-1 opacity-0 scale-95
          group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100
          transition-all duration-200 ease-out
          pointer-events-none
          bg-gray-900/90 dark:bg-white/10 backdrop-blur-sm
          text-white dark:text-white
          text-xs font-semibold tracking-wide
          px-3 py-1.5 rounded-full
          shadow-lg
          whitespace-nowrap
          border border-white/10
        "
      >
        ✦ Ask AI
      </span>

      {/* Pulse rings */}
      <span className="absolute bottom-0 right-0 h-14 w-14 rounded-full bg-primaryColor/30 animate-ping pointer-events-none" />
      <span className="absolute bottom-0 right-0 h-14 w-14 rounded-full bg-primaryColor/20 animate-pulse pointer-events-none" />

      {/* Main button */}
      <Link
        href="/ai"
        aria-label="Open AI Studio"
        className="
          relative flex items-center justify-center
          h-14 w-14 rounded-full
          shadow-[0_8px_32px_rgba(95,45,237,0.45)]
          hover:shadow-[0_12px_40px_rgba(95,45,237,0.65)]
          hover:scale-110 active:scale-95
          transition-all duration-300 ease-out
          focus-visible:outline-none
          focus-visible:ring-4 focus-visible:ring-primaryColor/50
          overflow-hidden
        "
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #5f2ded 50%, #a855f7 100%)",
        }}
      >
        {/* Inner shimmer */}
        <span
          className="absolute inset-0 opacity-40 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)",
          }}
        />

        {/* Sparkle / Stars icon */}
        <svg
          className="relative z-10 h-6 w-6 text-white drop-shadow"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Large star */}
          <path d="M12 2l1.8 5.4 5.7.1-4.6 3.3 1.7 5.5L12 13l-4.6 3.3 1.7-5.5-4.6-3.3 5.7-.1z" />
          {/* Small star top-right */}
          <path d="M19.5 3l.7 2 2.1.1-1.7 1.2.6 2-1.7-1.2-1.7 1.2.6-2-1.7-1.2 2.1-.1z" opacity="0.75" />
          {/* Tiny star bottom-left */}
          <path d="M4.5 16l.5 1.5 1.5.1-1.2.9.5 1.5L4.5 19l-1.3.9.5-1.5-1.2-.9 1.5-.1z" opacity="0.6" />
        </svg>
      </Link>
    </div>
  );
}
