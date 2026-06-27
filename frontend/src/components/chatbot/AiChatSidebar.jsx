"use client";

import { useMemo, useState } from "react";
import { groupSessionsByDate } from "./chatSessionStorage";
import { IconButton, IconPanelLeft } from "./AiChatIcons";

export default function AiChatSidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onCollapse,
  showCollapse = false,
  materialTitle = "Material",
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((item) => (item.title || "").toLowerCase().includes(q));
  }, [query, sessions]);

  const groups = useMemo(() => groupSessionsByDate(filtered), [filtered]);

  return (
    <aside className="flex h-full w-[248px] flex-shrink-0 flex-col border-r border-[#e5e9f0] bg-[#f4f6f9] dark:border-[#2d3548] dark:bg-[#141820]">
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[#e5e9f0] px-3 py-3 dark:border-[#2d3548]">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-100">
            JustClick AI
          </p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{materialTitle}</p>
        </div>
        {showCollapse && onCollapse && (
          <IconButton label="Collapse sidebar" onClick={onCollapse}>
            <IconPanelLeft />
          </IconButton>
        )}
      </div>

      <div className="flex-shrink-0 space-y-2 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg border border-[#d8dee8] bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-[#313a4d] dark:bg-[#1c212b] dark:text-slate-200 dark:hover:bg-[#222938]"
        >
          <span className="text-base leading-none text-slate-500">+</span>
          <span>New chat</span>
        </button>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chats..."
          className="w-full rounded-lg border border-[#d8dee8] bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-[#313a4d] dark:bg-[#1c212b] dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
        {groups.length === 0 && (
          <p className="px-2 py-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Your chats for this material will appear here.
          </p>
        )}

        {groups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.sessions.map((session) => {
                const isActive = session.sessionId === activeSessionId;
                return (
                  <button
                    key={session.sessionId}
                    type="button"
                    onClick={() => onSelectSession(session.sessionId)}
                    className={`w-full rounded-md px-2.5 py-2 text-left text-[13px] transition ${
                      isActive
                        ? "bg-white text-slate-900 shadow-sm dark:bg-[#1f2633] dark:text-slate-100"
                        : "text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-[#1a2030]"
                    }`}
                  >
                    <span className="line-clamp-2 leading-snug">{session.title || "New chat"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
