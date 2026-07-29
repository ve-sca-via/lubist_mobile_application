# Lubist Mobile — Google Play Store Submission Guide

Reusable checklist for publishing and updating the Android app on the Google Play Store.
For **direct-install APK / OTA** distribution (not the Play Store), see `RELEASE_GUIDE.md`.

---

## App identity (fixed — do not change)

| Field | Value |
|---|---|
| App name | Lubist Mobile |
| Android package | `com.lubist.mobile` |
| EAS project | `safdaraliniazi/lubist-mobile-application` (`0c5d02f8-8571-42f1-a61a-5aea92ddd8a5`) |
| Store build profile | `production-store` (in `eas.json`) → outputs `.aab` |
| Signing keystore | EAS-managed, `Build Credentials gKmAeJ6qb6 (default)` — same as APK builds |

**Which build talks to which backend** (baked in at build time via `eas.json` → `env`):

| Build profile | Backend | Use |
|---|---|---|
| `preview` | `https://salon-backend-staging.up.railway.app` (staging) | QA / test installs |
| `production` (APK) & `production-store` (AAB) | `https://lubist-p7aah.ondigitalocean.app` (prod) | Real users |

| Version source | **remote** (`eas.json` → `cli.appVersionSource`). EAS owns `versionCode`, auto-increments each build. Do **not** set `versionCode` in `app.json`. |

> ⚠️ **Never lose the keystore.** Play links your app to this signing identity forever. It lives in your EAS account — back it up with `eas credentials`. A lost keystore = you can never update this app again.

---

## Build the store bundle (`.aab`)

```bash
cd lubist_mobile_application
npm run build:store        # = eas build --platform android --profile production-store
```

- Produces an **`.aab`** (Android App Bundle) — the only format Play accepts.
- `versionCode` auto-increments (remote). Each build gets a unique code automatically.
- When it finishes, EAS prints an **artifact link** ending in `.aab` — download that file to upload.

To bump the **user-visible version** (e.g. `1.0.0` → `1.0.1`), edit `expo.version` in `app.json` **before** building.
Note: bumping `expo.version` also changes the OTA `runtimeVersion` — see `RELEASE_GUIDE.md`.

---

## First-time Play Console setup (one-time)

1. **Create app** — Play Console → *Create app* → name "Lubist", App, Free.
2. **App content / declarations** (left nav → *Policy → App content*):
   - [ ] **Privacy Policy URL** — must be live and reachable (required; app requests location).
   - [ ] **Data safety** — declare **Location** collection + purpose ("show salons near you"), whether shared, encryption in transit.
     - Encrypted in transit: **Yes** (production API + Supabase are HTTPS).
     - Account creation: **Username and password** (email) *and* **Username and other authentication** (phone + OTP). Not OAuth — the app has no Google/Apple sign-in.
     - **Delete account URL**: `https://www.lubist.com/delete-account` — public page (no login) served by the web app at `src/pages/public/DeleteAccount.jsx`. Must be deployed before submitting; the reviewer opens it.
     - In-app deletion path (reviewers check this too): Profile → **Delete Account** → phone OTP (or password for email signups) + type `DELETE`. Backed by `DELETE /api/v1/auth/me`.
   - [ ] **Ads** — declare if the app shows ads.
   - [ ] **Content rating** — complete the questionnaire.
   - [ ] **Target audience & content** — age groups.
   - [ ] **Government apps / financial features** — answer honestly (payments = Razorpay).
   - [ ] **App access** — if login is required, add **reviewer test credentials** (email + password). Skipping this is the #1 cause of first-review rejection.
3. **Store listing** (left nav → *Grow → Store presence → Main store listing*):
   - [ ] Short description (≤ 80 chars)
   - [ ] Full description
   - [ ] App icon **512 × 512** PNG
   - [ ] Feature graphic **1024 × 500**
   - [ ] **≥ 2 phone screenshots** (min 320px, 16:9 or 9:16)
   - [ ] Category + contact email

---

## Release flow (every release)

### 1. Internal testing first (fast, no review wait)
- Play Console → *Testing → Internal testing → Create release*.
- Upload the `.aab`.
- Add your own email under *Testers*, open the opt-in URL, install.
- **Verify on a real device against the prod backend** (`https://lubist-p7aah.ondigitalocean.app` — store builds use prod; only `preview` builds hit staging):
  - [ ] Login / OTP works
  - [ ] Location permission prompt + "salons near you"
  - [ ] Booking flow
  - [ ] Razorpay payment
  - [ ] Images load

### 2. Promote to Production
- *Production → Create release* → upload the **same `.aab`** (or promote from internal).
- Add release notes → *Review release* → *Start rollout to Production*.
- First review typically takes **a few days to ~1 week**; updates are usually faster.

---

## Updating later — which path?

| Change | How to ship | Reinstall? |
|---|---|---|
| JS/TS, screens, styling, copy, API calls, bug fixes | OTA — `npm run ota` (see `RELEASE_GUIDE.md`) | No |
| Native lib, permission, icon/splash, Expo SDK, `expo.version` bump | `npm run build:store` → upload new `.aab` to Play | Yes (via Play update) |

> On the Play Store, don't use OTA to ship major feature changes that bypass review — bug-fix/config OTA only. Big changes = new `.aab`.

---

## Quick commands

```bash
npm run build:store          # build the Play Store .aab
eas build:list               # see builds + artifact links
eas credentials              # view / back up the keystore
eas whoami                   # confirm logged-in account
```
