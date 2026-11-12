-- Hosted Supabase read-only inspection for order architecture and security review.
-- This file contains only SELECT statements; it cannot mutate or alter hosted state.

SELECT schemaname, relname AS table_name
FROM pg_catalog.pg_tables
WHERE schemaname = 'supabase_migrations'
ORDER BY relname;

SELECT table_schema, table_name, column_name, data_type, udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'addresses',
    'categories',
    'products',
    'restaurant_settings',
    'orders',
    'order_items',
    'payments',
    'reviews',
    'restaurant_admins'
  )
ORDER BY table_name, ordinal_position;

SELECT tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type,
       kcu.column_name, ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.constraint_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'profiles',
    'addresses',
    'categories',
    'products',
    'restaurant_settings',
    'orders',
    'order_items',
    'payments',
    'reviews',
    'restaurant_admins'
  )
ORDER BY tc.table_name, tc.constraint_name, kcu.ordinal_position;

SELECT n.nspname AS schemaname, c.relname AS table_name, i.relname AS index_name,
       idx.indisunique, idx.indisprimary, idx.indisvalid, idx.indpred IS NOT NULL AS has_partial_index,
       pg_get_indexdef(idx.indexrelid) AS index_definition
FROM pg_index AS idx
JOIN pg_class AS c ON c.oid = idx.indrelid
JOIN pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_class AS i ON i.oid = idx.indexrelid
WHERE n.nspname = 'public'
  AND c.relname IN (
    'profiles',
    'addresses',
    'categories',
    'products',
    'restaurant_settings',
    'orders',
    'order_items',
    'payments',
    'reviews',
    'restaurant_admins'
  )
ORDER BY c.relname, i.relname;

SELECT schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'addresses',
    'categories',
    'products',
    'restaurant_settings',
    'orders',
    'order_items',
    'payments',
    'reviews',
    'restaurant_admins'
  )
ORDER BY tablename;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'addresses',
    'categories',
    'products',
    'restaurant_settings',
    'orders',
    'order_items',
    'payments',
    'reviews',
    'restaurant_admins'
  )
ORDER BY tablename, policyname;

SELECT table_schema, table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'addresses',
    'categories',
    'products',
    'restaurant_settings',
    'orders',
    'order_items',
    'payments',
    'reviews',
    'restaurant_admins'
  )
ORDER BY table_name, grantee, privilege_type;

SELECT n.nspname AS schemaname, p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS argument_list,
       p.oid::regprocedure::text AS signature,
       has_function_privilege('public', p.oid, 'EXECUTE') AS public_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
       has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_execute,
       pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'create_code_menu_order',
    'create_customer_order',
    'is_restaurant_admin',
    'update_restaurant_settings_pricing_version'
  )
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);

SELECT user_id, idempotency_key, COUNT(*) AS duplicate_count
FROM public.orders
WHERE idempotency_key IS NOT NULL
GROUP BY user_id, idempotency_key
HAVING COUNT(*) > 1
ORDER BY user_id, idempotency_key;

SELECT id, config, updated_at
FROM public.restaurant_settings;

SELECT tgname AS trigger_name, tgrelid::regclass::text AS table_name, pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgname = 'restaurant_settings_pricing_version';

SELECT n.nspname AS schemaname, c.relname AS table_name,
       pg_total_relation_size(c.oid) AS total_bytes,
       pg_relation_size(c.oid) AS data_bytes,
       c.reltuples::bigint AS approx_row_count
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'profiles',
    'addresses',
    'categories',
    'products',
    'restaurant_settings',
    'orders',
    'order_items',
    'payments',
    'reviews',
    'restaurant_admins'
  )
ORDER BY c.relname;
