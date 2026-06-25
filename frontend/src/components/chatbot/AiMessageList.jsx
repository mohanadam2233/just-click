"use client";

import AiMessage from "./AiMessage";
import AiSourceChips from "./AiSourceChips";

function ThinkingDots() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <span className="inline-flex gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400 [animation-delay:300ms]" />
        </span>
        <span>Reading this material...</span>
      </div>
    </div>
  );
}

export default function AiMessageList({ messages, isLoading }) {
  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
      {messages.length === 0 && !isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          Hi, I can help with this material.
          <br />
          Ask me to summarize, explain, quiz you, or generate study questions.
        </div>
      )}

      {messages.map((message, index) => (
        <div key={`${message.role}-${index}`} className="space-y-2">
          <AiMessage role={message.role} content={message.content} />
          {message.role === "assistant" && message.sources?.length > 0 && (
            <AiSourceChips sources={message.sources} />
          )}
        </div>
      ))}

      {isLoading && <ThinkingDots />}
    </div>
  );
}
