import { API_BASE_URL } from './env';

export class APIError extends Error {
  status: number;
  info?: unknown;
  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.info = info;
  }
}

const isAbs = (u: string) => /^https?:\/\//i.test(u);

function normalizeApiJoin(base: string, path: string) {
  if (!base) return path.startsWith('/') ? path : `/${path}`;
  if (isAbs(path)) return path;

  const b = base.replace(/\/+$/, '');
  const p = (path.startsWith('/') ? path : `/${path}`).replace(/\/{2,}/g, '/');

  if (b.endsWith('/api') && p.startsWith('/api/')) {
    return `${b}${p.slice(4)}`;
  }

  const joined = `${b}${p}`;
  return joined.replace(/\/api\/api(\/|$)/g, '/api$1');
}

function tryParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export async function fetchJSON<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || 'GET').toUpperCase();
  const url = normalizeApiJoin(API_BASE_URL, path);

  const hasBody = init.body != null && method !== 'GET' && method !== 'HEAD';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as any),
  };
  if (hasBody && !('Content-Type' in headers)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { credentials: 'include', ...init, headers });
  const text = await res.text();
  const body = text ? tryParse(text) : null;

  if (!res.ok) throw new APIError((body as any)?.message ?? `HTTP ${res.status}`, res.status, body);
  return (body as T) ?? ({} as T);
}

export async function fetchBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const method = (init.method || 'GET').toUpperCase();
  const url = normalizeApiJoin(API_BASE_URL, path);

  const res = await fetch(url, { credentials: 'include', ...init });
  if (!res.ok) throw new APIError(`HTTP ${res.status}`, res.status);
  return res.blob();
}

export async function sendFormDataJSON<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST',
  init: RequestInit = {},
): Promise<T> {
  const url = normalizeApiJoin(API_BASE_URL, path);

  const res = await fetch(url, { method, body: formData, credentials: 'include', ...init });
  const text = await res.text();
  const body = text ? tryParse(text) : null;

  if (!res.ok) throw new APIError((body as any)?.message ?? `HTTP ${res.status}`, res.status, body);
  return (body as T) ?? ({} as T);
}
