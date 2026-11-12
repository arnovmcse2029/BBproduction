# Authentication and authorization

## Customers

Supabase Auth is the source of customer identity. The frontend uses Supabase Auth for email and
password sign-in/registration and Google OAuth. Browser requests use the publishable key;
server-rendered session checks use the Supabase SSR client and request cookies. Profile and address
access depends on the deployed RLS policies and profile/address RPCs.

## Administrators

The admin form authenticates with `supabase.auth.signInWithPassword`. A successful customer
sign-in is not sufficient: the application calls `is_restaurant_admin()` and only admits the
user when the RPC returns `true`. Route verification rechecks the Supabase session and that RPC.
The admin UI does not treat an email or browser storage value as authorization.

Product, order, and settings operations must independently be constrained by database RLS; hiding
admin components is not a security boundary. The repository contains policy definitions, but the
hosted policy state has not been verified here.

## Express bearer-token middleware

`backend/src/middleware/auth.ts` calls Supabase Auth `getUser(token)` to verify bearer tokens. It
is not currently mounted because the Express service has no protected routes. If protected
endpoints are added, attach this middleware and add a separate trusted admin authorization check
where an operation requires restaurant-admin privileges.

Never put a Supabase service-role key in the frontend. The backend example uses the anon key and
contains placeholders only.
