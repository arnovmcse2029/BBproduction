# Database

## Verification status

The SQL and function source in `supabase/` is repository-maintained. The connected hosted
Supabase project was not queried during this reorganization, so which files have been applied,
the live columns, data, and RLS policies are **not verified**.

## Code-managed menu schema

The code-managed menu checkout path uses these database objects when its SQL has been applied:

| Object              | Purpose and relationships                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`          | Customer profile; `id` references `auth.users(id)`.                                                                                                 |
| `addresses`         | Customer delivery addresses; owned by a Supabase Auth user.                                                                                         |
| `restaurant_admins` | Administrator allowlist keyed by Supabase Auth user ID. Direct table access is revoked in the migration source.                                     |
| `orders`            | Customer order; `user_id` references `auth.users(id)`, `address_id` references `addresses(id)`.                                                     |
| `order_items`       | Snapshotted item rows; `order_id` references `orders(id)`. `product_id` is nullable because menu items are code-managed, not database catalog rows. |
| `restaurant_settings` | Public restaurant/order settings; writes are restricted to authorized restaurant admins by RLS.                                                   |

The versioned SQL also defines `is_restaurant_admin()`, profile/address helper functions,
`ensure_customer_profile()`, `set_customer_default_address(...)`, and the restricted
`create_code_menu_order(...)` RPC. Apply the profile/address migration, the code-menu order
migration, `20261111100000_order_settings_and_idempotency.sql`,
`20261111110000_retire_legacy_customer_order_rpc.sql`, then
`20261111120000_restaurant_settings_pricing_version.sql`. These latest migration files are local
proposals and have **not** been applied to the hosted database.

The legacy `create_customer_order(...)` RPC is not used by the active app. The retirement migration
removes its execution grants from `PUBLIC`, `anon`, `authenticated`, and `service_role`; applying
the standalone `supabase/catalog.sql` afterward would restore its authenticated grant.

The settings version migration sets `updated_at` only when order-relevant settings change and
rejects pricing amounts that exceed the database's two-decimal currency precision. Admin settings
saves leave version updates to this trigger.

The `create-customer-order` Edge Function authenticates the customer, reads authoritative item
details from `frontend/src/data/menu.ts`, then calls the order RPC. The RPC reads and locks the
current restaurant settings row, validates the checkout settings version, and calculates delivery
and minimum-order rules inside the order transaction. Discounts remain zero; offer codes are
display-only and are not accepted as order discounts. Orders store a per-customer idempotency key
and payload hash, with a unique constraint so concurrent same-key calls return one order and
different payloads using that key are rejected.

## Legacy database catalog scripts

`supabase/catalog.sql` and
`supabase/migrations/20261110131500_catalog_orders_payments_reviews.sql` are identical copies
defining a different, database-managed catalog design: `categories`, `products`,
`restaurant_settings`, `payments`, `reviews`, and an older `create_customer_order(...)` RPC. They
are retained as local source files but are not part of the current code-managed menu flow. Do not
apply them unless explicitly choosing that legacy design.

`supabase/profiles.sql` and
`supabase/migrations/20261110130000_customer_profiles_addresses.sql` are identical copies for
manual SQL Editor and versioned migration workflows. Review the project state before applying
either; do not apply both copies as separate migrations.

## Local and hosted state

`supabase/config.toml` configures the local Supabase CLI. No SQL or deployment was executed as
part of this reorganization. It has no seed dataset configured; local seed loading is disabled.
Check the target project's migration history and policies before applying SQL. No destructive
operation is required for this folder change.
