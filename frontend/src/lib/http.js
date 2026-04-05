export class APIError extends Error {
  constructor(message, status, info) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.info = info;
  }
}

function tryParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

const API_BASE = "/api/backend";

function norm(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function assertEnvelopeOk(body, httpStatus) {
  if (!body || typeof body !== "object") return;

  if (body.success === false) {
    const status =
      body?.meta?.status_code || body?.error_code || httpStatus || 400;

    throw new APIError(body?.message || `HTTP ${status}`, status, body);
  }
}

function isFormDataBody(body) {
  if (!body || typeof body !== "object") return false;

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return true;
  }

  const tag = Object.prototype.toString.call(body);
  if (tag === "[object FormData]") {
    return true;
  }

  return (
    typeof body.append === "function" &&
    typeof body.get === "function" &&
    typeof body.entries === "function"
  );
}

export async function fetchJSON(path, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  const url = norm(path);
  const body = init.body;

  const hasBody = body != null && method !== "GET" && method !== "HEAD";
  const isFormData = isFormDataBody(body);

  const headers = new Headers(init.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (hasBody) {
    if (isFormData) {
      headers.delete("Content-Type");
      headers.delete("content-type");
    } else if (!headers.has("Content-Type") && !headers.has("content-type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const res = await fetch(url, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  const text = await res.text();
  const parsed = text ? tryParse(text) : null;

  if (!res.ok) {
    throw new APIError(
      parsed?.message || `HTTP ${res.status}`,
      res.status,
      parsed,
    );
  }

  assertEnvelopeOk(parsed, res.status);

  return parsed ?? {};
}
