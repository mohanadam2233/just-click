"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const MOCK_RESPONSES = [
  "I've analyzed your question carefully. Based on the context provided, the key insight here is that learning is most effective when broken into structured, manageable chunks with regular review sessions.",
  "Great question! The materials you've uploaded suggest a clear learning pathway. I recommend starting with the foundational modules before advancing to the more complex topics covered later in the curriculum.",
  "Based on what you've shared, I can see three main areas worth focusing on: conceptual understanding, practical application, and self-assessment. Let me break each of these down for you.",
  "That's an interesting perspective. From an academic standpoint, the evidence supporting spaced repetition is quite robust — students who review material at increasing intervals retain information significantly longer.",
];

const STARTER_PROMPTS = [
  "Summarize my uploaded documents",
  "Create a study plan for this week",
  "Generate 10 quiz questions",
  "Explain the hardest concept simply",
];

function generateChatTitle(firstMessage) {
  const words = firstMessage.trim().split(/\s+/).slice(0, 5).join(" ");
  return words.length > 0 ? words + (firstMessage.split(" ").length > 5 ? "…" : "") : "New chat";
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

// ─── Message ──────────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex gap-4 max-w-4xl w-full ${isUser ? "flex-row-reverse" : "flex-row"} items-start px-4 md:px-8`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm mt-1 ${
          isUser
            ? "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
            : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
        }`}>
          {isUser ? "U" : "✦"}
        </div>
        
        {/* Content */}
        <div className={`flex flex-col gap-1 min-w-0 ${isUser ? "items-end" : "items-start"}`}>
          <span className="text-[11px] font-medium text-gray-400 px-1 font-semibold uppercase tracking-wider hidden md:block">
            {isUser ? "You" : "JustClick AI"}
          </span>
          <div className={`text-[15px] leading-relaxed break-words px-4 py-3 rounded-2xl ${
            isUser 
              ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-br-sm" 
              : "bg-transparent text-gray-800 dark:text-gray-200"
          }`}>
            {msg.typing ? <TypingDots /> : msg.content}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AiPage() {
  const [chats, setChats] = useState([]);          
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const messages = activeChat?.messages ?? [];

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => { inputRef.current?.focus(); }, [activeChatId]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const createChat = useCallback(() => {
    const id = uid();
    setChats((prev) => [{ id, title: "New chat", messages: [] }, ...prev]);
    setActiveChatId(id);
    setInput("");
    inputRef.current?.focus();
  }, []);

  const deleteChat = useCallback((id) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeChatId === id) setActiveChatId(next[0]?.id ?? null);
      return next;
    });
  }, [activeChatId]);

  const send = useCallback((text) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg = { id: uid(), role: "user", content };

    let chatId = activeChatId;
    if (!chatId) {
      chatId = uid();
      setChats((prev) => [{ id: chatId, title: generateChatTitle(content), messages: [userMsg] }, ...prev]);
      setActiveChatId(chatId);
    } else {
      setChats((prev) => prev.map((c) => {
        if (c.id !== chatId) return c;
        const updated = { ...c, messages: [...c.messages, userMsg] };
        if (c.messages.length === 0) updated.title = generateChatTitle(content);
        return updated;
      }));
    }

    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg = { id: uid(), role: "ai", content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)] };
      setIsTyping(false);
      setChats((prev) => prev.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, aiMsg] } : c));
    }, 1000 + Math.random() * 800);
  }, [input, isTyping, activeChatId]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#131314] text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      
      {/* ─── SIDEBAR ──────────────────────────────────────────────────────────── */}
      <aside className={`
        flex-shrink-0 flex flex-col h-full bg-[#f0f4f9] dark:bg-[#1e1f20] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${sidebarOpen ? "w-[280px]" : "w-0 -ml-[280px] md:ml-0 md:w-[68px] overflow-hidden"}
      `}>
        {/* Top (Menu + New Chat) */}
        <div className="p-3 pb-4 space-y-4">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(p => !p)}
              className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors tooltip"
              title="Collapse menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <button
            onClick={createChat}
            className={`
              flex items-center gap-3 w-max transition-all duration-200
              ${sidebarOpen ? "px-4 py-3 bg-[#e8def8] dark:bg-[#4a4458] hover:shadow-md rounded-[18px] text-[#1d192b] dark:text-[#e8def8]" : "p-3 mx-auto bg-transparent hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-700 dark:text-gray-300"}
            `}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {sidebarOpen && <span className="text-[14px] font-medium whitespace-nowrap">New chat</span>}
          </button>
        </div>

        {/* Chat History */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
            <div className="mb-2 px-3 text-[12px] font-medium text-gray-500 dark:text-gray-400">Recent</div>
            <div className="space-y-0.5">
              {chats.map(c => (
                <div key={c.id} className="relative group">
                  <button
                    onClick={() => setActiveChatId(c.id)}
                    className={`
                      w-full text-left flex items-center gap-3 px-3 py-[10px] rounded-[18px] transition-colors
                      ${activeChatId === c.id ? "bg-[#d3e3fd] text-[#041e49] dark:bg-[#004a77] dark:text-[#c2e7ff]" : "hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"}
                    `}
                  >
                    <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-[13px] font-medium truncate flex-1">{c.title}</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                    className="absolute right-2 top-[calc(50%-14px)] p-1.5 opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all text-gray-500 hover:text-red-500"
                    title="Delete chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ─── MAIN AREA ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-white dark:bg-[#131314]">
        
        {/* Top Header */}
        <header className="flex items-center justify-between p-4 flex-shrink-0 h-[64px]">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors md:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link href="/materials" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="text-[17px] font-medium text-gray-500 dark:text-gray-400">JustClick</span>
              <span className="text-[17px] font-semibold text-gray-800 dark:text-gray-200">AI</span>
            </Link>
          </div>
          
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            U
          </div>
        </header>

        {/* Scrollable Message History Area */}
        <div className="flex-1 overflow-y-auto px-4 w-full custom-scrollbar scroll-smooth">
          {messages.length === 0 && !isTyping ? (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4 mt-[-8vh]">
              {/* Header Gradient Text */}
              <div className="w-full text-center mb-8">
                <h1 className="text-[44px] sm:text-[56px] tracking-tight font-semibold leading-tight bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#fbbc04] bg-clip-text text-transparent">
                  Hello, eng-abdullahi
                </h1>
                <h2 className="text-[36px] sm:text-[44px] font-medium text-[#c4c7c5] mt-1 leading-tight tracking-tight">
                  How can I help you today?
                </h2>
              </div>

              {/* Starter cards grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                {STARTER_PROMPTS.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="flex flex-col text-left p-4 h-[120px] rounded-2xl bg-[#f0f4f9] dark:bg-[#1e1f20] hover:bg-[#e9eef6] dark:hover:bg-[#2a2b2c] transition-colors"
                  >
                    <span className="text-[15px] text-gray-700 dark:text-gray-200 leading-snug line-clamp-3">
                      {p}
                    </span>
                    <div className="mt-auto flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-[#131314] flex items-center justify-center shadow-sm text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto pt-6 flex flex-col">
              {messages.map((m) => <Message key={m.id} msg={m} />)}
              {isTyping && <Message msg={{ role: "ai", typing: true }} />}
              <div ref={bottomRef} className="h-8" />
            </div>
          )}
        </div>

        {/* ── Fixed Sticky Bottom Prompt Bar ───────────────────────────────── */}
        <div className="w-full flex-shrink-0 bg-white dark:bg-[#131314] pb-6 pt-2">
          <div className="max-w-[830px] mx-auto px-4 md:px-8">
            <div className={`
              relative flex items-end w-full rounded-3xl transition-all duration-200 
              bg-[#f0f4f9] dark:bg-[#1e1f20] 
              border border-transparent
              focus-within:border-gray-200 dark:focus-within:border-white/10
              focus-within:bg-white dark:focus-within:bg-[#1e1f20]
              shadow-[0_2px_6px_rgba(0,0,0,0.05)] focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.1)]
            `}>
              <button 
                title="Upload file"
                className="flex-shrink-0 p-3 m-1 rounded-full text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
                </svg>
              </button>

              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                }}
                onKeyDown={handleKey}
                placeholder="Enter a prompt here"
                className="flex-1 bg-transparent outline-none border-none py-[18px] min-h-[60px] max-h-[200px] text-[16px] text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none custom-scrollbar"
              />

              <button
                onClick={() => send()}
                disabled={!input.trim() || isTyping}
                title="Submit"
                className={`flex-shrink-0 p-2 m-2 rounded-full transition-all duration-200 ${
                  input.trim() && !isTyping 
                    ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-80" 
                    : "bg-transparent text-gray-400"
                }`}
              >
                <svg className="w-5 h-5 pl-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="text-center mt-3">
              <span className="text-[12px] text-gray-500 dark:text-gray-400">
                AI Studio may display inaccurate info, including about people, so double-check its responses.
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
