import { OWN_STORE_FALLBACK_URL, WRONG_APP_ERROR_CODE, clientHeaders } from '@/app/config/clientApp';
import { env } from '@/app/config/env';
import { appGate } from '@/services/appGate/appGateStore';
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from '../storage/tokenStorage';

/**
 * Every failed API call throws one of these. `code` is the backend's
 * `error_code` (AppException bodies are `{ message, error_code }`), e.g.
 * 'APP_UPDATE_REQUIRED', 'USE_PARTNER_APP'. `message` is what to show the user.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly body: any;

  constructor(status: number, message: string, code: string | null = null, body: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export const APP_UPDATE_REQUIRED = 'APP_UPDATE_REQUIRED';
export const USE_WEB_PORTAL = 'USE_WEB_PORTAL';

/**
 * True for errors the app-wide gate (shared/components/AppGate) already shows
 * a full-screen UI for - screens should not ALSO pop an Alert for them.
 */
export function isHandledGlobally(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return (
    error.status === 426 ||
    error.code === APP_UPDATE_REQUIRED ||
    error.code === WRONG_APP_ERROR_CODE ||
    error.code === USE_WEB_PORTAL
  );
}

// Called when the session can no longer be recovered (refresh failed / expired).
// AuthContext registers a handler here so it can clear in-memory state and
// bounce the user to the login screen. Without this, clearAuth() only wipes
// SecureStore and the app stays stuck on "session expired" with no way back in.
let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(handler: (() => void) | null) {
  onAuthExpired = handler;
}

async function handleSessionExpired() {
  await clearAuth();
  onAuthExpired?.();
}

/**
 * Routes the errors that concern the whole app (not the calling screen) to the
 * gate store. Called for every failed response, including token refresh.
 */
async function routeGlobalError(error: ApiError): Promise<void> {
  if (error.status === 426 || error.code === APP_UPDATE_REQUIRED) {
    // The 426 body carries the store link; app-config's fallback otherwise.
    const storeUrl = typeof error.body?.store_url === 'string' ? error.body.store_url : null;
    appGate.requireUpdate(error.message, storeUrl ?? OWN_STORE_FALLBACK_URL);
    return;
  }
  if (error.status === 403 && (error.code === WRONG_APP_ERROR_CODE || error.code === USE_WEB_PORTAL)) {
    // This account doesn't belong in this app: drop the session (it would be
    // refused on every call anyway) and explain where to go instead.
    await handleSessionExpired();
    appGate.showWrongApp(error.code === USE_WEB_PORTAL ? 'web_portal' : 'other_app', error.message);
  }
}

/** Builds an ApiError from a non-2xx response and routes app-wide errors. */
export async function toApiError(response: Response): Promise<ApiError> {
  let message = `API request failed with status ${response.status}`;
  let code: string | null = null;
  let body: any = null;
  try {
    body = await response.json();
    // The backend's exception handlers rename FastAPI's `detail` to `message`
    // (app/core/handlers.py), and validation failures arrive as an `errors`
    // array instead. Read all three, or every failure shows the generic
    // status-code text above and the real reason never reaches the user.
    const fromErrors = Array.isArray(body?.errors)
      ? body.errors.map((e: any) => e?.message).filter(Boolean).join('\n')
      : '';
    const raw = body?.message || body?.detail || fromErrors;
    if (raw) {
      message = typeof raw === 'string' ? raw : JSON.stringify(raw);
    }
    if (typeof body?.error_code === 'string') code = body.error_code;
  } catch (e) {}
  const error = new ApiError(response.status, message, code, body);
  await routeGlobalError(error);
  return error;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...clientHeaders(),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Single-flight refresh: if several requests 401 at once (common when a screen
// mounts and fires multiple queries), they all await the SAME refresh promise
// instead of each POSTing to /auth/refresh and racing each other's setTokens().
// Resolves true (refreshed), false (refresh token dead) or an ApiError the app
// gate handles (426 update required / wrong app) - that one must NOT be reported
// as an expired session, or an outdated build would log every user out.
let refreshPromise: Promise<boolean | ApiError> | null = null;

async function refreshSession(): Promise<boolean | ApiError> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...clientHeaders() },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) {
          const error = await toApiError(res);
          return isHandledGlobally(error) ? error : false;
        }
        const data = await res.json();
        await setTokens(data.access_token, data.refresh_token);
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

// Endpoints that ESTABLISH a session rather than consume one. A 401 from these
// means "wrong credentials", not "your token expired" — sending them through the
// refresh-and-retry path below would wipe the stored session and report
// "Session expired. Please log in again." instead of the real reason.
// `/verify-phone/*` is deliberately absent: it runs on an authenticated user.
const SESSION_ESTABLISHING_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/signup',
  '/api/v1/auth/refresh',
  '/api/v1/auth/password-reset',
];

function isSessionEstablishing(path: string): boolean {
  return SESSION_ESTABLISHING_PATHS.some((prefix) => path.startsWith(prefix));
}

/**
 * Runs a request, and on 401 refreshes the session and retries ONCE.
 * `buildRequest` takes fresh headers each call, so the retry uses the NEW
 * access token (the previous implementation reused the stale expired token).
 */
async function request<T>(
  path: string,
  buildRequest: (headers: Record<string, string>) => Promise<Response>,
): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await buildRequest(headers);

  // Only a 401 on a request we actually authenticated can mean the session
  // died; without a token to expire, a 401 is just the server's answer.
  if (
    response.status !== 401 ||
    isSessionEstablishing(path) ||
    !headers['Authorization']
  ) {
    return processValidResponse<T>(response);
  }

  const refreshed = await refreshSession();
  if (refreshed instanceof ApiError) throw refreshed;
  if (!refreshed) {
    await handleSessionExpired();
    throw new ApiError(401, 'Session expired. Please log in again.', 'SESSION_EXPIRED');
  }

  // Retry with freshly-fetched headers (new access token).
  const retried = await buildRequest(await getAuthHeaders());
  if (retried.status === 401) {
    await handleSessionExpired();
    throw new ApiError(401, 'Session expired. Please log in again.', 'SESSION_EXPIRED');
  }
  return processValidResponse<T>(retried);
}

async function processValidResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await toApiError(response);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, (headers) => fetch(`${env.apiBaseUrl}${path}`, { headers }));
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  return request<T>(path, (headers) =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),
  );
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  return request<T>(path, (headers) =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    }),
  );
}

export async function apiPatch<T>(path: string, body: any): Promise<T> {
  return request<T>(path, (headers) =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    }),
  );
}

// `body` is optional: most DELETEs take none, but account deletion sends a
// password + typed confirmation.
export async function apiDelete<T>(path: string, body?: any): Promise<T> {
  return request<T>(path, (headers) =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: 'DELETE',
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  );
}
