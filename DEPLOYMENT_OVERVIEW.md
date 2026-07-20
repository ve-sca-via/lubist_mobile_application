# Lubist Mobile — Deployment Overview (Plain English)

Your one-page mental model for how this app gets to users. Read this when you're unsure
"which command / which platform do I need?" Companion docs:
- `RELEASE_GUIDE.md` — OTA & build commands in detail
- `PLAY_STORE_SUBMISSION.md` — step-by-step Play Store submission

---

## 1. The two platforms (who does what)

You work with **two separate services owned by two companies**:

| | **Expo / EAS** (expo.dev) | **Google Play Console** |
|---|---|---|
| Think of it as | 🏭 Your **factory & toolkit** | 🏪 The **store / distribution** |
| Its job | **Builds** the app, **stores signing keys**, ships **OTA updates** | **Reviews, hosts, and delivers** the app to users |
| You go there to | Produce the `.aab`, push OTA, manage credentials | Publish, manage test tracks, store listing, reviews |

**Handoff:** Expo builds the `.aab` → you upload it to Google Play → Google delivers it to users.
The one exception is **OTA**, which goes straight from Expo to installed phones (JS/asset changes only).

```
        BUILD               DISTRIBUTE            USERS
   ┌─────────────┐      ┌─────────────────┐    ┌───────┐
   │  Expo/EAS   │──aab→│  Google Play    │───→│ Phones│
   │  (factory)  │      │  (store)        │    │       │
   └─────────────┘      └─────────────────┘    └───────┘
          │                                         ▲
          └──────────── OTA (JS only) ──────────────┘
                    (skips the store)
```

---

## 2. Two layers = two ways to ship changes

Your app has two layers. Which layer you changed decides how you ship it.

| Layer | What's in it | How you ship a change |
|---|---|---|
| 🏗️ **Shell (native)** | Splash, app icon, permissions, native packages, Expo SDK, `expo.version` | **New `.aab`** → `npm run build:store` → upload to Play |
| 📄 **Contents (JS)** | Screens, text, styling, API calls, images, business logic, bug fixes | **OTA** → `npm run ota` (no upload, no reinstall) |

> 🪑 **Analogy:** OTA is rearranging furniture inside the house. A new build is rebuilding the house.

### Decision table — "which do I run?"

| I changed... | Command | User reinstalls? |
|---|---|---|
| JS/TS, screens, styling, text, API calls, images, bug fixes | `npm run ota` | No ✅ (auto-updates on next open) |
| Splash / icon | `npm run build:store` → upload | Yes (via Play update) |
| Added/removed a native package (`expo install ...`) | `npm run build:store` → upload | Yes |
| A permission, Expo SDK version, or bumped `expo.version` | `npm run build:store` → upload | Yes |

**Rule of thumb:** if `expo install` changed a package, or you edited native config in `app.json`
(icons, splash, permissions, plugins), you need a **new build**. Otherwise, **OTA** is enough.

---

## 3. runtimeVersion — the compatibility stamp

An OTA update only installs on a build whose **runtimeVersion matches**. This project uses the
**`appVersion` policy**, so `runtimeVersion` = `expo.version` in `app.json` (currently `1.0.0`).

- Keep `version` at `1.0.0` → every `npm run ota` reaches all `1.0.0` builds. ✅
- Bump `expo.version` (e.g. `1.0.1`) → you've declared a **new runtime**: you MUST make a new build,
  and OTA updates published under `1.0.0` will NOT reach `1.0.1` installs.
- **So:** don't bump `version` for a JS-only OTA change. Only bump it for a real new build (usually
  alongside a native change).

---

## 4. Channels & branches (how OTA finds the right phones)

### The radio analogy
- **Channel** = the **radio station** a *build* is tuned to. Baked in at build time
  (`eas.json` → `"channel": "..."`). A build can't change its station after it's built.
- **Branch** = a **playlist of updates**. Each `eas update --branch X` adds a song to playlist X.
- **Link:** a channel points at a branch of the same name by default. A build on the `production`
  channel receives whatever you publish to the `production` branch.

```
  BUILD (.aab)          CHANNEL           BRANCH (playlist)
 "tuned to prod"  ──►  production   ──►   production
                                          ├─ update 1
                                          ├─ update 2
                                          └─ update 3  ← newest wins
```

### The 3 channels in this project (in `eas.json`) — the standard set, don't add more

| Channel | Purpose | Backend | Who can see it | Build command | Update command |
|---|---|---|---|---|---|
| **development** | Day-to-day coding with hot reload | local / LAN | Only you (dev machine) | dev client build | `npm start` (not for OTA) |
| **preview** | **QA lane** — test a change on a real phone before the public | 🧪 **staging** (`salon-backend-staging.up.railway.app`) | Only people you hand the APK / internal link to | `npm run build:preview` | `eas update --branch preview` |
| **production** | The real public app | 🟢 **prod** (`lubist-p7aah.ondigitalocean.app`) | **Everyone** on Play **+ your internal-testing build** | `npm run build:store` | `npm run ota` |

> The backend URL is set per profile in `eas.json` → `env.EXPO_PUBLIC_API_URL` and is **baked in at
> build time**. Changing it requires a **new build** (OTA cannot swap the backend). So `preview` builds
> always hit staging and `production`/`production-store` builds always hit prod.

### ⚠️ Important: internal testing shares the `production` channel
The `.aab` you uploaded to Play **Internal testing** was built with the `production-store` profile, so it
listens to the **`production`** channel. That's correct for a production build — but it means:

> Once you have real public users, `npm run ota` hits your internal-testing installs **and** real users
> at the same time. **Don't use production OTA as your "test it" button after launch.**

**Safe workflow:**
```bash
# 1. Test an OTA privately first (only you / testers with the preview app):
npm run build:preview                       # one-time: install preview APK on your phone
eas update --branch preview --message "testing X"

# 2. When confirmed good, ship to everyone:
eas update --branch production --message "Ship X"   # = npm run ota
```

**Rollback** (if a bad OTA goes out): republish the previous good update to `production`, or repoint the
channel: `eas channel:edit production --branch <known-good-branch>`. OTA rollbacks are instant.

> Channels/branches are **only for OTA (JS changes)**. Native changes always mean a new `.aab`.

---

## 5. Google Play test tracks (who sees a build)

| Track | Who sees it | Google review? | Purpose |
|---|---|---|---|
| **Internal testing** | Up to 100 emails you pick | No (instant) | Quick private QA — where you are now |
| **Closed testing** | Bigger invited group | Yes | Beta before launch |
| **Open testing** | Anyone (public beta) | Yes | Public beta, listed on Play |
| **Production** | Everyone | Yes (full) | The real public launch |

> ⚠️ **Personal developer accounts** (created recently) must run **closed testing with ≥12 testers for
> 14 continuous days** before Google allows a Production release. Company/org accounts are exempt.
> Check the Production dashboard to see if this applies to you.

---

## 6. The whole lifecycle in one flow

```
1. Write code (your editor)
2. Native change?  ──YES──►  npm run build:store (Expo) ──►  upload .aab to Play ──►  users update via Play
                   ──NO───►  npm run ota (Expo) ─────────────────────────────────►  users auto-update (no store)
3. First launch: Play Console → test tracks → store listing → review → live
```

**Expo = make + OTA. Google Play = distribute + store presence.**

---

## 7. Which dashboard for what

**Expo (expo.dev → project `lubist-mobile-application`):**
- **Builds** — your `.aab`/`.apk` files + logs
- **Updates** — OTA history (what you pushed, to which branch)
- **Credentials** ⭐ — your Android **keystore** (`gKmAeJ6qb6`) — never lose it; back up via `eas credentials`
- **Channels/Branches** — the OTA lanes above
- (ignore workflows/submissions/insights for now)

**Google Play Console:**
- **Testing tracks** (internal → closed → production)
- **Store listing** (photos, description)
- **App content** (privacy, data safety, ratings, app access)
- (ignore order management/monetization unless you add paid features)
