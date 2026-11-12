-- Reconcile profile/address grants after the 20261111120000 migration.
-- Prerequisites: public.profiles and public.addresses with RLS enabled; profiles has
-- full_name, phone, and avatar_url; Supabase roles anon, authenticated, and service_role;
-- PostgreSQL 17+ for the MAINTAIN privilege.
-- This migration changes ACLs only; it does not change policies, triggers, or data.
begin;

do $$
begin
  if pg_catalog.to_regclass('public.profiles') is null
    or pg_catalog.to_regclass('public.addresses') is null
  then
    raise exception 'Profile privilege reconciliation requires public.profiles and public.addresses.';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_class
    where oid = 'public.profiles'::regclass and relrowsecurity
  ) or not exists (
    select 1 from pg_catalog.pg_class
    where oid = 'public.addresses'::regclass and relrowsecurity
  ) then
    raise exception 'Profile privilege reconciliation requires RLS to be enabled on both tables.';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'phone'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    raise exception 'Profile privilege reconciliation requires full_name, phone, and avatar_url columns.';
  end if;
end;
$$;

revoke all privileges on table public.profiles from public, anon, authenticated;
revoke all privileges on table public.addresses from public, anon, authenticated;

do $$
declare
  column_name text;
begin
  for column_name in
    select attribute.attname
    from pg_catalog.pg_attribute as attribute
    where attribute.attrelid = 'public.profiles'::regclass
      and attribute.attnum > 0
      and not attribute.attisdropped
  loop
    execute pg_catalog.format(
      'revoke all privileges (%I) on table public.profiles from public, anon, authenticated',
      column_name
    );
  end loop;

  for column_name in
    select attribute.attname
    from pg_catalog.pg_attribute as attribute
    where attribute.attrelid = 'public.addresses'::regclass
      and attribute.attnum > 0
      and not attribute.attisdropped
  loop
    execute pg_catalog.format(
      'revoke all privileges (%I) on table public.addresses from public, anon, authenticated',
      column_name
    );
  end loop;
end;
$$;

grant select on table public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.addresses to authenticated;

-- Revoking direct EXECUTE does not disable already-created triggers.
do $$
begin
  if pg_catalog.to_regprocedure('public.handle_new_customer()') is not null then
    execute
      'revoke all privileges on function public.handle_new_customer() from public, anon, authenticated';
  end if;

  if pg_catalog.to_regprocedure('public.handle_new_customer_profile()') is not null then
    execute
      'revoke all privileges on function public.handle_new_customer_profile() from public, anon, authenticated';
  end if;
end;
$$;

revoke all privileges on function public.ensure_customer_profile() from public, anon;
grant execute on function public.ensure_customer_profile() to authenticated;

do $$
declare
  table_name text;
  privilege_name text;
  column_name text;
  handler_signature text;
begin
  if not pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'select')
    or pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'insert')
    or pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'update')
    or pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'delete')
    or pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'truncate')
    or pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'references')
    or pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'trigger')
    or pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'maintain')
  then
    raise exception 'Unexpected or missing effective table privilege remains on public.profiles for authenticated.';
  end if;

  for column_name in
    select attribute.attname
    from pg_catalog.pg_attribute as attribute
    where attribute.attrelid = 'public.profiles'::regclass
      and attribute.attnum > 0
      and not attribute.attisdropped
  loop
    if pg_catalog.has_column_privilege('authenticated', 'public.profiles', column_name, 'insert')
      or pg_catalog.has_column_privilege('authenticated', 'public.profiles', column_name, 'references')
      or pg_catalog.has_column_privilege('authenticated', 'public.profiles', column_name, 'update')
        is distinct from (column_name in ('full_name', 'phone', 'avatar_url'))
    then
      raise exception 'Unexpected effective column privilege remains on public.profiles for authenticated: %.', column_name;
    end if;
  end loop;

  if not pg_catalog.has_column_privilege('authenticated', 'public.profiles', 'full_name', 'update')
    or not pg_catalog.has_column_privilege('authenticated', 'public.profiles', 'phone', 'update')
    or not pg_catalog.has_column_privilege('authenticated', 'public.profiles', 'avatar_url', 'update')
  then
    raise exception 'Required customer profile column UPDATE privileges are missing.';
  end if;

  if not pg_catalog.has_table_privilege('authenticated', 'public.addresses', 'select')
    or not pg_catalog.has_table_privilege('authenticated', 'public.addresses', 'insert')
    or not pg_catalog.has_table_privilege('authenticated', 'public.addresses', 'update')
    or not pg_catalog.has_table_privilege('authenticated', 'public.addresses', 'delete')
    or pg_catalog.has_table_privilege('authenticated', 'public.addresses', 'truncate')
    or pg_catalog.has_table_privilege('authenticated', 'public.addresses', 'references')
    or pg_catalog.has_table_privilege('authenticated', 'public.addresses', 'trigger')
    or pg_catalog.has_table_privilege('authenticated', 'public.addresses', 'maintain')
  then
    raise exception 'Unexpected or missing effective table privilege remains on public.addresses for authenticated.';
  end if;

  for column_name in
    select attribute.attname
    from pg_catalog.pg_attribute as attribute
    where attribute.attrelid = 'public.addresses'::regclass
      and attribute.attnum > 0
      and not attribute.attisdropped
  loop
    if pg_catalog.has_column_privilege('authenticated', 'public.addresses', column_name, 'references') then
      raise exception 'Unexpected effective column REFERENCES privilege remains on public.addresses for authenticated: %.', column_name;
    end if;
  end loop;

  foreach table_name in array array['public.profiles', 'public.addresses']
  loop
    foreach privilege_name in array array[
      'select', 'insert', 'update', 'delete', 'truncate', 'references', 'trigger', 'maintain'
    ]
    loop
      if pg_catalog.has_table_privilege('anon', table_name, privilege_name) then
        raise exception 'Unexpected effective table privilege remains on % for anon: %.', table_name, privilege_name;
      end if;
    end loop;

    for column_name in
      select attribute.attname
      from pg_catalog.pg_attribute as attribute
      where attribute.attrelid = table_name::regclass
        and attribute.attnum > 0
        and not attribute.attisdropped
    loop
      foreach privilege_name in array array['select', 'insert', 'update', 'references']
      loop
        if pg_catalog.has_column_privilege('anon', table_name, column_name, privilege_name) then
          raise exception 'Unexpected effective column privilege remains on % for anon: %.%.',
            table_name, column_name, privilege_name;
        end if;
      end loop;
    end loop;
  end loop;

  foreach table_name in array array['public.profiles', 'public.addresses']
  loop
    foreach privilege_name in array array[
      'select', 'insert', 'update', 'delete', 'truncate', 'references', 'trigger', 'maintain'
    ]
    loop
      if not pg_catalog.has_table_privilege('service_role', table_name, privilege_name) then
        raise exception 'Expected existing effective service_role privilege is missing on %: %.',
          table_name, privilege_name;
      end if;
    end loop;
  end loop;

  if pg_catalog.has_function_privilege(
    'anon', 'public.ensure_customer_profile()', 'execute'
  ) or not pg_catalog.has_function_privilege(
    'authenticated', 'public.ensure_customer_profile()', 'execute'
  ) then
    raise exception 'Unexpected effective EXECUTE privilege on public.ensure_customer_profile().';
  end if;

  foreach handler_signature in array array[
    'public.handle_new_customer()',
    'public.handle_new_customer_profile()'
  ]
  loop
    if pg_catalog.to_regprocedure(handler_signature) is not null
      and (
        pg_catalog.has_function_privilege('anon', handler_signature, 'execute')
        or pg_catalog.has_function_privilege('authenticated', handler_signature, 'execute')
      )
    then
      raise exception 'Direct execution remains available for trigger function %.', handler_signature;
    end if;
  end loop;
end;
$$;

commit;
