---
title: Releasing the customer app (OTA, builds, Play Store)
area: mobile
type: runbook
status: current
updated: 2026-11-12
read_when: Shipping any customer-app change — deciding OTA vs new build, building for Play, bumping versions, testing on the preview lane, or rolling back.
related:
  - lubist_mobile_application/docs/API_CONTRACT.md
  - backend/docs/CLIENT_APPS_AND_VERSIONING.md
  - backend/docs/MANUAL_QA_CHECKLIST.md
  - lubist_vendor_application/README.md
tags: [mobile, runbook, current, release]
---

# Releasing the customer app

Two services: **Expo / EAS** builds the app, holds the signing keystore and ships OTA
updates. **Google Play** reviews and distributes builds. OTA skips Play entirely.

```
  Expo/EAS ──.aab──► Google Play ──► phones
     └──────────── OTA (JS only) ──────┘
```

## Which do I need?

| I changed… | Do | Users reinstall? |
|---|---|---|
| JS/TS, screens, styles, copy, API calls, images, bug fixes | `npm run ota` | No — applied on the next app launch |
| A native package (`npx expo install …`), a permission, icon/splash, `app.json` plugins, Expo SDK, `expo.version` | `npm run build:store` → upload to Play | Yes, via a Play update |
| Backend only | deploy the backend — OTA doesn't cover it | — |

Rule of thumb: if `expo install` touched a package or you edited native config in
`app.json`, it's a new build. Otherwise OTA.

## Identity & config (fixed — don't change)

| | |
|---|---|
| Package | `com.lubist.mobile` |
| EAS project | owner `vescavias-team`, slug `lubist-mobile-application`, id `622b3d86-7342-4fb8-adfd-08ddc7d7430e` |
| Keystore | EAS-managed. **Never lose it** — Play ties the app to it forever. Back up with `eas credentials`. Log the CLI into the account that owns the project (`eas whoami`) |
| Version code | `appVersionSource: "local"` — `android.versionCode` lives in `app.json` and `autoIncrement` bumps it on store builds. **Commit the bump.** Play rejects any code ≤ the last one it saw |
| OTA compatibility | `runtimeVersion` policy `appVersion` → runtime = `expo.version` (`1.0.0`) |

## Build profiles & lanes (`eas.json`)

| Profile | Channel | Backend (baked in at build time) | Output | Use |
|---|---|---|---|---|
| `development` | development | local / LAN | dev client | day-to-day coding |
| `preview` | preview | **staging** (Railway) | APK | QA on your own phone |
| `production` | production | **prod** (DigitalOcean) | APK | direct-install testers |
| `production-store` | production | **prod** | **AAB** | Google Play |

The backend URL can't be changed by OTA — that needs a new build.
**Play installs listen on the `production` channel, so `npm run ota` reaches every real
user at once.** Test on the preview lane first.

## Everyday: ship a JS change

```bash
npm run typecheck
git commit …                                               # EAS ties the update to the commit
eas update --branch preview --message "testing X"          # 1. on your preview build
npm run ota                                                # 2. = eas update --branch production
```

Don't bump `expo.version` for an OTA — a new version is a new runtime, and OTAs published
for `1.0.0` will not reach a `1.0.1` build.

**Rollback:** republish the last good update to `production`, or
`eas channel:edit production --branch <known-good-branch>`. Instant.

## Native change: new Play build

1. If this release should show a new version to users, bump `expo.version` in `app.json`.
   (This starts a new OTA runtime — every later OTA only reaches the new build.)
2. `npm run build:store` → download the `.aab` from the EAS artifact link.
3. Play Console → **Internal testing** → create release → upload → install via the opt-in
   link and check on a real device against prod: login/OTP, location + nearby salons,
   booking, Razorpay, images.
4. **Production** → promote the same build (no rebuild) → release notes → rollout.
5. If old builds must stop working (breaking API change), raise
   `customer_app_android_min_version` in `system_config` **after** the new build is live —
   see [CLIENT_APPS_AND_VERSIONING.md](../../backend/docs/CLIENT_APPS_AND_VERSIONING.md).

## Play Console facts that bite

- **Personal developer accounts** need **closed testing with ≥ 12 testers for 14
  continuous days** before Production access. Internal testing doesn't count. Uploading
  new builds during the 14 days doesn't reset the clock; promote, don't rebuild.
- Reviewers can't receive Indian OTPs — **App content → App access** must have
  **email + password** test credentials for a **confirmed** account.
- **Delete-account URL** (Data safety): `https://www.lubist.com/delete-account` (public web
  page). In-app path: Profile → Delete Account. Both call `DELETE /api/v1/auth/me`.
- *App integrity* has two unrelated buttons: **upload key reset** (aligns Play with a new
  EAS keystore) and the **app-signing key upgrade** (Google's own rollout). Don't confuse them.
- iOS isn't shipped. If it ever is: OTA is for fixes, not for features that skip review.

## Dashboards

**expo.dev** → project `lubist-mobile-application`: Builds, Updates (OTA history),
Credentials (keystore), Channels/Branches.
**Play Console**: testing tracks, store listing, App content (privacy, data safety, app access).

```bash
eas whoami · eas build:list · eas update:list --branch production · eas credentials
```

<!-- BEGIN RELATED: generated by backend/scripts/build_docs_hub.py from the header's `related:` -->

---

**Related:** [Customer app — API contract, client headers, force-update](API_CONTRACT.md) · [Client apps & versioning (force-update, Partner split)](../../backend/docs/CLIENT_APPS_AND_VERSIONING.md) · [Manual QA checklist](../../backend/docs/MANUAL_QA_CHECKLIST.md) · [Lubist Partner (vendor app) — README](../../lubist_vendor_application/README.md)

**Referenced by:** [Lubist customer app — README](../README.md)

[↑ All docs](../../backend/docs/DOCS_HUB.md)

<!-- END RELATED -->
