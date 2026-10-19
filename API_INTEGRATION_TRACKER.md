# 📡 API Integration Tracker — Lubist Mobile ↔ Backend

> Single source of truth for which backend endpoints have been wired into the
> mobile app (Expo RN + TanStack Query). Keep this updated as we integrate.
>
> **Backend base URL:** `http://localhost:8000` · **Global prefix:** `/api/v1`
> **Backend repo:** `g:\vescavia\Projects\backend` · **Mobile repo:** `g:\vescavia\Projects\lubist_mobile_application`
> **Shared with:** salon web admin panel (same backend)

---

## How to use this doc

- Each endpoint row tracks: **Method**, **Path** (after `/api/v1`), **Auth**, **TanStack hook**, **Consuming screen**, **Status**.
- Update the **Status** and the **Progress summary** every time we integrate or change something.
- When asked to "continue API integration", I (Claude) read this file first to know where we left off.

### Status legend
| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🟡 | Hook created (not yet wired to a screen) |
| 🟢 | Wired into UI (works end-to-end, not formally tested) |
| ✅ | Verified / tested |
| ➖ | Not needed on mobile (admin/web-only) |

---

## 📊 Progress summary

| Domain | Total | Integrated (🟢/✅) | Mobile priority |
|--------|------:|------------------:|-----------------|
| Auth | 16 | 12 | 🔴 High |
| Location | 2 | 2 | 🔴 High |
| Salons (public) | 10 | 6 | 🔴 High |
| Customers (cart/fav/reviews) | 23 | 21 | 🔴 High |
| Products | 8 | 3 | 🔴 High |
| Product Orders | 4 | 0 | 🔴 High |
| Payments | 3 | 1 | 🟠 Medium |
| Coupons (customer checkout) | 1 | 0 | 🔴 High |
| Vendors | 18 | — | ➖ Moved to the standalone vendor app |
| RM | 10 | 0 | 🟡 Low |
| Careers | 5 | 0 | 🟡 Low |
| Upload | 4 | 0 | 🟠 Medium |
| Admin (all sub-routers) | 46 | 0 | ➖ Web-only |
| **TOTAL** | **150** | **45** | |

**Overall: 45 / 150 endpoints integrated (~30%).**

> The new **coupon** endpoints: customer `POST /customers/cart/validate-coupon` (mobile 🔴 High);
> vendor CRUD `/vendors/coupons` (+4) and admin CRUD `/admin/coupons` (+5) are ➖ web-only.

---

## 🧱 Integration infrastructure (foundation)

| Item | Status | Notes / TODO |
|------|--------|--------------|
| TanStack Query provider | ✅ | `src/app/providers/AppProviders.tsx` |
| Base fetch client (`apiGet`/`apiPost`) | 🟢 | `src/services/api/client.ts` — **added auth headers, PUT/PATCH/DELETE helpers, and auto refresh-on-401** |
| Device location (`expo-location`) | 🟢 | `src/services/location/useDeviceLocation.ts` — **GPS + permission flow, used by ClientHome** |
| Razorpay checkout (WebView) | 🟢 | `src/features/client/components/RazorpayCheckout.tsx` — **Expo Go-compatible; native SDK avoided** |
| Auth token storage | 🟢 | `src/services/storage/tokenStorage.ts` — **using `expo-secure-store` persistence** |
| AuthContext (real session) | 🟢 | `src/store/AuthContext.tsx` — **holds real token + user, auto-restores login on launch** |
| Query key conventions | ⬜ | Define a `queryKeys` factory once we add `useQuery` reads |
| Centralized error handling | ⬜ | Map backend `{detail}` shape to UI toasts |
| Env config per environment | 🟡 | `src/app/config/env.ts` hardcodes localhost — add staging/prod |

> ⚠️ These foundations should be finished early — most read endpoints below need an
> auth header, and almost every protected route needs the real AuthContext.

---

## 🔐 Auth — `/api/v1/auth`
File: `backend/app/api/auth.py` · Mobile hooks: `src/services/api/hooks/useAuthAPI.ts`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/auth/login` | public | `useLogin` | EmailLoginScreen | 🟢 |
| POST | `/auth/signup` | public | `useSignup` | OtpVerifyScreen | 🟢 |
| POST | `/auth/refresh` | public | (auto via client) | — | 🟢 |
| GET | `/auth/me` | bearer | `useGetUserProfile` | ProfileScreen | 🟢 |
| PUT | `/auth/me` | bearer | `useUpdateUserProfile` | ProfileScreen | 🟢 |
| POST | `/auth/logout` | bearer | `useLogout` | ProfileScreen | 🟢 |
| POST | `/auth/logout-all` | bearer | `useLogoutAll` | ProfileScreen | 🟢 |
| POST | `/auth/password-reset` | public | `usePasswordReset` | ForgotPasswordScreen | 🟢 |
| POST | `/auth/password-reset/confirm` | public | `usePasswordResetConfirm` | — | ⬜ |
| POST | `/auth/resend-verification` | bearer | `useResendVerification` | — | ⬜ |
| POST | `/auth/signup/phone/send-otp` | public | `useSendSignupPhoneOtp` | SignupScreen | 🟢 |
| POST | `/auth/signup/phone/verify-otp` | public | `useVerifySignupPhoneOtp` | OtpVerifyScreen | 🟢 |
| POST | `/auth/login/phone/send-otp` | public | `useSendPhoneOtp` | SignInScreen | 🟢 |
| POST | `/auth/login/phone/verify-otp` | public | `useVerifyPhoneOtp` | OtpVerifyScreen | 🟢 |
| POST | `/auth/verify-phone/send-otp` | bearer | `useSendVerifyPhoneOtp` | — | ⬜ |
| POST | `/auth/verify-phone/confirm-otp` | bearer | `useConfirmVerifyPhoneOtp` | — | ⬜ |

---

## 📍 Location — `/api/v1/location`
File: `backend/app/api/location.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| GET | `/location/reverse-geocode` | public | `useReverseGeocode` | ClientHome | 🟢 |
| GET | `/location/salons/nearby` | public | `useNearbySalons` | ClientHome | 🟢 |

---

## 🏪 Salons (public + vendor-owner) — `/api/v1/salons`
File: `backend/app/api/salons.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| GET | `/salons/public` | public | `usePublicSalons` | ClientDiscover | 🟢 |
| GET | `/salons/popular-cities` | public | — | ClientHome | ⬜ |
| GET | `/salons/{salon_id}` | public | `useSalonDetail` | SalonDetailsScreen | 🟢 |
| GET | `/salons/{salon_id}/reviews` | public | `useSalonReviews` | SalonDetailsScreen | 🟢 |
| GET | `/salons/{salon_id}/feedback` | public | — | — | ⬜ |
| POST | `/salons/{salon_id}/feedback` | bearer | — | — | ⬜ |
| GET | `/salons/{salon_id}/services` | public | `useSalonServices` (taxonomy) | SalonServicesScreen | 🟢 |
| GET | `/salons/{salon_id}/available-slots` | public | `useAvailableSlots` | SelectTimeScreen | 🟢 |
| GET | `/salons/search/query` | public | `useSearchSalons` | ClientDiscover | 🟢 |
| GET | `/salons/config/public` | public | — | — | ⬜ |

> ❌ Removed (were dead/broken — called non-existent `db.*` methods, never wired to any frontend). Use the real paths instead:
> - Salon create → `POST /api/v1/admin/vendor-requests/{id}/approve` (vendor-approval flow)
> - Salon update/delete/status → `/api/v1/admin/salons/*`
> - Salon image upload → `app/api/upload.py`
>
> ~~`POST /salons/`~~, ~~`PATCH /salons/{salon_id}`~~, ~~`POST /salons/{salon_id}/approve`~~, ~~`POST /salons/{salon_id}/images`~~, ~~`GET /salons/`~~, ~~`GET /salons/search/nearby`~~

---

## ⚠️ Bookings — standalone `/api/v1/bookings/*` router does not exist

> The dedicated `bookings.py` router was removed. All customer-facing booking
> operations now live under `/customers/bookings/*` (see Customers section).
> Vendor booking management is under `/vendors/bookings/*`.
> Admin booking management is under `/admin/bookings/*`.

---

## 🛍️ Customers (cart / favorites / reviews / browse) — `/api/v1/customers`
File: `backend/app/api/customers.py` — **most important for the client app**

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| GET | `/customers/cart` | bearer | `useCart` | SalonServices / SelectTime / Checkout | 🟢 |
| POST | `/customers/cart` | bearer | `useAddToCart` | SalonServices | 🟢 |
| PUT | `/customers/cart/{item_id}` | bearer | `useUpdateCartItem` | CheckoutScreen (qty stepper) | 🟢 |
| DELETE | `/customers/cart/{item_id}` | bearer | `useRemoveCartItem` | SalonServices / Checkout | 🟢 |
| DELETE | `/customers/cart/clear/all` | bearer | `useClearCart` | CheckoutScreen (Clear all) | 🟢 |
| POST | `/customers/cart/checkout` | bearer | `useCheckoutCart` | CheckoutScreen | 🟢 |
| POST | `/customers/cart/validate-coupon` | bearer | `useValidateCoupon` (NEW) | CheckoutScreen ("Apply coupon") | ⬜ |
| GET | `/customers/product-cart` | bearer | `useProductCart` | Cart / ProductDetail / Shopping / Catalog | 🟢 |
| POST | `/customers/product-cart` | bearer | `useAddToProductCart` | ProductDetail / Shopping / Catalog | 🟢 |
| PUT | `/customers/product-cart/{item_id}` | bearer | `useUpdateProductCartItem` | CartScreen (qty stepper) | 🟢 |
| DELETE | `/customers/product-cart/{item_id}` | bearer | `useRemoveProductCartItem` | CartScreen (remove) | 🟢 |
| DELETE | `/customers/product-cart/clear/all` | bearer | `useClearProductCart` | — | 🟡 |
| GET | `/customers/bookings/my-bookings` | bearer | `useMyBookings` | ClientAppointments | 🟢 |
| PUT | `/customers/bookings/{booking_id}/cancel` | bearer | `useCancelBooking` | ClientAppointments | 🟢 |
| GET | `/customers/favorites` | bearer | `useFavorites` | SalonDetails / ClientAccount (Saved) | 🟢 |
| POST | `/customers/favorites` | bearer | `useAddFavorite` | SalonDetails | 🟢 |
| DELETE | `/customers/favorites/{salon_id}` | bearer | `useRemoveFavorite` | SalonDetails / ClientAccount (Saved) | 🟢 |
| GET | `/customers/favorites/products` | bearer | `useFavoriteProducts` | ClientAccount (Saved → Products) | 🟢 |
| POST | `/customers/favorites/products` | bearer | `useAddFavoriteProduct` | ProductDetail (heart toggle) | 🟢 |
| DELETE | `/customers/favorites/products/{product_id}` | bearer | `useRemoveFavoriteProduct` | ProductDetail / ClientAccount (Saved) | 🟢 |
| GET | `/customers/reviews/my-reviews` | bearer | `useMyReviews` | MyReviewsScreen (via Profile) | 🟢 |
| POST | `/customers/reviews` | bearer | `useCreateReview` | ClientAppointments + SalonDetails (needs a completed booking) | 🟢 |
| PUT | `/customers/reviews/{review_id}` | bearer | `useUpdateReview` | MyReviewsScreen (edit) | 🟢 |

> **Service cart / favorites / reviews are complete.** Product-cart is now wired as part of
> the Products rollout: add from ProductDetail/Shopping/Catalog, quantity + remove on CartScreen,
> live cart-count badges. `clear/all` has a hook (`useClearProductCart`) but no UI button yet (🟡).
> CartScreen's "Proceed to Checkout" is still a placeholder until **Product Orders** is wired.
>
> **Coupons (NEW)** — checkout now supports coupon codes. `POST /customers/cart/validate-coupon`
> `{code}` previews a coupon against the current cart and returns `{valid, reason, coupon_id,
> coupon_code, breakdown}`; then pass `coupon_code` into `/payments/cart/create-order` and
> `/customers/cart/checkout`. Build an "Apply coupon" field on CheckoutScreen. **Full build spec
> (all three frontends, payloads, reason messages) → [`backend/docs/COUPONS_UI_SPEC.md`](../backend/docs/COUPONS_UI_SPEC.md).**
> See the **Coupons** section below for the endpoint rows.
>
> **Product favorites (NEW)** — `/customers/favorites/products` (GET/POST/DELETE) added so the
> Saved tab shows saved products alongside saved salons. Hooks live in `useProductsAPI.ts`
> (`useFavoriteProducts` / `useAddFavoriteProduct` / `useRemoveFavoriteProduct`). Save toggle is a
> heart on ProductDetail; the Saved → Products segment (ClientAccountScreen) renders + un-saves them.
> ⚠️ Requires the `product_favorites` table migration (`supabase/migrations/20260613000000_*`).
> See **[`PRODUCT_FAVORITES_API.md`](../backend/docs/PRODUCT_FAVORITES_API.md)** in the backend repo —
> this feature is **not yet in the salon web admin panel** and will need a UI there to stay in sync.

---

## 🧴 Products — `/api/v1/products`
File: `backend/app/api/products.py` · Mobile hooks: `src/services/api/hooks/useProductsAPI.ts`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| GET | `/products` | public | `useProducts` / `useFeaturedProducts` | ProductCatalog / ClientShopping | 🟢 |
| GET | `/products/categories` | public | `useProductCategories` | ClientShopping | 🟢 |
| GET | `/products/slug/{slug}` | public | `useProductBySlug` | — | 🟡 |
| GET | `/products/{product_id}` | public | `useProduct` | ProductDetail | 🟢 |
| GET | `/products/admin/all` | bearer (admin) | — | — | ➖ |
| POST | `/products` | bearer (admin) | — | — | ➖ |
| PUT | `/products/{product_id}` | bearer (admin) | — | — | ➖ |
| DELETE | `/products/{product_id}` | bearer (admin) | — | — | ➖ |

---

## 📦 Product Orders — `/api/v1/product-orders`
File: `backend/app/api/product_orders.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/product-orders/create` | bearer | — | Checkout | ⬜ |
| POST | `/product-orders/verify` | bearer | — | Checkout | ⬜ |
| POST | `/product-orders/dev-verify/{order_id}` | bearer | — | (dev only) | ⬜ |
| GET | `/product-orders/my-orders` | bearer | — | ClientAccount | ⬜ |

---

## 💳 Payments — `/api/v1/payments`
File: `backend/app/api/payments.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/payments/cart/create-order` | bearer | `useCreateCartOrder` | Checkout (Razorpay WebView) | 🟢 |
| POST | `/payments/registration/create-order` | bearer (vendor) | — | — | ⬜ |
| POST | `/payments/registration/verify` | bearer (vendor) | — | — | ⬜ |

> Note: `/payments/booking/*`, `/payments/history`, `/payments/vendor/earnings`, and `/payments/webhook/razorpay`
> were removed from the backend. The cart checkout payment flow (`/payments/cart/create-order` →
> `/customers/cart/checkout`) is the canonical booking payment path.
>
> ⚠️ **Updated:** `/payments/cart/create-order` now accepts an optional body `{ "coupon_code": "SAVE20" }`.
> When sent, the returned `breakdown` and charged amount reflect the coupon's convenience-fee
> discount — open Razorpay with the discounted amount. `useCreateCartOrder` should accept an
> optional `coupon_code` arg.

---

## 🎟️ Coupons — customer checkout (`/api/v1/customers` + `/api/v1/payments`)
File: `backend/app/api/customers.py`, `backend/app/api/payments.py` ·
**Full UI spec:** [`backend/docs/COUPONS_UI_SPEC.md`](../backend/docs/COUPONS_UI_SPEC.md)

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/customers/cart/validate-coupon` | bearer | `useValidateCoupon` (NEW) | CheckoutScreen ("Apply coupon" field) | ⬜ |
| POST | `/payments/cart/create-order` | bearer | `useCreateCartOrder` (+`coupon_code`) | CheckoutScreen | 🟢 (needs coupon arg) |
| POST | `/customers/cart/checkout` | bearer | `useCheckoutCart` (+`coupon_code`) | CheckoutScreen | 🟢 (needs coupon arg) |

**Flow:** user types a code → `validate-coupon` returns `{valid, reason, breakdown}` → show
applied chip + update price summary (`service_total_due` = pay at salon, `convenience_fee_due` =
pay now, `total_amount`, "You save ₹X") → pass `coupon_code` into create-order + checkout.
Re-validate whenever the cart changes. Reason strings are display-ready (see spec §6).
The booking response gains `discount_amount`, `convenience_fee_discount`, `coupon_id`, `coupon_code`.

> ➖ **Vendor coupon management** (`/vendors/coupons` CRUD) and **admin coupon management**
> (`/admin/coupons` CRUD) are **web-only** (salon-management-app vendor dashboard + salon-admin-panel).
> Not needed in the customer mobile app — see the spec for those surfaces.

---

## 🧑‍💼 Vendors — `/api/v1/vendors`
File: `backend/app/api/vendors.py`

> **Not consumed by this app.** The in-app vendor dashboard was removed on
> 2026-10-19 and now lives in the standalone Lubist vendor app, which tracks
> these endpoints itself. Seed files: `g:\vescavia\Projects\lubist-vendor-app-seed`
> (git tag `archive/vendor-module`). Rows are kept here only so the backend
> surface stays fully listed.

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/vendors/complete-registration` | bearer | — | (vendor app) | ➖ |
| POST | `/vendors/process-payment` | bearer | — | (vendor app) | ➖ |
| GET | `/vendors/salon` | bearer | — | (vendor app) | ➖ |
| PUT | `/vendors/salon` | bearer | — | (vendor app) | ➖ |
| GET | `/vendors/service-categories` | bearer | — | (vendor app) | ➖ |
| GET | `/vendors/services` | bearer | — | (vendor app) | ➖ |
| POST | `/vendors/services` | bearer | — | (vendor app) | ➖ |
| PUT | `/vendors/services/{service_id}` | bearer | — | (vendor app) | ➖ |
| DELETE | `/vendors/services/{service_id}` | bearer | — | (vendor app) | ➖ |
| GET | `/vendors/promotions/active` | bearer | — | (vendor app) | ➖ |
| POST | `/vendors/promotions/apply` | bearer | — | (vendor app) | ➖ |
| GET | `/vendors/coupons` | bearer | — | (vendor app) | ➖ |
| POST | `/vendors/coupons` | bearer | — | (vendor app) | ➖ |
| PATCH | `/vendors/coupons/{coupon_id}` | bearer | — | (vendor app) | ➖ |
| DELETE | `/vendors/coupons/{coupon_id}` | bearer | — | (vendor app) | ➖ |
| GET | `/vendors/bookings` | bearer | — | (vendor app) | ➖ |
| PUT | `/vendors/bookings/{booking_id}/status` | bearer | — | (vendor app) | ➖ |
| GET | `/vendors/analytics` | bearer | — | (vendor app) | ➖ |

---

## 🤝 Relationship Manager — `/api/v1/rm`
File: `backend/app/api/rm.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/rm/vendor-requests` | bearer (rm) | — | — | ⬜ |
| PUT | `/rm/vendor-requests/{request_id}` | bearer (rm) | — | — | ⬜ |
| DELETE | `/rm/vendor-requests/{request_id}` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/vendor-requests` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/vendor-requests/{request_id}` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/salons` | bearer (rm) | — | RMHome | ⬜ |
| PUT | `/rm/profile` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/score-history` | bearer (rm) | — | — | ⬜ |
| GET | `/rm/dashboard` | bearer (rm) | — | RMHome | ⬜ |
| GET | `/rm/leaderboard` | bearer (rm) | — | — | ⬜ |

---

## 💼 Careers — `/api/v1/careers`
File: `backend/app/api/careers.py`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/careers/apply` | public | — | (careers feature) | ⬜ |
| GET | `/careers/applications` | bearer (admin) | — | — | ➖ |
| GET | `/careers/applications/{application_id}` | bearer (admin) | — | — | ➖ |
| PATCH | `/careers/applications/{application_id}` | bearer (admin) | — | — | ➖ |
| GET | `/careers/applications/{application_id}/download/{type}` | bearer (admin) | — | — | ➖ |

---

## ⬆️ Upload — `/api/v1/upload`
File: `backend/app/api/upload.py` · Mobile helper: `src/services/upload/uploadService.ts`

| Method | Path | Auth | Hook | Screen | Status |
|--------|------|------|------|--------|--------|
| POST | `/upload/salon-image` | bearer (vendor) | — | — | ⬜ |
| POST | `/upload/cloudinary-product-image` | bearer | — | — | ⬜ |
| POST | `/upload/agreement-document` | bearer | — | — | ⬜ |
| GET | `/upload/agreement-document/signed-url` | bearer | — | — | ⬜ |

---

## 🛠️ Admin — `/api/v1/admin/*` (web admin panel; ➖ on mobile)
File: `backend/app/api/admin/` — listed for completeness; primarily consumed by `salon-admin-panel`.

<details>
<summary>Expand admin endpoints (41)</summary>

| Method | Path | Sub-router |
|--------|------|-----------|
| GET | `/admin/stats` | dashboard |
| GET | `/admin/recent-activity` | dashboard |
| GET | `/admin/users/` | users |
| POST | `/admin/users/` | users |
| PUT | `/admin/users/{user_id}` | users |
| DELETE | `/admin/users/{user_id}` | users |
| GET | `/admin/salons/` | salons |
| PUT | `/admin/salons/{salon_id}` | salons |
| DELETE | `/admin/salons/{salon_id}` | salons |
| PUT | `/admin/salons/{salon_id}/status` | salons |
| POST | `/admin/salons/{salon_id}/send-payment-reminder` | salons |
| GET | `/admin/rms` | rms |
| PUT | `/admin/rms/{rm_id}` | rms |
| GET | `/admin/vendor-requests` | vendor_requests |
| POST | `/admin/vendor-requests/{request_id}/approve` | vendor_requests |
| POST | `/admin/vendor-requests/{request_id}/reject` | vendor_requests |
| GET | `/admin/bookings/` | bookings |
| GET | `/admin/service-categories` | service_categories |
| GET | `/admin/service-categories/{category_id}` | service_categories |
| POST | `/admin/service-categories` | service_categories |
| PUT | `/admin/service-categories/{category_id}` | service_categories |
| PATCH | `/admin/service-categories/{category_id}/toggle-status` | service_categories |
| DELETE | `/admin/service-categories/{category_id}` | service_categories |
| POST | `/admin/service-categories/reorder` | service_categories |
| POST | `/admin/service-categories/upload-icon` | service_categories |
| GET | `/admin/service-categories/{category_id}/subcategories` | service_subcategories |
| POST | `/admin/service-categories/{category_id}/subcategories` | service_subcategories |
| GET | `/admin/service-categories/subcategories/{subcategory_id}` | service_subcategories |
| PUT | `/admin/service-categories/subcategories/{subcategory_id}` | service_subcategories |
| PATCH | `/admin/service-categories/subcategories/{subcategory_id}/toggle-status` | service_subcategories |
| DELETE | `/admin/service-categories/subcategories/{subcategory_id}` | service_subcategories |
| GET | `/admin/service-categories/all-subcategories` | service_subcategories |
| GET | `/admin/config` | config |
| GET | `/admin/config/available-keys` | config |
| GET | `/admin/config/{config_key}` | config |
| POST | `/admin/config` | config |
| PUT | `/admin/config/{config_key}` | config |
| DELETE | `/admin/config/{config_key}` | config |
| POST | `/admin/config/cleanup/expired-tokens` | config |
| GET | `/admin/product-orders/` | product_orders |
| PATCH | `/admin/product-orders/{order_id}/status` | product_orders |
| GET | `/admin/coupons` | coupons |
| POST | `/admin/coupons` | coupons |
| GET | `/admin/coupons/{coupon_id}` | coupons |
| PATCH | `/admin/coupons/{coupon_id}` | coupons |
| DELETE | `/admin/coupons/{coupon_id}` | coupons |

</details>

---

## 🔭 Backend v2 / gap notes (to discuss)

Candidates we flagged for a possible `/api/v2` or backend tweaks to better serve mobile:

- [ ] **Home-feed aggregation endpoint** — combine `popular-cities` + `nearby` + `categories` into one call to cut mobile round-trips on `ClientHomeScreen`.
- [ ] **Consistent pagination** (cursor-based) across list endpoints for infinite scroll.
- [ ] **Canonical booking surface** — `/customers/bookings/*` is the client surface; `/vendors/bookings/*` for vendors.
- [ ] **Slimmer mobile DTOs** — some list responses may be heavier than mobile needs.
- [ ] _(add items here as they come up)_

---

_Last updated: 2026-06-13 (Coupons & discounts: NEW customer `POST /customers/cart/validate-coupon`
+ `coupon_code` on `/payments/cart/create-order` & `/customers/cart/checkout` (mobile: add an
"Apply coupon" field on CheckoutScreen + `useValidateCoupon`); vendor CRUD `/vendors/coupons` and
admin CRUD `/admin/coupons` are web-only. Full build brief for all three frontends:
backend/docs/COUPONS_UI_SPEC.md. Totals 139→150.) ·
Earlier: Product favorites: new backend `/customers/favorites/products`
GET/POST/DELETE + `product_favorites` table; wired `useFavoriteProducts`/`useAddFavoriteProduct`/
`useRemoveFavoriteProduct` into ProductDetail (heart toggle) and the Saved tab's Products segment
(ClientAccountScreen, previously hardcoded). Backend tests added; see backend/docs/PRODUCT_FAVORITES_API.md.
Also fixed the 2-column product grids on Shopping + Saved tabs (were rendering one card per row).) ·
Earlier: Products rollout phases 1–3: wired `useProductsAPI.ts` →
ClientShopping (categories + featured), ProductCatalog (list/search/category filter),
ProductDetail (by id), plus product-cart (add / qty / remove) on those screens + CartScreen,
with live cart-count badges. Remaining: `clear/all` UI + product-orders checkout.) ·
Earlier same day: audit against live backend removed 34 phantom endpoints — standalone /bookings router, /location/geocode, /payments/booking+history+earnings+webhook, dead /salons + /rm + /upload + /admin endpoints; fixed /auth/resend-verification auth to bearer; total 170→136) · Maintained jointly by the team + Claude Code._
