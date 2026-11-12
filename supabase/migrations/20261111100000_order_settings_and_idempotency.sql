-- Keep checkout settings public-readable and admin-writable, and make order retries atomic.
create table if not exists public.restaurant_settings (
  id boolean primary key default true check (id),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.restaurant_settings (id, config)
values (
  true,
  jsonb_build_object(
    'isOpen', true,
    'acceptingOrders', true,
    'codEnabled', true,
    'deliveryFee', 40,
    'freeDeliveryAbove', 0,
    'minOrderValue', 0
  )
)
on conflict (id) do nothing;

alter table public.restaurant_settings enable row level security;
grant select on public.restaurant_settings to anon, authenticated;
grant insert, update, delete on public.restaurant_settings to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'restaurant_settings'
      and policyname = 'restaurant_settings_public_read'
  ) then
    create policy restaurant_settings_public_read on public.restaurant_settings
      for select to anon, authenticated using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'restaurant_settings'
      and policyname = 'restaurant_settings_admin_manage'
  ) then
    create policy restaurant_settings_admin_manage on public.restaurant_settings
      for all to authenticated
      using (public.is_restaurant_admin())
      with check (public.is_restaurant_admin());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'restaurant_settings'
      and policyname = 'restaurant_settings_admin_write_guard'
  ) then
    create policy restaurant_settings_admin_write_guard on public.restaurant_settings
      as restrictive for insert to authenticated
      with check (public.is_restaurant_admin());
    create policy restaurant_settings_admin_update_guard on public.restaurant_settings
      as restrictive for update to authenticated
      using (public.is_restaurant_admin())
      with check (public.is_restaurant_admin());
    create policy restaurant_settings_admin_delete_guard on public.restaurant_settings
      as restrictive for delete to authenticated
      using (public.is_restaurant_admin());
  end if;
end;
$$;

alter table public.orders add column if not exists idempotency_key uuid;
alter table public.orders add column if not exists request_hash text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_user_idempotency_key_key'
  ) then
    alter table public.orders
      add constraint orders_user_idempotency_key_key unique (user_id, idempotency_key);
  end if;
end;
$$;

create or replace function public.create_code_menu_order(
  p_user_id uuid,
  p_address_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_payment_method text,
  p_idempotency_key uuid,
  p_request_hash text,
  p_settings_updated_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item_count integer;
  distinct_product_count integer;
  order_subtotal numeric(10, 2);
  delivery_fee numeric(10, 2);
  free_delivery_above numeric(10, 2);
  min_order_value numeric(10, 2);
  settings_config jsonb;
  settings_updated_at timestamptz;
  generated_order_number text;
  generated_order_id uuid;
  created_order public.orders%rowtype;
begin
  if p_user_id is null or p_idempotency_key is null
    or p_request_hash is null or p_request_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'An authenticated user and valid idempotency request are required.';
  end if;

  select * into created_order
  from public.orders
  where user_id = p_user_id and idempotency_key = p_idempotency_key;
  if found then
    if created_order.request_hash is distinct from p_request_hash then
      raise exception using
        errcode = '22023',
        message = 'Idempotency key has already been used with a different order request.';
    end if;
    return (to_jsonb(created_order) - 'idempotency_key' - 'request_hash')
      || jsonb_build_object(
        'order_items',
        coalesce(
          (select jsonb_agg(to_jsonb(order_item) order by order_item.created_at, order_item.id)
           from public.order_items as order_item where order_item.order_id = created_order.id),
          '[]'::jsonb
        )
      );
  end if;

  if p_payment_method is distinct from 'online' and p_payment_method is distinct from 'cod' then
    raise exception 'Unsupported payment method.';
  end if;
  if nullif(trim(p_customer_name), '') is null or nullif(trim(p_customer_phone), '') is null then
    raise exception 'Customer name and phone are required.';
  end if;
  if p_shipping_address is null
    or nullif(trim(p_shipping_address ->> 'house'), '') is null
    or nullif(trim(p_shipping_address ->> 'street'), '') is null
    or nullif(trim(p_shipping_address ->> 'area'), '') is null
    or nullif(trim(p_shipping_address ->> 'fullAddress'), '') is null
    or nullif(trim(p_shipping_address ->> 'city'), '') is null
    or nullif(trim(p_shipping_address ->> 'state'), '') is null
    or coalesce(p_shipping_address ->> 'pincode', '') !~ '^[1-9][0-9]{5}$'
  then
    raise exception 'A complete delivery address is required.';
  end if;
  if p_items is null or jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) not between 1 and 50
  then
    raise exception 'An order must contain between 1 and 50 items.';
  end if;
  if p_settings_updated_at is null then
    raise exception 'Restaurant pricing settings are unavailable.';
  end if;
  if not exists (
    select 1 from public.addresses
    where id = p_address_id and user_id = p_user_id
  ) then
    raise exception 'Select one of your saved addresses to place this order.';
  end if;

  select config, updated_at
    into settings_config, settings_updated_at
  from public.restaurant_settings
  where id = true
  for share;
  if not found then
    raise exception 'Restaurant pricing settings are unavailable.';
  end if;
  if settings_updated_at <> p_settings_updated_at then
    raise exception using
      errcode = '40001',
      message = 'Order pricing settings changed. Review the updated total and retry.';
  end if;

  if jsonb_typeof(settings_config) is distinct from 'object'
    or jsonb_typeof(settings_config -> 'isOpen') is distinct from 'boolean'
    or jsonb_typeof(settings_config -> 'acceptingOrders') is distinct from 'boolean'
    or jsonb_typeof(settings_config -> 'codEnabled') is distinct from 'boolean'
    or jsonb_typeof(settings_config -> 'deliveryFee') is distinct from 'number'
    or jsonb_typeof(settings_config -> 'freeDeliveryAbove') is distinct from 'number'
    or jsonb_typeof(settings_config -> 'minOrderValue') is distinct from 'number'
  then
    raise exception 'Restaurant order settings are invalid.';
  end if;

  delivery_fee := (settings_config ->> 'deliveryFee')::numeric;
  free_delivery_above := (settings_config ->> 'freeDeliveryAbove')::numeric;
  min_order_value := (settings_config ->> 'minOrderValue')::numeric;
  if delivery_fee < 0 or free_delivery_above < 0 or min_order_value < 0 then
    raise exception 'Restaurant order settings are invalid.';
  end if;
  if settings_config ->> 'isOpen' <> 'true'
    or settings_config ->> 'acceptingOrders' <> 'true'
  then
    raise exception 'The restaurant is not accepting orders right now.';
  end if;
  if p_payment_method = 'cod' and settings_config ->> 'codEnabled' <> 'true' then
    raise exception 'Cash on delivery is currently unavailable.';
  end if;

  select count(*), count(distinct item.product_id),
    coalesce(sum(item.unit_price * item.quantity), 0)
    into item_count, distinct_product_count, order_subtotal
  from jsonb_to_recordset(p_items) as item(
    product_id text, product_name text, unit_price numeric, quantity integer
  )
  where nullif(trim(item.product_id), '') is not null
    and nullif(trim(item.product_name), '') is not null
    and item.unit_price > 0
    and item.quantity between 1 and 20;

  if item_count <> jsonb_array_length(p_items) or distinct_product_count <> item_count then
    raise exception 'One or more order items are invalid or duplicated.';
  end if;
  if order_subtotal < min_order_value then
    raise exception 'The order does not meet the restaurant minimum order value.';
  end if;
  if free_delivery_above > 0 and order_subtotal >= free_delivery_above then
    delivery_fee := 0;
  end if;

  generated_order_number := 'BB-' || to_char(now(), 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (
    user_id, address_id, order_number, customer_name_snapshot, customer_phone_snapshot,
    customer_email_snapshot, shipping_address, subtotal, delivery_fee, discount, total_amount,
    payment_method, payment_status, order_status, idempotency_key, request_hash
  ) values (
    p_user_id, p_address_id, generated_order_number, trim(p_customer_name), trim(p_customer_phone),
    nullif(trim(p_customer_email), ''), p_shipping_address, order_subtotal, delivery_fee, 0,
    order_subtotal + delivery_fee, p_payment_method,
    case when p_payment_method = 'cod' then 'cod' else 'pending' end, 'received',
    p_idempotency_key, p_request_hash
  )
  on conflict (user_id, idempotency_key) do nothing
  returning * into created_order;

  if not found then
    select * into created_order
    from public.orders
    where user_id = p_user_id and idempotency_key = p_idempotency_key;
    if not found then
      raise exception 'Order retry could not be resolved. Retry using the same idempotency key.';
    end if;
    if created_order.request_hash is distinct from p_request_hash then
      raise exception using
        errcode = '22023',
        message = 'Idempotency key has already been used with a different order request.';
    end if;
    return (to_jsonb(created_order) - 'idempotency_key' - 'request_hash')
      || jsonb_build_object(
        'order_items',
        coalesce(
          (select jsonb_agg(to_jsonb(order_item) order by order_item.created_at, order_item.id)
           from public.order_items as order_item where order_item.order_id = created_order.id),
          '[]'::jsonb
        )
      );
  end if;

  generated_order_id := created_order.id;
  insert into public.order_items (
    order_id, product_id, product_name, unit_price, quantity, line_total
  )
  select generated_order_id, null, item.product_name, item.unit_price, item.quantity,
    item.unit_price * item.quantity
  from jsonb_to_recordset(p_items) as item(
    product_id text, product_name text, unit_price numeric, quantity integer
  );

  return (to_jsonb(created_order) - 'idempotency_key' - 'request_hash')
    || jsonb_build_object(
      'order_items',
      coalesce(
        (select jsonb_agg(to_jsonb(order_item) order by order_item.created_at, order_item.id)
         from public.order_items as order_item where order_item.order_id = generated_order_id),
        '[]'::jsonb
      )
    );
end;
$$;

revoke all on function public.create_code_menu_order(
  uuid, uuid, text, text, text, jsonb, jsonb, text, numeric, numeric, numeric
) from service_role;
revoke all on function public.create_code_menu_order(
  uuid, uuid, text, text, text, jsonb, jsonb, text, uuid, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.create_code_menu_order(
  uuid, uuid, text, text, text, jsonb, jsonb, text, uuid, text, timestamptz
) to service_role;

notify pgrst, 'reload schema';
