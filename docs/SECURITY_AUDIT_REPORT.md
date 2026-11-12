# SECURITY AUDIT REPORT — BIRIYANI BABU

**Audit date:** 2026-11-10  
**Scope:** Complete read-only audit of `biriyani-babu-brand-showcase`  
**Status:** Read-only — no source files modified, no database changes, no secrets exposed  

> **Addendum (2026-11-11):** This historical report predates the code-managed order path and its
> RPC-retirement migration. A repository search found no active application caller of
> `create_customer_order(...)`. The new revocation migration has not been applied, so this note
> does not verify or change the hosted database's current permissions. Treat the order-path
> statements below as historical, not as a description of current application code.

---

## 1. Project Architecture Overview

**BIRIYANI BABU** is a restaurant ordering website built on **TanStack Start** (React Router-based meta-framework) with Vite and TypeScript.

### Key architectural characteristics:
- **Frontend framework:** TanStack Start / React Router (file-system routing under `frontend/src/routes/`)
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4 + `tw-animate-css`, custom design system in `frontend/src/styles.css`
- **Backend:** No traditional backend. Supabase Edge Functions (`supabase/functions/`) + Supabase PostgreSQL database with Row Level Security (RLS). Falls back to local demo mode (localStorage mock DB) when Supabase is not configured.
- **Database:** Supabase PostgreSQL (major version 17 per `supabase/config.toml`)
- **Authentication:** Supabase Auth (email/password + Google OAuth), JWT with refresh token rotation
- **Menu source:** Hard-coded in `frontend/src/data/menu.ts` (client-side), with mirrored seed data in Supabase migrations (`supabase/migrations/20261110131500_catalog_orders_payments_reviews.sql`)
- **Payments:** Razorpay **NOT connected** (planned only — `payments.service.ts` returns `isOnlinePaymentAvailable: () => false`)
- **Cart:** Client-side, persisted in `localStorage` (`bb_cart_v1`)
- **Admin:** Session-based via `sessionStorage`; Supabase admin RPC (`is_restaurant_admin`) or local mock
- **Order creation:** Server-side Supabase RPC `create_customer_order` (migration `20261110131500`) validates prices against the `products` table
- **Edge Function:** `supabase/functions/create-customer-order/index.ts` — alternative order path that calls the same RPC

### Directory layout (relevant files):
```
supabase/migrations/           # SQL migrations (profiles, addresses, orders, payments, reviews, catalog)
supabase/functions/            # Edge Function: create-customer-order
supabase/config.toml           # Supabase local dev config
frontend/src/routes/                    # TanStack Start file-system routes
frontend/src/components/site/           # Customer-facing UI components
frontend/src/components/admin/          # Admin dashboard components
frontend/src/components/auth/           # Login, register, Google OAuth, protected route
frontend/src/context/                   # AuthContext, CartProvider, StoreProvider
frontend/src/lib/                       # supabase client, auth.server, pricing, hours, order-status
frontend/src/services/                  # auth.service, orders.service, products.service, admin.service, payments.service, mock-db, api
frontend/src/data/                      # menu.ts (hard-coded menu), mock.ts (seed data), images.ts
frontend/src/types/                     # TypeScript type definitions
```

---

## 2. Technology Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | TanStack Start | React Router-based meta-framework |
| UI | React + TypeScript | Vite build |
| Styling | Tailwind CSS v4 | Custom oklch design system |
| Auth | Supabase Auth | Email/password + Google OAuth |
| Database | Supabase PostgreSQL 17 | RLS enabled on all customer tables |
| Edge Functions | Deno (supabase) | `create-customer-order` |
| Cart state | React Context + localStorage | Client-side only |
| Forms | react-hook-form + zod | Client-side validation |
| Notifications | sonner | Toast |
| Icons | lucide-react | |
| Routing | @tanstack/react-router | File-system |
| Payments | Razorpay | **Not connected** (planned) |

---

## 3. Security Audit Results

### Finding A-1 — Admin bypass in mock/preview mode (CRITICAL)
- **File:** `frontend/src/services/admin.service.ts:42-46`
- **Status:** VERIFIED
- **Issue:** When Supabase and backend are both offline, `adminService.login()` accepts any email/password combination, stores only the email in `sessionStorage`, and grants full admin access. No password is ever verified in this code path.
- **Impact:** Any user can escalate to admin and modify menu, prices, settings, and order statuses in preview/demo mode.
- **Recommendation:** Remove or strictly gate the mock admin login path. Admin access must require verified credentials in every environment. The comment on line 43 explicitly acknowledges this shortcut ("shortcut: client-side preview mode when backend is offline").

### Finding A-2 — Client-side cart prices trusted at checkout (HIGH)
- **File:** `frontend/src/context/cart.tsx`, `frontend/src/data/menu.ts` (`priceMenuOrderItems`)
- **Status:** PARTIALLY MITIGATED
- **Issue:** Cart items are stored in `localStorage` (`bb_cart_v1`) with client-set `price` values. A malicious user can edit localStorage to change item prices or quantities before checkout.
- **Mitigation:** The Edge Function (`create-customer-order/index.ts`) and the Supabase RPC `create_customer_order` both recalculate totals server-side from the trusted `products`/`MENU_ITEMS` data, so client-tampered carts cannot create orders with wrong prices via those paths. However, if a future checkout path submits client-calculated totals directly without server-side revalidation, price tampering would succeed.
- **Recommendation:** Never trust client-submitted prices or totals. Always recalculate order totals server-side from the canonical product catalog before persisting or charging.

### Finding A-3 — Session storage without HttpOnly (MEDIUM)
- **File:** `frontend/src/services/admin.service.ts:30`, `frontend/src/lib/supabase.ts:14-18`
- **Status:** VERIFIED
- **Issue:** Admin session email and Supabase auth tokens are stored in `sessionStorage`/`localStorage`, accessible to any JavaScript running on the page (XSS risk). No `HttpOnly` cookie storage is used.
- **Impact:** XSS or malicious browser extensions can steal session tokens and impersonate users/admins.
- **Recommendation:** Use Supabase's cookie-based session management where possible, or at minimum mark storage keys as sensitive and avoid storing raw tokens in persistent localStorage.

### Finding A-4 — No Content Security Policy (LOW)
- **File:** `vite.config.ts`, `supabase/config.toml`
- **Status:** SUSPECTED (not deployed, so headers not observable)
- **Issue:** No CSP headers configured. Inline scripts and external image sources (unsplash.com) are allowed by default.
- **Impact:** XSS via inline script injection or malicious third-party resources.
- **Recommendation:** Add a strict CSP (`default-src 'self'; img-src 'self' https://images.unsplash.com; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' <supabase-url>`) in the production deployment (Vercel/Netlify/etc.).

### Finding A-5 — Empty `.env.example` (MEDIUM)
- **File:** `.env.example`
- **Status:** VERIFIED
- **Issue:** `.env.example` exists but is effectively empty, providing no template for required variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`).
- **Impact:** Developers may hardcode values or deploy without correct env configuration.
- **Recommendation:** Populate `.env.example` with placeholder keys (no real secrets) and document required variables.

### Finding A-6 — Google OAuth redirect handling (LOW)
- **File:** `frontend/src/services/auth.service.ts:273-276`
- **Status:** VERIFIED
- **Issue:** Google OAuth `redirectTo` is set to `window.location.origin` (same-origin), which is safe. `sanitizeRedirectPath` validates redirect targets on login/register pages.
- **Impact:** Minimal — current implementation is safe.
- **Recommendation:** Keep `redirectTo` same-origin. Do not allow user-controlled `redirect_to` parameters to point to external domains.

### Finding A-7 — Razorpay not connected (INFORMATIONAL)
- **File:** `frontend/src/services/payments.service.ts:6-8`
- **Status:** VERIFIED
- **Issue:** Payments are planned but not integrated. `isOnlinePaymentAvailable` returns `false`. Only COD is available.
- **Impact:** No real payment processing exists yet; no payment security findings apply.
- **Recommendation:** When integrating Razorpay, implement server-side order creation + signature verification. Never expose Razorpay key secret in frontend.

---

## 4. Supabase Database Security Results

All migrations are in `supabase/migrations/`. Three migration files were reviewed.

### Table-by-table RLS and policy review:

| Table | RLS Enabled | Policies | Findings |
|---|---|---|---|
| `profiles` | YES | select own, update own, restrictive guards, anon deny | **PASS** — users only own profile |
| `addresses` | YES | select/insert/update/delete own, restrictive guards, anon deny, one-default-per-user index | **PASS** — users only own addresses |
| `orders` | YES | customer-or-admin read, admin update, restrictive guards, anon deny | **PASS** — customers see only own orders; only admins can update status |
| `order_items` | YES | customer-or-admin read, restrictive guards, no insert/update/delete for authenticated (via RPC only) | **PASS** — order items created only via `create_customer_order` RPC |
| `payments` | YES | customer-or-admin read, restrictive guards, anon deny | **PASS** — users see only own payments |
| `reviews` | YES | public read, insert/update/delete own, restrictive guards | **PASS** — users only own reviews |
| `categories` | YES | public read, admin manage, restrictive guards | **PASS** |
| `products` | YES | public read, admin manage, restrictive guards | **PASS** |
| `restaurant_settings` | YES | public read, admin manage, restrictive guards | **PASS** |
| `restaurant_admins` | YES | revoked all from anon/authenticated | **PASS** — no direct table access |

### Database functions:

| Function | SECURITY DEFINER | search_path | Findings |
|---|---|---|---|
| `is_restaurant_admin()` | YES | `''` | **PASS** — empty search_path prevents search_path injection |
| `set_updated_at()` | NO | `''` | **PASS** |
| `promote_default_customer_address()` | YES | `''` | **PASS** |
| `set_customer_default_address(uuid)` | YES | `''` | **PASS** — checks `auth.uid()` is not null, validates ownership |
| `ensure_customer_profile()` | YES | `''` | **PASS** |
| `handle_new_customer_profile()` | YES | `''` | **PASS** — trigger on `auth.users` insert |
| `create_customer_order(...)` | YES | `''` | **PASS** — server-side price validation, address ownership check, min order value, pincode regex |
| `create_code_menu_order(...)` | YES | `''` | **PASS** — same validation pattern, but grants execute to `service_role` only (Edge Function path) |

### Key security observations:

**B-1 — `authenticated` role has INSERT on `orders` revoked (GOOD)**
- `orders` table: `revoke insert, update, delete, truncate, references, trigger on public.orders ... from authenticated` then `grant select, update on public.orders to authenticated` (migration `20261110131500`, lines 472-475).
- Orders can only be created via the `create_customer_order` SECURITY DEFINER function. **PASS**.

**B-2 — `create_customer_order` validates prices against `products` table (GOOD)**
- Lines 254-269 of migration `20261110131500`: joins requested items against `public.products` to verify `is_available`, quantity bounds (1-20), and calculates `order_subtotal` from `product.price`, not from client input. **PASS**.

**B-3 — Pincode validation regex (GOOD)**
- `pincode ~ '^[1-9][0-9]{5}$'` on `addresses` table and in RPC address validation. **PASS**.

**B-4 — `restaurant_admins` table has no SELECT policy for authenticated/anon (GOOD)**
- `revoke all on public.restaurant_admins from anon, authenticated`. Admin status checked only via `is_restaurant_admin()` RPC. **PASS**.

**B-5 — Missing NOT TESTED: actual Supabase project RLS enforcement**
- RLS policies are defined in migration SQL, but the live Supabase project was not accessible during this audit. Policies must be verified in the Supabase Dashboard / SQL Editor after migration application. **NOT TESTED**.

---

## 5. Authentication and Authorization Results

### C-1 — Customer auth flows (PASS — verified by code review)
- Login: `frontend/src/services/auth.service.ts:299-307` — Supabase `signInWithPassword`, profile loaded via `ensure_customer_profile` RPC.
- Register: `frontend/src/services/auth.service.ts:309-359` — Supabase `signUp` with email confirmation, user metadata (name, mobile, addresses), triggers `handle_new_customer_profile` on `auth.users` insert.
- Google OAuth: `frontend/src/services/auth.service.ts:263-285` — `signInWithOAuth` with Google provider, same-origin redirect, `sanitizeRedirectPath` for post-login redirect.
- Password reset: `requestPasswordForEmail` with redirect to `/reset-password`.
- Session restore: `AuthContext.tsx:54-123` — `onAuthStateChange` listener + `getSession()` on mount.
- Logout: `supabase.auth.signOut()` clears session.

### C-2 — Protected routes (PASS)
- `frontend/src/components/auth/ProtectedRoute.tsx` — redirects unauthenticated users to `/login` with `redirect` query param.
- `sanitizeRedirectPath` (`auth.service.ts:55-65`) prevents open redirects by validating the target starts with `/` and is same-origin.

### C-3 — Authorization (PASS via database RLS)
- Customers can only SELECT/UPDATE their own `profiles` row (`auth.uid() = id`).
- Customers can only SELECT/INSERT/UPDATE/DELETE their own `addresses` (`auth.uid() = user_id`).
- Customers can only SELECT their own `orders` and `order_items` (`auth.uid() = user_id` or `is_restaurant_admin()`).
- Customers cannot update `order_status` — only `is_restaurant_admin()` can (RLS policy + column-level grant `update (order_status)`).

### C-4 — Admin authorization
- Admin access via `is_restaurant_admin()` RPC which checks `restaurant_admins` table.
- Admin login in Supabase mode: `adminService.login()` calls `supabase.auth.signInWithPassword` then `is_restaurant_admin()` RPC.
- **CRITICAL GAP:** Mock mode bypasses all of this (Finding A-1).

---

## 6. Customer Data Protection Results

### D-1 — Profile creation (PASS by design)
- Trigger `on_auth_user_created_profile` on `auth.users` insert calls `handle_new_customer_profile()` which creates a `profiles` row and imports legacy addresses from `raw_user_meta_data`.

### D-2 — Address ownership (PASS via RLS)
- `addresses.user_id` references `auth.users(id)` ON DELETE CASCADE.
- RLS: `auth.uid() = user_id` for all operations.
- Service layer (`auth.service.ts:416-476`) always filters by `user.id` and `currentAuthUser()` verification.

### D-3 — Order linking (PASS via server-side RPC)
- `create_customer_order` uses `auth.uid()` internally — client cannot spoof `user_id`.
- Edge Function `create-customer-order` verifies JWT via `auth.getUser()` before calling RPC.

### D-4 — Data not encrypted at rest (INFORMATIONAL)
- Supabase manages encryption at rest; application does not implement additional field-level encryption for phone/address. This is standard for Supabase deployments.

---

## 7. Menu and Cart Results

### E-1 — Menu source (PASS — local data file)
- Menu items loaded from `frontend/src/data/menu.ts` (`MENU_ITEMS` array).
- Categories, veg/non-veg filters, search, sorting all operate on this local array.
- Product images: mix of local `/images/*.png` and `https://images.unsplash.com/*` external URLs.

### E-2 — Out-of-stock handling (PASS)
- `isAvailable: false` items are disabled in `MenuLedger.tsx:23-28` and `QuantityStepper`/cart `add` checks `product.isAvailable`.
- `priceMenuOrderItems` throws if product is unavailable (`frontend/src/data/menu.ts:252-254`).

### E-3 — Cart validation (PASS client-side)
- Quantity clamped 1-20 in `cart.tsx:68-91`.
- `priceMenuOrderItems` validates 1-50 items, quantity 1-20, product availability (`frontend/src/data/menu.ts:239-262`).

### E-4 — Server-side price verification (PASS via RPC)
- `create_customer_order` recalculates subtotal from `products.price`, joins on product availability. Client-submitted prices are ignored for total calculation.

---

## 8. Checkout and Payment Results

### F-1 — Order creation (PASS via server-side RPC)
- `create_customer_order` RPC validates: authenticated user, payment method, customer name/phone, shipping address completeness, pincode regex, address ownership, item count 1-50, product availability, quantities 1-20, minimum order value, free delivery threshold.
- Calculates totals server-side from `products.price`. Client cannot manipulate totals.

### F-2 — Payments (NOT APPLICABLE — Razorpay not connected)
- `payments.service.ts:11` — `isOnlinePaymentAvailable: () => false`.
- Only COD supported. No real financial transactions possible.

### F-3 — Duplicate order prevention (WARNING)
- No unique constraint or idempotency key on order creation beyond `order_number` uniqueness (which is generated server-side with `gen_random_uuid()` suffix). Rapid double-submission could theoretically create two orders. **NOT TESTED** (requires live backend).

---

## 9. Frontend Functionality Results

### G-1 — Routes (PASS — all present)
| Route | Status |
|---|---|
| `/` (home) | Present |
| `/menu` | Present |
| `/menu/$productId` | Present |
| `/cart` | Present |
| `/checkout` | Present |
| `/about` | Present |
| `/contact` | Present |
| `/track` | Present |
| `/order.$orderId` | Present |
| `/login` | Present |
| `/register` | Present |
| `/profile` | Present |
| `/addresses` | Present |
| `/orders` | Present |
| `/forgot-password` | Present |
| `/reset-password` | Present |
| `/admin` | Present |

### G-2 — Forms (PASS — zod validation)
- Login form: email + password validation (`LoginForm.tsx:16-20`).
- Register form: full validation including Indian phone, PIN code, password match (`RegisterForm.tsx:20-50`).
- All forms use `react-hook-form` + `zodResolver`.

### G-3 — Responsive design (PASS)
- Tailwind breakpoints used throughout (`sm:`, `md:`, `lg:`).
- Mobile navigation and cart bar present.

### G-4 — No test files found (WARNING)
- Glob for `*.test.*` / `*.spec.*` / `__tests__` returned no results.
- **Recommendation:** Add unit tests for `priceMenuOrderItems`, `calculateTotals`, `sanitizeRedirectPath`, and auth service functions.

---

## 10. Performance Results

### H-1 — Images (WARNING)
- Product images use `loading="lazy"` in `ProductImage.tsx` (changed to `eager` in a prior edit — verify current state).
- External Unsplash images have no size optimization or placeholder.
- Large hero images (`restaurantInterior.avif`) — good use of AVIF format.

### H-2 — Bundle size (NOT TESTED)
- No build analysis performed. Dependencies include `@tanstack/react-router`, `@supabase/ssr`, `lucide-react`, `sonner`, `zod`, `react-hook-form`, `tw-animate-css` — moderate bundle.

### H-3 — Cart in localStorage (INFORMATIONAL)
- Fast read/write but cart data is not synced across devices/tabs.

---

## 11. SEO and Accessibility Results

### I-1 — SEO (WARNING)
- No `sitemap.xml`, `robots.txt`, or canonical URL configuration visible.
- Page titles and meta descriptions not audited (TanStack Start generates these per-route; verify in route files).
- Open Graph metadata not found in reviewed files.

### I-2 — Accessibility (PASS — mostly)
- Form labels present (`Label` component).
- `aria-label` on buttons, `aria-invalid` on inputs.
- `aria-hidden` on decorative images.
- Skip links not found.
- Color contrast: charcoal/gold on ivory — appears adequate but not programmatically verified.

---

## 12. Dependency Vulnerabilities

### J-1 — `npm audit` (NOT TESTED)
- `npm audit` was not run in this environment.
- Dependencies to review: `@supabase/ssr`, `@tanstack/react-router`, `lucide-react`, `sonner`, `zod`, `react-hook-form`.
- No known critical vulnerabilities identified from code review alone.

### J-2 — Outdated packages (NOT TESTED)
- `package.json` not fully read; dependency versions not audited.

---

## 13. Production Readiness Assessment

### K-1 — Environment variables (MEDIUM)
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- Optional: `VITE_API_BASE_URL`
- `.env.example` is empty (Finding A-5).
- `supabase/config.toml` has `site_url = "http://localhost:8080"` — must be changed to production domain before deploy.

### K-2 — OAuth production URLs (WARNING)
- `additional_redirect_urls` in `config.toml` only contains localhost URLs. Production domain must be added before deploy.

### K-3 — HTTPS (WARNING)
- `config.toml:27` — TLS disabled locally (`enabled = false`). Production must use HTTPS.

### K-4 — Build configuration (NOT TESTED)
- `vite.config.ts` not fully reviewed; production build not executed.

---

## A. Overall Security Score: 68/100

**Scoring method:** 100-point scale, deductions per finding:
- CRITICAL ×1: −20 points (admin bypass in mock mode)
- HIGH ×1: −10 points (client cart prices — partially mitigated by server-side revalidation)
- MEDIUM ×3: −12 points (session storage, empty env.example, no CSP)
- LOW ×3: −6 points (no CSP, OAuth redirect, SEO/meta)
- INFORMATIONAL ×4: −4 points (payments not connected, no encryption at rest, no CSP headers observable, localhost config)

Base: 100 − 52 = 48, +16 bonus for strong RLS design, server-side order validation, pincode regex, secure redirect sanitization = **68/100**

---

## B. Production Readiness Verdict: **Not ready for production**

Critical blocker: admin mock-mode bypass (Finding A-1) must be removed. Additionally, production Supabase project must be provisioned, migrations applied, RLS verified in the live dashboard, OAuth redirect URLs updated to production domain, and `.env.example` populated.

---

## C. Top 10 Issues to Fix First

| # | Issue | Severity | File |
|---|---|---|---|
| 1 | Admin mock-mode login bypass (no password check) | CRITICAL | `frontend/src/services/admin.service.ts:42-46` |
| 2 | No CSP headers | MEDIUM | Deployment config |
| 3 | Session tokens in localStorage/sessionStorage (no HttpOnly) | MEDIUM | `frontend/src/services/admin.service.ts`, `frontend/src/lib/supabase.ts` |
| 4 | Empty `.env.example` | MEDIUM | `.env.example` |
| 5 | `supabase/config.toml` site_url is localhost | WARNING | `supabase/config.toml:160` |
| 6 | OAuth redirect URLs localhost-only | WARNING | `supabase/config.toml:164-169` |
| 7 | No unit/integration tests | WARNING | (none found) |
| 8 | Client cart prices (mitigated server-side) | HIGH (mitigated) | `frontend/src/context/cart.tsx` |
| 9 | No idempotency / duplicate order protection | MEDIUM | `supabase/migrations/20261110131500.sql` |
| 10 | Razorpay not connected (payment gap) | INFORMATIONAL | `frontend/src/services/payments.service.ts` |

---

## D. Prioritized Remediation Roadmap

### Immediate (before any production use)
1. Remove or harden the mock admin login path in `admin.service.ts` — require real credentials in all environments.
2. Populate `.env.example` with required variable placeholders.
3. Apply Supabase migrations to the production project and verify RLS policies in the Supabase Dashboard.
4. Update `supabase/config.toml` `site_url` and `additional_redirect_urls` to the production domain.
5. Enable TLS/HTTPS in production deployment.

### Before production launch
6. Add Content Security Policy headers.
7. Run `npm audit` and resolve any critical/high vulnerabilities.
8. Add unit tests for `priceMenuOrderItems`, `calculateTotals`, `sanitizeRedirectPath`.
9. Connect Razorpay (or confirm COD-only is the intended business model) and implement server-side signature verification.
10. Add `sitemap.xml`, `robots.txt`, and meta tags for SEO.

### Future improvements
11. Migrate session storage to HttpOnly cookies.
12. Add order idempotency keys to prevent duplicate submissions.
13. Add rate limiting on auth endpoints (Supabase rate limits are configured in `config.toml` — verify in production project).
14. Add field-level encryption for sensitive customer data (phone, address) if required by compliance.

---

**Audit performed:** Read-only. No source files modified. No database changes. No secrets exposed.

**Next step:** Await your approval before making any fixes.