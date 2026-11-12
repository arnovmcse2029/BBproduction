# Biriyani Babu

Restaurant ordering website built with TanStack Start, React, TypeScript, and Supabase. Customer
authentication and persistent customer/order data use Supabase. The customer menu is maintained in
code at `frontend/src/data/menu.ts`; the cart is persisted in browser local storage.

## Technology

- Frontend: TanStack Start, TanStack Router, React, TypeScript, Vite, Tailwind CSS, TanStack Query
- Forms and validation: React Hook Form and Zod
- Backend: a small Express and TypeScript service under `backend/`
- Database and identity: Supabase PostgreSQL, Supabase Auth, RLS, and Edge Functions
- Payments: COD is supported; Razorpay is not integrated

## Run locally

Prerequisites: Node.js 22.6 or newer and npm.

```sh
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env.local` and set the Supabase project URL and
publishable key. These `VITE_*` values are public client configuration; never put a service-role
key or other secret in the frontend environment.

For local Supabase, copy `frontend/.env.supabase-local.example` to
`frontend/.env.supabase-local`, set the local publishable key, and run
`npm run dev:supabase-local` from `frontend/`.

The Express service is maintained separately:

```sh
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env`, fill in the backend Supabase URL and anon key, then
run `npm run dev` or `npm run build` followed by `npm start`. The backend currently exposes only
`GET /api/v1/health`; it does not yet implement the customer order or admin APIs referenced by
optional frontend API adapters.

## Supabase setup

SQL files and the Edge Function in `supabase/` are local source files; their presence does not
confirm they are applied to a hosted project. See [Database](./docs/DATABASE.md) for objects,
migration notes, and verification limits.

For the code-managed menu ordering path, the relevant local scripts are:

1. `supabase/profiles.sql` and the matching versioned profile/address migration.
2. `supabase/migrations/20261110140000_code_menu_orders.sql`.
3. `supabase/migrations/20261111100000_order_settings_and_idempotency.sql`.
4. `supabase/migrations/20261111110000_retire_legacy_customer_order_rpc.sql`.
5. `supabase/migrations/20261111120000_restaurant_settings_pricing_version.sql`.
6. `supabase/functions/create-customer-order/index.ts`, deployed separately as an Edge Function.

Do not apply `supabase/catalog.sql` or
`supabase/migrations/20261110131500_catalog_orders_payments_reviews.sql` for the code-managed menu
unless intentionally choosing the separate legacy database-catalog design. Those scripts define
products, categories, and restaurant settings. No database changes are run by the local build.

## Project documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Project structure](./docs/PROJECT_STRUCTURE.md)
- [Implemented API](./docs/API.md)
- [Database objects](./docs/DATABASE.md)
- [Authentication](./docs/AUTHENTICATION.md)
- [Deployment](./docs/DEPLOYMENT.md)
