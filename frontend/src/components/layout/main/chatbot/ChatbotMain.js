"use client";

import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import {
  useAskChatbot,
  useChatbotSemesters,
  useChatbotSubjects,
  useCreateChatSession,
  useDeleteChatSession,
} from "@/features/chatbot/hooks";
import { chatbotApi } from "@/features/chatbot/api";
import useNotify from "@/hooks/useNotify";

const STORAGE_KEY = "justclick_chatbot_recent_chats";

const quickPrompts = [
  "Make quizzes from this subject",
  "Summarize my notes",
  "Give me important exam topics",
  "Explain this chapter simply",
];

function loadRecentChats() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentChats(chats) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function MarkdownMessage({ children }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children: content }) => <p className="my-2 leading-7">{content}</p>,
        ul: ({ children: content }) => <ul className="my-2 ml-5 list-disc space-y-1">{content}</ul>,
        ol: ({ children: content }) => <ol className="my-2 ml-5 list-decimal space-y-1">{content}</ol>,
        h2: ({ children: content }) => <h2 className="mt-4 mb-2 text-lg font-semibold">{content}</h2>,
        h3: ({ children: content }) => <h3 className="mt-3 mb-2 text-base font-semibold">{content}</h3>,
        strong: ({ children: content }) => <strong className="font-semibold text-slate-900 dark:text-white">{content}</strong>,
        code: ({ children: content }) => <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">{content}</code>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function ChatSidebar({ open, recentChats, activeSessionId, onToggle, onNewChat, onSelectChat, onDeleteChat }) {
  return (
    <aside
      className={`h-full flex-shrink-0 flex-col border-r border-slate-200/80 bg-slate-100/80 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/60 ${
        open ? "flex w-72 p-4" : "hidden w-0 md:flex md:w-[68px] md:p-3"
      }`}
    >
      <div className="mb-5 flex min-h-10 items-center justify-between">
        {open ? (
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 text-white">J</span>
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-lg text-transparent">
              JustClick AI
            </span>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-900"
          aria-label="Toggle chat sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open ? (
        <>
          <button
            type="button"
            onClick={onNewChat}
            className="mb-5 w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95"
          >
            New Chat
          </button>

          <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent
          </div>

          <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {recentChats.length === 0 ? (
              <li className="py-8 text-center text-sm italic text-slate-400">No recent chats</li>
            ) : (
              recentChats.map((chat) => (
                <li
                  key={chat.id}
                  className={`group flex items-center gap-2 rounded-xl p-1.5 transition ${
                    activeSessionId === chat.id ? "bg-white dark:bg-slate-900" : "hover:bg-white/70 dark:hover:bg-slate-900/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat)}
                    className="min-w-0 flex-1 truncate px-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {chat.title || `${chat.subject} - ${chat.semester}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteChat(chat.id)}
                    className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-pink-50 hover:text-pink-600 group-hover:opacity-100 dark:hover:bg-pink-950/30"
                    aria-label="Delete chat"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m5 5v6m4-6v6" />
                    </svg>
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      ) : null}
    </aside>
  );
}

export default function ChatbotMain() {
  const notify = useNotify();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [question, setQuestion] = useState("");
  const [semesterOpen, setSemesterOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const bottomRef = useRef(null);

  const { data: semesters = [], isLoading: isLoadingSemesters } = useChatbotSemesters();
  const { data: subjects = [], isLoading: isLoadingSubjects } = useChatbotSubjects(selectedSemester);
  const createSession = useCreateChatSession();
  const askChatbot = useAskChatbot();
  const deleteSession = useDeleteChatSession();

  useEffect(() => {
    setRecentChats(loadRecentChats());
  }, []);

  useEffect(() => {
    saveRecentChats(recentChats);
  }, [recentChats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askChatbot.isPending]);

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
  };

  const selectChat = async (chat) => {
    setSelectedSemester(chat.semester);
    setSelectedSubject(chat.subject);
    setSessionId(chat.id);
    setMessages([]);
    try {
      const payload = await chatbotApi.getHistory(chat.id);
      setMessages(payload?.data?.data ?? payload?.data ?? []);
    } catch (err) {
      notify.error(err?.message || "Failed to load chat history");
    }
  };

  const removeChat = (chatId) => {
    deleteSession.mutate(chatId, {
      onSuccess: () => {
        const next = recentChats.filter((chat) => chat.id !== chatId);
        setRecentChats(next);
        if (sessionId === chatId) {
          setSessionId(null);
          setMessages([]);
        }
      },
      onError: (err) => notify.error(err?.message || "Failed to delete chat"),
    });
  };

  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const response = await createSession.mutateAsync({
      semester: selectedSemester,
      subject: selectedSubject,
    });
    const nextSessionId = response?.data?.session_id;
    if (!nextSessionId) throw new Error("Failed to create chat session");
    const nextChat = {
      id: nextSessionId,
      semester: selectedSemester,
      subject: selectedSubject,
      title: `${selectedSubject} - ${selectedSemester}`,
    };
    setSessionId(nextSessionId);
    setRecentChats((prev) => [nextChat, ...prev.filter((chat) => chat.id !== nextSessionId)]);
    return nextSessionId;
  };

  const sendQuestion = async (customQuestion) => {
    const finalQuestion = String(customQuestion ?? question).trim();
    if (!selectedSemester || !selectedSubject || !finalQuestion || askChatbot.isPending) return;

    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: finalQuestion }]);

    try {
      const activeSessionId = await ensureSession();
      const response = await askChatbot.mutateAsync({
        session_id: activeSessionId,
        semester: selectedSemester,
        subject: selectedSubject,
        question: finalQuestion,
      });
      const answer = response?.data?.answer || "No answer returned.";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      notify.error(err?.message || "Failed to get answer");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong while answering. Please try again." },
      ]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <ChatSidebar
        open={sidebarOpen}
        recentChats={recentChats}
        activeSessionId={sessionId}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onDeleteChat={removeChat}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center border-b border-slate-200/80 bg-white/70 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          {!sidebarOpen ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Show sidebar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          ) : null}
          <div className="ml-2 min-w-0">
            <p className="truncate text-sm font-semibold">Material Assistant</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {selectedSubject && selectedSemester ? `${selectedSubject} - ${selectedSemester}` : "Choose a semester and subject"}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          {messages.length === 0 && !askChatbot.isPending ? (
            <div className="mx-auto max-w-2xl pt-14 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Ask your uploaded course materials
              </h1>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                Select a semester and subject, then ask for explanations, summaries, quizzes, or exam prep.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendQuestion(prompt)}
                    disabled={!selectedSemester || !selectedSubject}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 disabled:pointer-events-none disabled:opacity-45 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-violet-600 dark:hover:bg-violet-950/20"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div key={`${message.role}-${index}`} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <span className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {isUser ? "You" : "JustClick AI"}
                    </span>
                    <div
                      className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm md:text-base ${
                        isUser
                          ? "rounded-tr-sm border-transparent bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                          : "rounded-tl-sm border-slate-200 bg-white/85 text-slate-800 dark:border-slate-800 dark:bg-slate-900/85 dark:text-slate-200"
                      }`}
                    >
                      {isUser ? message.content : <MarkdownMessage>{message.content}</MarkdownMessage>}
                    </div>
                  </div>
                );
              })}

              {askChatbot.isPending ? (
                <div className="flex flex-col items-start">
                  <span className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">JustClick AI</span>
                  <div className="w-full max-w-md rounded-2xl rounded-tl-sm border border-slate-200 bg-white/85 px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-300">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                      Searching course materials
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full w-full animate-pulse bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />
                    </div>
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mb-3 flex flex-wrap gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSemesterOpen((prev) => !prev);
                    setSubjectOpen(false);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
                >
                  {isLoadingSemesters ? "Loading..." : selectedSemester || "Semester"} v
                </button>
                {semesterOpen ? (
                  <div className="absolute bottom-full left-0 z-20 mb-2 max-h-60 w-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    {semesters.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400">No semesters</div>
                    ) : semesters.map((semester) => (
                      <button
                        key={semester}
                        type="button"
                        onClick={() => {
                          setSelectedSemester(semester);
                          setSelectedSubject("");
                          setSessionId(null);
                          setMessages([]);
                          setSemesterOpen(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {semester}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  disabled={!selectedSemester}
                  onClick={() => {
                    setSubjectOpen((prev) => !prev);
                    setSemesterOpen(false);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
                >
                  {isLoadingSubjects ? "Loading..." : selectedSubject || "Subject"} v
                </button>
                {subjectOpen ? (
                  <div className="absolute bottom-full left-0 z-20 mb-2 max-h-60 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    {subjects.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400">No subjects</div>
                    ) : subjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(subject);
                          setSessionId(null);
                          setMessages([]);
                          setSubjectOpen(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-end gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={askChatbot.isPending}
                placeholder="Ask anything about your subject..."
                className="max-h-36 min-h-6 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-400 md:text-base"
              />
              <button
                type="button"
                onClick={() => sendQuestion()}
                disabled={askChatbot.isPending || !selectedSemester || !selectedSubject || !question.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md transition hover:opacity-95 disabled:opacity-30"
                aria-label="Send message"
              >
                {askChatbot.isPending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg className="h-5 w-5 rotate-45" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
