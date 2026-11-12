import { AppState, type AppStateStatus } from 'react-native';

import { env } from '@/app/config/env';
import { APP_PLATFORM, APP_VERSION, CLIENT_APP, OWN_STORE_FALLBACK_URL, clientHeaders } from '@/app/config/clientApp';

import type { ApiResponse } from '@/services/api/types';

import { appGate } from './appGateStore';

/** GET /api/v1/app-config - the version policy for this build (from the generated contract). */
export type AppConfigResponse = ApiResponse<'/api/v1/app-config', 'get'>;

const REQUEST_TIMEOUT_MS = 8000;
/** Foreground re-checks are throttled to one per this interval. */
const RECHECK_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Fetches the policy. FAILS OPEN: a 404 (older backend without the endpoint),
 * any other error status, a timeout, a network failure or an unparseable body
 * all return null, meaning "no policy - carry on normally".
 */
export async function fetchAppConfig(): Promise<AppConfigResponse | null> {
  if (!APP_PLATFORM) return null; // web/dev preview: there is no store build to police.

  const params = new URLSearchParams({ client_app: CLIENT_APP, platform: APP_PLATFORM, version: APP_VERSION });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${env.apiBaseUrl}/api/v1/app-config?${params.toString()}`, {
      headers: clientHeaders(),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as Partial<AppConfigResponse> | null;
    if (!body || typeof body.update_required !== 'boolean') return null;
    return body as AppConfigResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Runs one check and pushes the result into the gate store. */
export async function checkAppConfig(): Promise<void> {
  const config = await fetchAppConfig();
  if (!config) return; // fail open: leave whatever state we already have

  const storeUrl = config.store_url || OWN_STORE_FALLBACK_URL;
  if (config.update_required) {
    appGate.requireUpdate(config.message ?? null, storeUrl);
    return;
  }
  // The policy no longer blocks this build (e.g. an admin lowered the minimum).
  appGate.clearUpdateRequired();
  if (config.update_available) {
    appGate.offerUpdate({
      message: config.message ?? null,
      storeUrl,
      latestVersion: config.latest_version ?? null,
    });
  }
}

let started = false;
let lastCheckAt = 0;

/**
 * Checks on launch, then again whenever the app returns to the foreground -
 * at most once every 30 minutes. Idempotent; returns an unsubscribe.
 */
export function startAppConfigChecks(): () => void {
  if (started) return () => {};
  started = true;

  const run = () => {
    lastCheckAt = Date.now();
    void checkAppConfig();
  };
  run();

  const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
    if (next === 'active' && Date.now() - lastCheckAt >= RECHECK_INTERVAL_MS) run();
  });
  return () => {
    sub.remove();
    started = false;
  };
}
