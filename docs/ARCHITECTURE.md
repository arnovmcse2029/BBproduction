# Architecture

## Application parts

### Frontend

`frontend/src/` is the TanStack Start React application. TanStack Router derives routes from
`frontend/src/routes/`; `frontend/src/routeTree.gen.ts` is generated and must not be edited
manually. The Start server entry is `frontend/src/server.ts`, while `frontend/src/start.ts`
configures the Start runtime.

The browser uses the Supabase publishable key for Auth and RLS-protected database operations.
Customer session restoration and server-side session checks use the Supabase SSR client in
`frontend/src/lib/supabase-server.ts`. The menu is static code data in `frontend/src/data/menu.ts`; the cart is
temporary browser state persisted in local storage.
Checkout reads public delivery settings for its estimate and retains a payload-scoped retry key
locally; the database order RPC independently locks and validates settings and enforces that key.

### Express backend

`backend/` is a separate Node.js service. Its currently implemented API contains only
`GET /api/v1/health`. Supabase JWT verification middleware exists but is not mounted on a route.
The backend does not currently implement customer order, product, or admin APIs. Frontend API
adapters can be enabled with `VITE_API_BASE_URL`, but pointing them at this health-only service
does not provide those missing APIs.

### Supabase

Supabase Auth provides customer identities. PostgreSQL stores profiles, addresses, and orders
when the corresponding SQL is applied. RLS protects direct client operations. Checkout calls the
`create-customer-order` Edge Function, which validates the authenticated caller and derives item
prices from the same code-managed menu used by the frontend before calling the database order RPC.
The RPC calculates fees/minimums from the current settings row and handles same-key retries
atomically. These changes are defined in a local migration and still require explicit application.

The repository contains SQL files and a local Supabase CLI configuration, not proof of the
currently hosted schema or policy state. See [Database](./DATABASE.md).

## Main communication paths

1. Customer sign-in and Google OAuth use Supabase Auth.
2. Profile and address services use Supabase RPCs/tables under the signed-in user's RLS context.
3. Menu browsing and cart changes use local code data and browser storage.
4. Checkout sends product IDs and quantities to the Edge Function; client-submitted prices are
   not the authoritative order price. The database computes the final total and rejects a stale
   settings estimate before inserting an order.
5. Admin sign-in uses Supabase password authentication and `is_restaurant_admin()`. Database
   operations must also be authorized by deployed RLS policies.
6. The separate Express backend currently provides health reporting only; order creation fails
   explicitly if that unsupported path is configured.
