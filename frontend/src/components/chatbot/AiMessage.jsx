"use client";

import ReactMarkdown from "react-markdown";

function BotIcon() {
  return (
    <svg className="h-4 w-4 text-indigo-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

export default function AiMessage({ role, content, isError = false }) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#eef2f7] px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 dark:bg-[#2a3140] dark:text-slate-100">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-[#252d3d]">
        <BotIcon />
      </span>
      <div
        className={`min-w-0 flex-1 text-sm leading-relaxed ${
          isError
            ? "text-rose-600 dark:text-rose-300"
            : "text-slate-700 dark:text-slate-200"
        }`}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="my-1.5">{children}</p>,
            ul: ({ children }) => <ul className="my-1.5 ml-5 list-disc space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="my-1.5 ml-5 list-decimal space-y-1">{children}</ol>,
            h2: ({ children }) => <h2 className="mt-3 mb-1.5 text-base font-semibold text-slate-900 dark:text-slate-100">{children}</h2>,
            h3: ({ children }) => <h3 className="mt-2 mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{children}</h3>,
            strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-50">{children}</strong>,
            code: ({ children }) => (
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800 dark:bg-[#2a3140] dark:text-slate-100">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
