-- Persist customer orders without storing a product catalog or restaurant settings.
-- Apply after the customer profile/address migration.

create table if not exists public.restaurant_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.restaurant_admins enable row level security;
revoke all on public.restaurant_admins from anon, authenticated;

create or replace function public.is_restaurant_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.restaurant_admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_restaurant_admin() from public, anon;
grant execute on function public.is_restaurant_admin() to authenticated;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  address_id uuid references public.addresses (id) on delete set null,
  order_number text not null unique,
  customer_name_snapshot text not null,
  customer_phone_snapshot text not null,
  customer_email_snapshot text,
  shipping_address jsonb not null,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  total_amount numeric(10, 2) not null
    check (total_amount >= 0 and discount <= subtotal + delivery_fee and total_amount = subtotal + delivery_fee - discount),
  payment_method text not null check (payment_method in ('online', 'cod')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'cod', 'failed', 'refunded')),
  order_status text not null default 'received' check (order_status in ('received', 'accepted', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price > 0),
  quantity integer not null check (quantity between 1 and 20),
  line_total numeric(10, 2) not null check (line_total = unit_price * quantity),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders (order_status, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'code_menu_orders_read'
  ) then
    create policy code_menu_orders_read on public.orders for select to authenticated
      using (auth.uid() = user_id or public.is_restaurant_admin());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'code_menu_orders_admin_update'
  ) then
    create policy code_menu_orders_admin_update on public.orders for update to authenticated
      using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items' and policyname = 'code_menu_order_items_read'
  ) then
    create policy code_menu_order_items_read on public.order_items for select to authenticated
      using (exists (
        select 1 from public.orders
        where orders.id = order_items.order_id
          and (orders.user_id = auth.uid() or public.is_restaurant_admin())
      ));
  end if;
end;
$$;

revoke all on public.orders, public.order_items from anon;
revoke insert, delete, truncate, references, trigger on public.orders, public.order_items from authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant all on public.orders, public.order_items to service_role;

create or replace function public.create_code_menu_order(
  p_user_id uuid,
  p_address_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_payment_method text,
  p_delivery_fee numeric,
  p_free_delivery_above numeric,
  p_min_order_value numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item_count integer;
  order_subtotal numeric(10, 2);
  fee numeric(10, 2);
  generated_order_number text;
  generated_order_id uuid;
  created_order public.orders%rowtype;
begin
  if p_user_id is null then
    raise exception 'An authenticated user is required to place an order.';
  end if;
  if p_payment_method not in ('online', 'cod') then
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
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'An order must contain between 1 and 50 items.';
  end if;
  if p_delivery_fee < 0 or p_free_delivery_above < 0 or p_min_order_value < 0 then
    raise exception 'Order settings must be non-negative.';
  end if;
  if not exists (
    select 1 from public.addresses
    where id = p_address_id and user_id = p_user_id
  ) then
    raise exception 'Select one of your saved addresses to place this order.';
  end if;

  select count(*), coalesce(sum(item.unit_price * item.quantity), 0)
    into item_count, order_subtotal
  from jsonb_to_recordset(p_items) as item(
    product_id text, product_name text, unit_price numeric, quantity integer
  )
  where nullif(trim(item.product_id), '') is not null
    and nullif(trim(item.product_name), '') is not null
    and item.unit_price > 0
    and item.quantity between 1 and 20;

  if item_count <> jsonb_array_length(p_items) then
    raise exception 'One or more order items are invalid.';
  end if;
  if order_subtotal < p_min_order_value then
    raise exception 'The order does not meet the minimum order value.';
  end if;

  fee := greatest(p_delivery_fee, 0);
  if p_free_delivery_above > 0 and order_subtotal >= p_free_delivery_above then
    fee := 0;
  end if;
  generated_order_number := 'BB-' || to_char(now(), 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (
    user_id, address_id, order_number, customer_name_snapshot, customer_phone_snapshot,
    customer_email_snapshot, shipping_address, subtotal, delivery_fee, discount, total_amount,
    payment_method, payment_status, order_status
  ) values (
    p_user_id, p_address_id, generated_order_number, trim(p_customer_name), trim(p_customer_phone),
    nullif(trim(p_customer_email), ''), p_shipping_address, order_subtotal, fee, 0,
    order_subtotal + fee, p_payment_method,
    case when p_payment_method = 'cod' then 'cod' else 'pending' end, 'received'
  ) returning * into created_order;
  generated_order_id := created_order.id;

  insert into public.order_items (
    order_id, product_id, product_name, unit_price, quantity, line_total
  )
  select
    generated_order_id, null, item.product_name, item.unit_price, item.quantity,
    item.unit_price * item.quantity
  from jsonb_to_recordset(p_items) as item(
    product_id text, product_name text, unit_price numeric, quantity integer
  );

  return to_jsonb(created_order) || jsonb_build_object(
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
) from public, anon, authenticated;
grant execute on function public.create_code_menu_order(
  uuid, uuid, text, text, text, jsonb, jsonb, text, numeric, numeric, numeric
) to service_role;

notify pgrst, 'reload schema';
