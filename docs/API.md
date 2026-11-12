# API

This document lists the implemented Express HTTP routes only.

| Method | Path             | Authentication | Behavior                                                           |
| ------ | ---------------- | -------------- | ------------------------------------------------------------------ |
| `GET`  | `/api/v1/health` | Public         | Returns `{ status: "ok", timestamp }` when the service is running. |

The backend has no order, product, customer, or admin HTTP routes today. JWT verification
middleware is present in `backend/src/middleware/auth.ts` but is not attached to any current
route. It validates a Supabase access token with Supabase Auth; it does not create an alternate
identity system or confer restaurant-admin permissions.

The frontend's TanStack routes are browser application routes, not Express API endpoints.
Supabase RPCs and the `create-customer-order` Edge Function are documented in
[Database](./DATABASE.md).
