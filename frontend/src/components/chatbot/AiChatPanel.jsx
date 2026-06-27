"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useAskChatbot,
  useChatbotIndexStatus,
  useChatHistory,
  useCreateChatSession,
} from "@/features/chatbot/hooks";
import useNotify from "@/hooks/useNotify";
import AiChatSidebar from "./AiChatSidebar";
import AiComposer from "./AiComposer";
import AiIndexStatus from "./AiIndexStatus";
import AiMessageList from "./AiMessageList";
import AiQuickChips from "./AiQuickChips";
import {
  BotGlyph,
  IconButton,
  IconClose,
  IconExpand,
  IconHistory,
  IconPanelLeft,
  IconRestore,
} from "./AiChatIcons";
import {
  clearCurrentSessionId,
  loadSessionList,
  readCurrentSessionId,
  storeCurrentSessionId,
  titleFromQuestion,
  upsertSessionEntry,
} from "./chatSessionStorage";

function buildHeaderTitle(rawMaterial) {
  const title = rawMaterial?.title || "Material";
  const chapter = rawMaterial?.context?.chapter;
  if (chapter?.number) {
    return `${title} — Ch ${chapter.number}`;
  }
  return title;
}

function mergeSessionsForDisplay(sessionList, sessionId, messages) {
  if (!sessionId) return sessionList;
  if (sessionList.some((item) => item.sessionId === sessionId)) return sessionList;

  const firstUser = messages.find((item) => item.role === "user");
  return [
    {
      sessionId,
      title: firstUser ? titleFromQuestion(firstUser.content) : "Current chat",
      updatedAt: new Date().toISOString(),
    },
    ...sessionList,
  ];
}

export default function AiChatPanel({ isOpen, onClose, materialId, rawMaterial }) {
  const notify = useNotify();
  const headerTitle = buildHeaderTitle(rawMaterial);
  const [mounted, setMounted] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [sessionList, setSessionList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const historyLoadedRef = useRef(false);

  const { data: indexStatusData } = useChatbotIndexStatus(materialId, { enabled: isOpen && !!materialId });
  const indexStatus = indexStatusData?.index_status || "pending";
  const isIndexed = indexStatus === "indexed";
  const isChatDisabled = !isIndexed;

  const createSession = useCreateChatSession();
  const askChatbot = useAskChatbot();
  const { data: historyRows = [] } = useChatHistory(sessionId, {
    enabled: isOpen && !!sessionId,
  });

  const isLoading = createSession.isPending || askChatbot.isPending;

  const displaySessions = useMemo(
    () => mergeSessionsForDisplay(sessionList, sessionId, messages),
    [sessionList, sessionId, messages],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !materialId) return;

    const storedSessionId = readCurrentSessionId(materialId);
    let list = loadSessionList(materialId);

    if (storedSessionId && !list.some((item) => item.sessionId === storedSessionId)) {
      list = upsertSessionEntry(materialId, { sessionId: storedSessionId, title: "Current chat" });
    }

    setSessionList(list);
    setSessionId(storedSessionId);
    if (!storedSessionId) {
      setMessages([]);
    }
    historyLoadedRef.current = false;
    setHistoryDrawerOpen(false);
  }, [isOpen, materialId]);

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.classList.add("chat-panel-open");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("chat-panel-open", "chat-panel-fullscreen");
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (isFullscreen) {
      document.body.classList.add("chat-panel-fullscreen");
    } else {
      document.body.classList.remove("chat-panel-fullscreen");
    }
  }, [isOpen, isFullscreen]);

  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setSidebarOpen(true);
      setHistoryDrawerOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("chat-panel-fullscreen");
    } else {
      document.body.classList.remove("chat-panel-fullscreen");
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (historyDrawerOpen) {
        setHistoryDrawerOpen(false);
        return;
      }
      if (isFullscreen) {
        setIsFullscreen(false);
        return;
      }
      onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isFullscreen, historyDrawerOpen, onClose]);

  useEffect(() => {
    if (!sessionId || !historyRows.length || historyLoadedRef.current) return;
    setMessages(
      historyRows.map((row) => ({
        role: row.role,
        content: row.content,
      })),
    );
    historyLoadedRef.current = true;

    const firstUser = historyRows.find((row) => row.role === "user");
    if (firstUser && materialId) {
      const next = upsertSessionEntry(materialId, {
        sessionId,
        title: titleFromQuestion(firstUser.content),
      });
      setSessionList(next);
    }
  }, [sessionId, historyRows, materialId]);


  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const response = await createSession.mutateAsync({
      material_id: materialId,
      scope: "material",
    });
    const newSessionId = response?.data?.session_id || response?.session_id;
    if (!newSessionId) throw new Error("Could not start AI session.");
    setSessionId(newSessionId);
    storeCurrentSessionId(materialId, newSessionId);
    const next = upsertSessionEntry(materialId, { sessionId: newSessionId, title: "New chat" });
    setSessionList(next);
    return newSessionId;
  };

  const sendQuestion = async (question) => {
    const trimmed = (question || "").trim();
    if (!trimmed || isChatDisabled || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInputValue("");

    try {
      const activeSessionId = await ensureSession();
      const next = upsertSessionEntry(materialId, {
        sessionId: activeSessionId,
        title: titleFromQuestion(trimmed),
      });
      setSessionList(next);

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
      setSessionList(
        upsertSessionEntry(materialId, {
          sessionId: activeSessionId,
          title: titleFromQuestion(trimmed),
        }),
      );
    } catch (error) {
      notify.error(error?.message || "Could not get an AI answer.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not answer that right now. Please try again in a moment.",
          isError: true,
        },
      ]);
    }
  };

  const handleNewChat = () => {
    clearCurrentSessionId(materialId);
    setSessionId(null);
    setMessages([]);
    historyLoadedRef.current = false;
    setHistoryDrawerOpen(false);
  };

  const handleSelectSession = (nextSessionId) => {
    if (!nextSessionId || nextSessionId === sessionId) {
      setHistoryDrawerOpen(false);
      return;
    }
    setSessionId(nextSessionId);
    storeCurrentSessionId(materialId, nextSessionId);
    setMessages([]);
    historyLoadedRef.current = false;
    setHistoryDrawerOpen(false);
  };

  if (!isOpen || !mounted) return null;

  const shellClass = isFullscreen
    ? "fixed inset-0 z-[9999] flex bg-[#f8fafc] dark:bg-[#161a21]"
    : "fixed top-14 right-0 bottom-0 z-[200] flex w-full max-w-[420px] flex-col border-l border-[#e2e8f0] bg-[#f8fafc] shadow-2xl dark:border-[#2d3548] dark:bg-[#161a21]";

  const panel = (
    <>
      {!isFullscreen && (
        <div
          className="fixed inset-0 z-[199] bg-black/20 dark:bg-black/40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div className={shellClass}>
        {isFullscreen && sidebarOpen && (
          <AiChatSidebar
            sessions={displaySessions}
            activeSessionId={sessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onCollapse={() => setSidebarOpen(false)}
            showCollapse
            materialTitle={headerTitle}
          />
        )}

        {isFullscreen && !sidebarOpen && (
          <div className="flex w-11 flex-shrink-0 flex-col items-center border-r border-[#e2e8f0] bg-[#f4f6f9] py-3 dark:border-[#2d3548] dark:bg-[#141820]">
            <IconButton label="Show chat history" onClick={() => setSidebarOpen(true)}>
              <IconPanelLeft />
            </IconButton>
          </div>
        )}

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {!isFullscreen && historyDrawerOpen && (
            <>
              <button
                type="button"
                className="absolute inset-0 z-20 bg-black/10 dark:bg-black/30"
                onClick={() => setHistoryDrawerOpen(false)}
                aria-label="Close chat history"
              />
              <div className="absolute inset-y-0 left-0 z-30 shadow-xl">
                <AiChatSidebar
                  sessions={displaySessions}
                  activeSessionId={sessionId}
                  onSelectSession={handleSelectSession}
                  onNewChat={handleNewChat}
                  materialTitle={headerTitle}
                />
              </div>
            </>
          )}

          <header className="flex h-11 flex-shrink-0 items-center gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-3 dark:border-[#2d3548] dark:bg-[#161a21]">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-[#252d3d] dark:text-indigo-300">
              <BotGlyph className="h-3.5 w-3.5" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {headerTitle}
            </p>

            <div className="flex flex-shrink-0 items-center gap-0.5">
              {!isFullscreen && (
                <IconButton
                  label="Chat history"
                  onClick={() => setHistoryDrawerOpen((prev) => !prev)}
                  active={historyDrawerOpen}
                >
                  <IconHistory />
                </IconButton>
              )}

              {isFullscreen ? (
                <IconButton label="Exit full screen" onClick={() => setIsFullscreen(false)}>
                  <IconRestore />
                </IconButton>
              ) : (
                <IconButton
                  label="Open full screen"
                  onClick={() => {
                    setIsFullscreen(true);
                    setSidebarOpen(true);
                  }}
                >
                  <IconExpand />
                </IconButton>
              )}

              <IconButton label="Close assistant" onClick={onClose}>
                <IconClose />
              </IconButton>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fbfcfe] dark:bg-[#1b202a]">
            {!isIndexed && (
              <div className="flex-shrink-0 px-3 pt-3">
                <AiIndexStatus status={indexStatus} />
              </div>
            )}

            <AiMessageList messages={messages} isLoading={isLoading} isWide={isFullscreen} />

            {messages.length === 0 && isIndexed && (
              <AiQuickChips
                onSelect={sendQuestion}
                disabled={isChatDisabled || isLoading}
                isWide={isFullscreen}
              />
            )}
          </div>

          <AiComposer
            value={inputValue}
            onChange={setInputValue}
            onSend={() => sendQuestion(inputValue)}
            disabled={isChatDisabled || isLoading}
            isWide={isFullscreen}
          />
        </div>
      </div>
    </>
  );

  return createPortal(panel, document.body);
}
