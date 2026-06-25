"use client";

import { useState } from "react";
import { useChatbotIndexStatus } from "@/features/chatbot/hooks";
import AiChatPanel from "./AiChatPanel";

const INDEXABLE_TYPES = new Set(["pdf", "slides", "doc"]);

export default function MaterialAiAssistant({ materialId, rawMaterial, variant = "sidebar" }) {
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

  if (variant === "floating") {
    return (
      <>
        <button
          type="button"
          onClick={openPanel}
          disabled={isFailed}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
          </svg>
          Ask AI
        </button>
        <AiChatPanel
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          materialId={materialId}
          rawMaterial={rawMaterial}
        />
      </>
    );
  }

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

      <AiChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        materialId={materialId}
        rawMaterial={rawMaterial}
      />
    </>
  );
}
