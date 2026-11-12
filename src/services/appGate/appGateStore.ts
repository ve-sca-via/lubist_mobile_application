import { useSyncExternalStore } from 'react';

/**
 * App-wide "gate" state: things the backend can tell us at any moment that
 * must take over the whole UI, no matter which screen made the request.
 *
 *  - updateRequired: this build is below min_supported_version (app-config said
 *    so, or any call returned HTTP 426 APP_UPDATE_REQUIRED). Blocking.
 *  - wrongApp: the signed-in account belongs in the other Lubist app (403
 *    USE_PARTNER_APP / USE_CUSTOMER_APP) or on the website (USE_WEB_PORTAL).
 *    The session is cleared; the screen is dismissible back to sign-in.
 *  - updateAvailable: a newer store build exists. Non-blocking banner, shown
 *    at most once per app session.
 *
 * Set from the API client (services/api/client.ts) and the app-config check;
 * rendered by shared/components/AppGate.tsx. A tiny external store instead of a
 * context so the non-React API client can write to it.
 */

export type WrongAppKind = 'other_app' | 'web_portal';

export type AppGateState = {
  updateRequired: { message: string | null; storeUrl: string | null } | null;
  wrongApp: { kind: WrongAppKind; message: string | null } | null;
  updateAvailable: { message: string | null; storeUrl: string | null; latestVersion: string | null } | null;
};

let state: AppGateState = { updateRequired: null, wrongApp: null, updateAvailable: null };
// The "update available" banner is shown once per JS session, even if the
// foreground re-check keeps reporting it.
let updateAvailableShown = false;

const listeners = new Set<() => void>();

function setState(patch: Partial<AppGateState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const appGate = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  requireUpdate(message: string | null, storeUrl: string | null) {
    // Keep a store_url we already know if this signal didn't carry one.
    const prev = state.updateRequired;
    setState({
      updateRequired: { message: message ?? prev?.message ?? null, storeUrl: storeUrl ?? prev?.storeUrl ?? null },
    });
  },
  /** Only app-config can lift the block (policy changed / app was updated). */
  clearUpdateRequired() {
    if (state.updateRequired) setState({ updateRequired: null });
  },

  showWrongApp(kind: WrongAppKind, message: string | null) {
    setState({ wrongApp: { kind, message } });
  },
  dismissWrongApp() {
    if (state.wrongApp) setState({ wrongApp: null });
  },

  offerUpdate(info: NonNullable<AppGateState['updateAvailable']>) {
    if (updateAvailableShown) return;
    updateAvailableShown = true;
    setState({ updateAvailable: info });
  },
  dismissUpdateOffer() {
    if (state.updateAvailable) setState({ updateAvailable: null });
  },
};

export function useAppGate(): AppGateState {
  return useSyncExternalStore(appGate.subscribe, appGate.getState, appGate.getState);
}
