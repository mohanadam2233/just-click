"use client";

import { useEffect, useRef, useState } from "react";
import AiMessage from "./AiMessage";
import AiSourceChips from "./AiSourceChips";

function BotIcon() {
  return (
    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
        <BotIcon />
      </span>
      <span className="inline-flex gap-1 pt-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
      </span>
    </div>
  );
}

export default function AiMessageList({ messages, isLoading, isWide = false }) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;

    const onScroll = () => {
      setShowScrollTop(node.scrollTop > 240);
    };

    onScroll();
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        className={`h-full overflow-y-auto overscroll-contain ${
          isWide ? "px-6 py-5" : "px-3 py-3"
        }`}
      >
        <div className={`mx-auto flex flex-col gap-4 ${isWide ? "max-w-3xl" : ""}`}>
          {messages.length === 0 && !isLoading && (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                <BotIcon />
              </span>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Hi, I can help with this material. Ask me to summarize, explain, quiz you, or generate study questions.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className="space-y-1.5">
              <AiMessage role={message.role} content={message.content} isError={message.isError} />
              {message.role === "assistant" && message.sources?.length > 0 && (
                <AiSourceChips sources={message.sources} />
              )}
            </div>
          ))}

          {isLoading && <ThinkingDots />}
          <div ref={bottomRef} />
        </div>
      </div>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll chat to top"
          className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe3ee] bg-white/95 text-slate-600 shadow-md backdrop-blur transition hover:border-indigo-200 hover:text-indigo-600 dark:border-[#313a4d] dark:bg-[#1f2633]/95 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
