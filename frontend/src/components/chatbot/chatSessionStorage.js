const CURRENT_SESSION_PREFIX = "chatbot-session:";
const SESSION_LIST_PREFIX = "chatbot-sessions:";

export function currentSessionKey(materialId) {
  return `${CURRENT_SESSION_PREFIX}${materialId}`;
}

export function sessionListKey(materialId) {
  return `${SESSION_LIST_PREFIX}${materialId}`;
}

export function readCurrentSessionId(materialId) {
  if (typeof window === "undefined" || !materialId) return null;
  return window.sessionStorage.getItem(currentSessionKey(materialId));
}

export function storeCurrentSessionId(materialId, sessionId) {
  if (typeof window === "undefined" || !materialId || !sessionId) return;
  window.sessionStorage.setItem(currentSessionKey(materialId), sessionId);
}

export function clearCurrentSessionId(materialId) {
  if (typeof window === "undefined" || !materialId) return;
  window.sessionStorage.removeItem(currentSessionKey(materialId));
}

export function loadSessionList(materialId) {
  if (typeof window === "undefined" || !materialId) return [];
  try {
    const raw = window.localStorage.getItem(sessionListKey(materialId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessionList(materialId, sessions) {
  if (typeof window === "undefined" || !materialId) return;
  window.localStorage.setItem(sessionListKey(materialId), JSON.stringify(sessions.slice(0, 40)));
}

export function upsertSessionEntry(materialId, { sessionId, title }) {
  if (!materialId || !sessionId) return [];
  const trimmedTitle = (title || "New chat").trim() || "New chat";
  const existing = loadSessionList(materialId).filter((item) => item.sessionId !== sessionId);
  const next = [
    {
      sessionId,
      title: trimmedTitle,
      updatedAt: new Date().toISOString(),
    },
    ...existing,
  ];
  saveSessionList(materialId, next);
  return next;
}

export function removeSessionEntry(materialId, sessionId) {
  const next = loadSessionList(materialId).filter((item) => item.sessionId !== sessionId);
  saveSessionList(materialId, next);
  return next;
}

export function titleFromQuestion(question) {
  const text = (question || "").trim();
  if (!text) return "New chat";
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export function groupSessionsByDate(sessions) {
  const groups = [];
  const bucket = new Map();

  for (const session of sessions) {
    const date = new Date(session.updatedAt || Date.now());
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    let label = "Older";
    if (date >= startOfToday) label = "Today";
    else if (date >= startOfYesterday) label = "Yesterday";
    else if (date >= startOfWeek) label = "Last 7 days";

    if (!bucket.has(label)) bucket.set(label, []);
    bucket.get(label).push(session);
  }

  for (const label of ["Today", "Yesterday", "Last 7 days", "Older"]) {
    if (bucket.has(label)) groups.push({ label, sessions: bucket.get(label) });
  }

  return groups;
}
