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

// Next proxy base (NOT flask)
const API_BASE = "/api/backend";

function norm(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Your backend envelope:
 * { success:boolean, message:string, data:any, meta?, error_code? }
 * We treat "success:false" as error even if HTTP status is 200 (some APIs do that).
 */
function assertEnvelopeOk(body, httpStatus) {
  if (!body || typeof body !== "object") return;
  if (body.success === false) {
    const status = body?.meta?.status_code || body?.error_code || httpStatus || 400;
    throw new APIError(body?.message || `HTTP ${status}`, status, body);
  }
}

export async function fetchJSON(path, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  const url = norm(path);

  const hasBody = init.body != null && method !== "GET" && method !== "HEAD";
  const headers = {
    Accept: "application/json",
    ...(init.headers || {}),
  };
  if (hasBody && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

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

  // ✅ handle your success:false envelope
  assertEnvelopeOk(body, res.status);

  return body ?? {};
}