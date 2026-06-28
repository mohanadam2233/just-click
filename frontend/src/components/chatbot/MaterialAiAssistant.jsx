"use client";

import { useState } from "react";
import { useChatbotIndexStatus } from "@/features/chatbot/hooks";
import AiChatPanel from "./AiChatPanel";

const INDEXABLE_TYPES = new Set(["pdf", "slides", "doc"]);

export default function MaterialAiAssistant({ materialId, rawMaterial }) {
  const [isOpen, setIsOpen] = useState(false);

  const hasFile = Boolean(rawMaterial?.file?.read_url || rawMaterial?.file_url);
  const materialType = String(rawMaterial?.material_type || "").toLowerCase();
  const isIndexableType = INDEXABLE_TYPES.has(materialType);

  const { data: indexStatusData } = useChatbotIndexStatus(materialId, {
    enabled: !!materialId && isIndexableType && hasFile,
  });

  const indexStatus = indexStatusData?.index_status;
  const showAi = isIndexableType && hasFile;
  const isReady = indexStatus === "indexed";
  const isPreparing = indexStatus === "pending" || indexStatus === "indexing";
  const isFailed = indexStatus === "failed";

  if (!showAi) return null;

  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        disabled={isFailed}
        className={`w-full py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          isFailed
            ? "bg-white/5 text-white/50 border border-white/10 cursor-not-allowed"
            : isReady
              ? "bg-indigo-500 hover:bg-indigo-400 text-white"
              : "bg-indigo-500/70 hover:bg-indigo-400/80 text-white"
        }`}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
        </svg>
        {isReady ? "Ask AI About This Material" : isPreparing ? "AI Preparing..." : "Ask AI About This Material"}
      </button>

      {!isOpen && (
        <button
          type="button"
          onClick={openPanel}
          disabled={isFailed}
          aria-label="Open AI assistant"
          className={`fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-base text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#2a2a2a] dark:bg-[#111827] dark:text-indigo-400 dark:hover:bg-[#1a1a1a] ${
            isFailed ? "pointer-events-none opacity-0" : ""
          }`}
        >
          ✦
        </button>
      )}

      <AiChatPanel
        isOpen={isOpen}
        onClose={closePanel}
        materialId={materialId}
        rawMaterial={rawMaterial}
      />
    </>
  );
}
