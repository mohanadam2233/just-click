"use client";

import { useEffect, useState } from "react";
import {
  useAskChatbot,
  useChatbotIndexStatus,
  useCreateChatSession,
} from "@/features/chatbot/hooks";
import useNotify from "@/hooks/useNotify";
import AiComposer from "./AiComposer";
import AiIndexStatus from "./AiIndexStatus";
import AiMessageList from "./AiMessageList";
import AiQuickChips from "./AiQuickChips";

function buildContextHeader(rawMaterial) {
  const ctx = rawMaterial?.context || {};
  const parts = [
    ctx.course?.title,
    ctx.semester?.name || (ctx.semester?.number ? `Semester ${ctx.semester.number}` : null),
  ].filter(Boolean);

  return {
    title: rawMaterial?.title || "Material",
    subtitle: parts.join(" · "),
    chapter: ctx.chapter?.title ? `Chapter ${ctx.chapter.number}: ${ctx.chapter.title}` : null,
  };
}

export default function AiChatPanel({ isOpen, onClose, materialId, rawMaterial }) {
  const notify = useNotify();
  const header = buildContextHeader(rawMaterial);

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const { data: indexStatusData } = useChatbotIndexStatus(materialId, { enabled: isOpen && !!materialId });
  const indexStatus = indexStatusData?.index_status || "pending";
  const isIndexed = indexStatus === "indexed";
  const isChatDisabled = !isIndexed;

  const createSession = useCreateChatSession();
  const askChatbot = useAskChatbot();

  const isLoading = createSession.isPending || askChatbot.isPending;

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const response = await createSession.mutateAsync({
      material_id: materialId,
      scope: "material",
    });
    const newSessionId = response?.data?.session_id || response?.session_id;
    if (!newSessionId) throw new Error("Could not start AI session.");
    setSessionId(newSessionId);
    return newSessionId;
  };

  const sendQuestion = async (question) => {
    const trimmed = (question || "").trim();
    if (!trimmed || isChatDisabled || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInputValue("");

    try {
      const activeSessionId = await ensureSession();
      const response = await askChatbot.mutateAsync({
        session_id: activeSessionId,
        question: trimmed,
      });
      const payload = response?.data ?? response;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload?.answer || "No answer returned.",
          sources: payload?.sources || [],
        },
      ]);
    } catch (error) {
      notify.error(error?.message || "Could not get an AI answer.");
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:bg-black/10"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-slate-200 bg-[#f8fafc] shadow-2xl dark:border-slate-800 dark:bg-[#0f0f0f] md:w-[480px]">
        <header className="flex-shrink-0 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-[#111827]/90">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{header.title}</p>
              {header.subtitle && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{header.subtitle}</p>
              )}
              {header.chapter && (
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">{header.chapter}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-400">
                  This material only
                </span>
                {isIndexed && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    AI Ready
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Close AI assistant"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {!isIndexed && (
          <div className="px-4 pt-4">
            <AiIndexStatus status={indexStatus} />
          </div>
        )}

        <AiMessageList messages={messages} isLoading={isLoading} />

        {messages.length === 0 && isIndexed && (
          <AiQuickChips onSelect={sendQuestion} disabled={isChatDisabled || isLoading} />
        )}

        <AiComposer
          value={inputValue}
          onChange={setInputValue}
          onSend={() => sendQuestion(inputValue)}
          disabled={isChatDisabled || isLoading}
        />
      </aside>
    </>
  );
}
