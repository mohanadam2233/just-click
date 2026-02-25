"use client";

import Link from "next/link";

export default function AppHeader() {
  return (
    <div className="sticky top-0 z-50 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-black dark:text-white"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 dark:border-white/10">
            JC
          </span>
          <span className="text-sm sm:text-base">JustClick</span>
        </Link>

        {/* Profile Button */}
        <button
          className="h-9 w-9 rounded-full border border-black/10 dark:border-white/10 
                     bg-white dark:bg-black hover:bg-black/5 dark:hover:bg-white/10 
                     transition flex items-center justify-center"
        >
          <span className="h-6 w-6 rounded-full bg-black/10 dark:bg-white/20" />
        </button>

      </div>
    </div>
  );
}