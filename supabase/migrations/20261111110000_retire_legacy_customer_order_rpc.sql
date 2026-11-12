-- The active checkout uses the Edge Function and create_code_menu_order RPC.
-- No repository caller uses the legacy customer-callable catalog RPC.
do $$
begin
  if to_regprocedure(
    'public.create_customer_order(uuid, text, text, text, jsonb, jsonb, text)'
  ) is not null then
    execute 'revoke all on function public.create_customer_order(uuid, text, text, text, jsonb, jsonb, text) from public, anon, authenticated, service_role';
  end if;
end;
$$;
