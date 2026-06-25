import { fetchJSON } from "@/lib/http";

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.append(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const chatbotApi = {
  getSemesters: () => fetchJSON("/chatbot/semesters", { method: "GET" }),
  getSubjects: (semester) => fetchJSON(`/chatbot/subjects${toQueryString({ semester })}`, { method: "GET" }),
  createSession: (payload) => fetchJSON("/chatbot/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  ask: (payload) => fetchJSON("/chatbot/ask", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  getIndexStatus: (materialId) => fetchJSON(`/chatbot/index-status/${materialId}`, { method: "GET" }),
  getHistory: (sessionId) => fetchJSON(`/chatbot/sessions/${sessionId}/history`, { method: "GET" }),
  deleteSession: (sessionId) => fetchJSON(`/chatbot/sessions/${sessionId}`, { method: "DELETE" }),
  indexMaterial: ({ materialId, force = false }) => fetchJSON(`/chatbot/materials/${materialId}/index`, {
    method: "POST",
    body: JSON.stringify({ force }),
  }),
  indexSubject: ({ semester, subject, force = false }) => fetchJSON("/chatbot/index-subject", {
    method: "POST",
    body: JSON.stringify({ semester, subject, force }),
  }),
};
