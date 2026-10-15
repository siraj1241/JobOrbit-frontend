/**
 * Centralized HTTP client for the JobOrbit backend.
 *
 * Single source of truth for:
 *   1. Base URL          — read from VITE_API_URL env (with sane default).
 *   2. Auth header       — attaches Bearer token from localStorage on every request.
 *   3. Error normalizer  — turns backend ProblemDetails / network errors into ApiError.
 *   4. JSON parsing      — automatic Content-Type + body handling.
 *
 * Usage (any service module):
 *   import { api } from '@/lib/api';
 *   const user = await api.get('/account/me');
 *   const res  = await api.post('/account/login', { email, password });
 */

const TOKEN_KEY = 'jobboard_token';

/** Returns the JWT stored at login, or null if not signed in. */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persists / clears the JWT in localStorage. */
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Base API URL — env-driven so the same build works in dev / staging / prod.
 *
 * At build time, Vite inlines `import.meta.env.VITE_API_URL` into the bundle.
 * At runtime (in Docker), the docker-entrypoint.sh script substitutes the
 * placeholder with the actual API URL from the container env vars.
 *
 * Override at build time:  VITE_API_URL=https://api.example.com/api vite build
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5087/api';

/** Normalized error — every service consumer can rely on this shape. */
export class ApiError extends Error {
  constructor(message, { status = 0, detail = null, field = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.field = field;
  }
}

/**
 * Core request function. Wraps `fetch` with:
 *   - absolute URL resolution against API_BASE_URL
 *   - default JSON content type
 *   - optional Bearer auth header
 *   - normalized error throwing on non-2xx
 *   - JSON parsing with empty-body fallback
 *
 * @param {string} path       Path relative to API_BASE_URL (e.g. '/account/login').
 * @param {object} [options] fetch options; body may be a plain object.
 * @param {boolean} [options.auth=true]   If true, attach Bearer token if present.
 * @param {boolean} [options.raw=false]  If true, return raw Response instead of parsed body.
 * @param {object}  [options.query]       Query params object — falsy values are skipped.
 * @returns {Promise<any>}
 */
export async function api(path, options = {}) {
  const {
    auth = true,
    raw = false,
    query,
    headers = {},
    body,
    ...rest
  } = options;

  const token = auth ? getToken() : null;
  const finalHeaders = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  // Build the URL with optional query string.
  const search = toQueryString(query);
  const url = `${API_BASE_URL}${path}${search}`;

  let response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError('Cannot reach the server. Please check your connection.', {
      status: 0,
      detail: networkErr.message,
    });
  }

  if (raw) return response;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    // Allow callers to opt out of throwing on 404 (e.g. GET /resume which
    // legitimately returns 404 when the user has no resume yet).
    if (response.status === 404 && options.suppress404) return null;

    const message =
      data?.detail ||
      data?.message ||
      data?.title ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, {
      status: response.status,
      detail: data?.detail || data,
    });
  }

  return data;
}

/**
 * Convert a flat object of query params into a URL-encoded query string.
 *   - Falsy values (null, undefined, '', false) are skipped.
 *   - Booleans are emitted as 'true' / 'false'.
 *   - Returns '' if no params (no leading ?).
 */
function toQueryString(params) {
  if (!params || typeof params !== 'object') return '';
  const entries = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return entries.length ? `?${entries.join('&')}` : '';
}

/** Convenience verbs — keep call sites readable: api.get(...), api.post(...), ... */
api.get = (path, options = {}) => api(path, { ...options, method: 'GET' });
api.post = (path, body, options = {}) =>
  api(path, { ...options, method: 'POST', body });
api.put = (path, body, options = {}) =>
  api(path, { ...options, method: 'PUT', body });
api.patch = (path, body, options = {}) =>
  api(path, { ...options, method: 'PATCH', body });
api.delete = (path, options = {}) =>
  api(path, { ...options, method: 'DELETE' });

export default api;
