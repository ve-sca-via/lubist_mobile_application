import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * How this build identifies itself to the backend. Sent on EVERY request as
 *   X-Client-App / X-App-Version / X-App-Platform
 * and used for the GET /api/v1/app-config version-policy check.
 * See docs/API_CONTRACT.md.
 */
export const CLIENT_APP = 'customer-app' as const;

/** Name used in user-facing copy (update screen). */
export const APP_DISPLAY_NAME = 'Lubist';

/**
 * The running build's version (app.json `expo.version`).
 *
 * Read from expo-constants rather than expo-application so this ships over OTA
 * with no new native module. It is the native version in practice: both apps
 * use `runtimeVersion: { policy: 'appVersion' }`, so an OTA bundle only ever
 * lands on a binary with the same `version` it was built with.
 */
export const APP_VERSION: string = Constants.expoConfig?.version ?? '0.0.0';

/** 'ios' | 'android' on a device; null on web/other (no store policy applies). */
export const APP_PLATFORM: 'ios' | 'android' | null =
  Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null;

/** Headers attached to every API request (including token refresh and uploads). */
export function clientHeaders(): Record<string, string> {
  return {
    'X-Client-App': CLIENT_APP,
    'X-App-Version': APP_VERSION,
    'X-App-Platform': APP_PLATFORM ?? 'web',
  };
}

export function playStoreUrl(androidPackage: string): string {
  return `https://play.google.com/store/apps/details?id=${androidPackage}`;
}

/** This app's own Android package (app.json `android.package`). */
const OWN_ANDROID_PACKAGE = Constants.expoConfig?.android?.package ?? 'com.lubist.mobile';

/**
 * Where "Update" goes when the backend doesn't send a store_url. Android: this
 * app's Play listing. iOS has no App Store id configured yet, so there it is
 * null and the update screen relies on the backend's store_url.
 */
export const OWN_STORE_FALLBACK_URL: string | null =
  APP_PLATFORM === 'android' ? playStoreUrl(OWN_ANDROID_PACKAGE) : null;

/**
 * The backend's 403 error_code meaning "this account belongs in the other app".
 * Customer app: USE_PARTNER_APP (salon partner / vendor accounts).
 */
export const WRONG_APP_ERROR_CODE = 'USE_PARTNER_APP';

/** The salon partner app ("Lubist Partner"), where vendor accounts belong. */
export const OTHER_APP = {
  name: 'Lubist Partner',
  storeUrl: playStoreUrl('com.lubist.partner'),
};

/** Copy for the "wrong app for this account" screen (shared/components/AppGate). */
export const WRONG_APP_COPY = {
  title: 'Use the Lubist Partner app',
  body: 'This is a salon partner account. Please use the Lubist Partner app.',
  button: 'GET LUBIST PARTNER',
  // The backend's standard USE_PARTNER_APP message. When the server sends
  // something else (e.g. its business-buyer wording) that text is shown instead.
  serverMessage: 'Salon partner accounts use the Lubist Partner app.',
};
