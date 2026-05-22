/**
 * Thin fetch wrapper. Reads the access token from localStorage and
 * attaches it as Bearer; on 401 it tries to refresh once before bubbling
 * the error. Stateless — no axios, no interceptor chain. Anything more
 * complex than this lives in TanStack Query.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

const TOKEN_KEY = 'dataclean.access';
const REFRESH_KEY = 'dataclean.refresh';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_KEY);
}
export function setTokens(access: string, refresh: string): void {
  window.localStorage.setItem(TOKEN_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Don't auto-prepend /api/v1 — for refresh and health calls. */
  raw?: boolean;
  /** Multipart body — caller passes a FormData. */
  formData?: FormData;
}

async function request<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = opts.raw ? `${API_BASE}${path}` : `${API_BASE}/api/v1${path}`;
  const headers = new Headers(opts.headers);
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    body = JSON.stringify(opts.body);
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...opts, headers, body });

  if (res.status === 401 && !opts.raw) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${getAccessToken()}`);
      const retry = await fetch(url, { ...opts, headers, body });
      return parse<T>(retry);
    }
  }

  return parse<T>(res);
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? res.statusText;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

let refreshInFlight: Promise<boolean> | null = null;
async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const json = (await res.json()) as { accessToken: string; refreshToken: string };
      setTokens(json.accessToken, json.refreshToken);
      return true;
    } catch { return false; }
    finally { refreshInFlight = null; }
  })();
  return refreshInFlight;
}

export const api = {
  get: <T>(p: string, o?: ApiOptions) => request<T>(p, { ...o, method: 'GET' }),
  post: <T>(p: string, body?: unknown, o?: ApiOptions) => request<T>(p, { ...o, method: 'POST', body }),
  patch: <T>(p: string, body?: unknown, o?: ApiOptions) => request<T>(p, { ...o, method: 'PATCH', body }),
  put: <T>(p: string, body?: unknown, o?: ApiOptions) => request<T>(p, { ...o, method: 'PUT', body }),
  delete: <T>(p: string, o?: ApiOptions) => request<T>(p, { ...o, method: 'DELETE' }),
  upload: <T>(p: string, formData: FormData, o?: ApiOptions) =>
    request<T>(p, { ...o, method: 'POST', formData }),
};
