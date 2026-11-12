-- Migration: 20261112110000_customer_default_address_function.sql
-- Additive migration to ensure the default address handling function and index are present.
-- Prerequisite checks: ensure required tables exist and row level security is enabled.

DO $$
BEGIN
  -- Verify required tables exist.
  IF pg_catalog.to_regclass('public.profiles') IS NULL OR pg_catalog.to_regclass('public.addresses') IS NULL THEN
    RAISE EXCEPTION 'Required tables public.profiles and public.addresses must exist before running this migration.';
  END IF;

  -- Verify RLS is enabled on both tables.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class
    WHERE oid = 'public.profiles'::regclass AND relrowsecurity
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class
    WHERE oid = 'public.addresses'::regclass AND relrowsecurity
  ) THEN
    RAISE EXCEPTION 'Row level security must be enabled on public.profiles and public.addresses before running this migration.';
  END IF;
END;
$$;

-- 1. Unique partial index to enforce a single default address per user.
CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default_per_user_idx
  ON public.addresses (user_id)
  WHERE is_default;

-- 2. Function to set a customer's default address.
CREATE OR REPLACE FUNCTION public.set_customer_default_address(p_address_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Reject unauthenticated calls.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'An authenticated user is required.';
  END IF;

  -- Clear any existing default address for this user.
  UPDATE public.addresses
  SET is_default = FALSE, updated_at = now()
  WHERE user_id = auth.uid() AND is_default;

  -- Attempt to set the requested address as default for the same user.
  UPDATE public.addresses
  SET is_default = TRUE, updated_at = now()
  WHERE id = p_address_id AND user_id = auth.uid();

  -- If no row was updated, the address does not belong to the user.
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The requested address does not belong to the authenticated user.';
  END IF;
END;
$$;

-- 3. Privilege management.
REVOKE ALL ON FUNCTION public.set_customer_default_address(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_customer_default_address(uuid) TO authenticated;

-- 4. Verification block – idempotent checks.
DO $$
BEGIN
  -- Verify the index exists.
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'addresses_one_default_per_user_idx'
      AND n.nspname = 'public'
  ) THEN
    RAISE EXCEPTION 'Index addresses_one_default_per_user_idx was not created.';
  END IF;

  -- Verify function security settings.
  PERFORM 1 FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.proname = 'set_customer_default_address'
    AND n.nspname = 'public'
    AND p.prosecdef = true; -- security definer
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Function set_customer_default_address must be SECURITY DEFINER.';
  END IF;

  -- Verify privileges.
  IF NOT pg_catalog.has_function_privilege('authenticated', 'public.set_customer_default_address(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Authenticated role must have EXECUTE on set_customer_default_address.';
  END IF;
  IF pg_catalog.has_function_privilege('anon', 'public.set_customer_default_address(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Anon role must NOT have EXECUTE on set_customer_default_address.';
  END IF;
END;
$$;

