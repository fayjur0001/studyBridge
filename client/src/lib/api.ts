const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// In-memory access token. It's never persisted to localStorage/sessionStorage —
// the refresh token (httpOnly cookie, set by the backend) is what survives a
// page reload; getMe() on app start exchanges it for a fresh access token.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // attach Authorization header (default true)
  retry?: boolean; // internal: prevents infinite refresh loops
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, retry, headers, body, ...rest } = options;

  const isFormData = body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body,
    credentials: "include", // send the refresh_token cookie
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (res.status === 401 && auth && !retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, retry: true });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiError(payload?.error ?? `Request failed with status ${res.status}`, res.status, payload?.details);
  }

  return payload as T;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return false;
        const data = await res.json();
        setAccessToken(data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export const api = {
  get: <T,>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T,>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};

export { tryRefresh };
