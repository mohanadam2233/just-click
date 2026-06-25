"use client";

import ReactMarkdown from "react-markdown";

export default function AiMessage({ role, content }) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-slate-800 dark:bg-[#1c1c1e] dark:text-slate-100">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="my-2">{children}</p>,
            ul: ({ children }) => <ul className="my-2 ml-5 list-disc space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="my-2 ml-5 list-decimal space-y-1">{children}</ol>,
            h2: ({ children }) => <h2 className="mt-4 mb-2 text-base font-semibold">{children}</h2>,
            h3: ({ children }) => <h3 className="mt-3 mb-2 text-sm font-semibold">{children}</h3>,
            strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
            code: ({ children }) => <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">{children}</code>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
