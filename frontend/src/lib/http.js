export class APIError extends Error {
  constructor(message, status, info) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.info = info;
  }
}

function tryParse(s) {
  try { return JSON.parse(s); } catch { return s; }
}

const API_BASE = "/api/backend";

export async function fetchJSON(path, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const hasBody = init.body != null && method !== "GET" && method !== "HEAD";

  const headers = {
    Accept: "application/json",
    ...(init.headers || {}),
  };

  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  const text = await res.text();
  const body = text ? tryParse(text) : null;

  if (!res.ok) {
    throw new APIError(body?.message || `HTTP ${res.status}`, res.status, body);
  }
  return body ?? {};
}

export async function sendFormDataJSON(path, formData, method = "POST", init = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    method,
    body: formData,
    credentials: "include",
  });

  const text = await res.text();
  const body = text ? tryParse(text) : null;

  if (!res.ok) throw new APIError(body?.message || `HTTP ${res.status}`, res.status, body);
  return body ?? {};
}