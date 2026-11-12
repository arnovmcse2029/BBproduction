-- Additive restaurant catalog and commerce schema.
-- Existing rows are preserved; the initial catalog is inserted only when its IDs are absent.
-- To authorize an admin after their Auth user exists, run separately in SQL Editor:
-- insert into public.restaurant_admins (user_id)
-- select id from auth.users where email = 'admin@example.com'
-- on conflict (user_id) do nothing;

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

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  long_description text,
  price numeric(10, 2) not null check (price > 0),
  category_id text not null references public.categories (id) on update cascade on delete restrict,
  image_url text,
  is_veg boolean not null default false,
  is_available boolean not null default true,
  is_bestseller boolean not null default false,
  serves text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_available_idx on public.products (is_available);

insert into public.categories (id, name) values
  ('chicken-biriyani', 'Chicken Biriyani'),
  ('mutton-biriyani', 'Mutton Biriyani'),
  ('chicken-chaap', 'Chicken Chaap'),
  ('combos', 'Combos'),
  ('special', 'Special Items'),
  ('beverages', 'Beverages')
on conflict (id) do nothing;

insert into public.products (
  id, name, description, long_description, price, category_id, image_url,
  is_veg, is_available, is_bestseller, serves
) values
  ('kolkata-chicken-biriyani', 'Kolkata Chicken Biriyani', 'Fragrant long-grain rice, tender chicken, the signature potato and a boiled egg.', 'Our house classic, slow-cooked on dum in the Kolkata tradition. Aged basmati is layered with marinated chicken, a golden potato and a boiled egg, then perfumed with kewra, rose water and a whisper of saffron.', 249, 'chicken-biriyani', '/images/chicken-biriyani.png', false, true, true, 'Serves 1'),
  ('hyderabadi-chicken-dum-biriyani', 'Hyderabadi Chicken Dum Biriyani', 'Kacchi-style dum biriyani with fried onions, mint and warming spices.', 'Raw-marinated chicken and half-cooked rice sealed together and cooked on dum, so every grain absorbs the spice. Finished with crisp birista, fresh mint and coriander.', 279, 'chicken-biriyani', '/images/hyderabadi-biriyani.png', false, true, true, 'Serves 1'),
  ('chicken-handi-biriyani', 'Chicken Handi Biriyani', 'Served in a copper handi with green peas, fresh coriander and rich masala.', 'Cooked and served in a traditional handi, this biriyani is richer and more masala-forward, with green peas and plenty of fresh coriander.', 329, 'chicken-biriyani', '/images/handi-biriyani.png', false, true, false, 'Serves 1–2'),
  ('kolkata-mutton-biriyani', 'Kolkata Mutton Biriyani', 'Melt-in-the-mouth mutton, aloo and egg with mild, aromatic spices.', 'Tender goat meat slow-cooked until it falls off the bone, layered with fragrant rice, potato and egg. Mild, aromatic and deeply satisfying.', 349, 'mutton-biriyani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80', false, true, true, 'Serves 1'),
  ('mutton-dum-biriyani', 'Mutton Dum Biriyani', 'Bone-in mutton sealed and slow-cooked on dum for a richer finish.', null, 379, 'mutton-biriyani', '/images/lucknowi-biriyani.jpg', false, false, false, 'Serves 1'),
  ('chicken-chaap', 'Chicken Chaap', 'Bengali-style chicken simmered in a rich, nutty, mildly sweet gravy.', 'The perfect partner to biriyani. Chicken slow-cooked in a velvety gravy of poppy seed, cashew, yoghurt and ghee, with a gentle sweetness true to old Kolkata.', 199, 'chicken-chaap', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80', false, true, true, '2 pieces'),
  ('chicken-rezala', 'Chicken Rezala', 'A delicate white curry of yoghurt, cashew and green chilli.', null, 229, 'chicken-chaap', 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=900&q=80', false, true, false, '2 pieces'),
  ('babu-special-combo', 'Babu Special Combo', 'Kolkata Chicken Biriyani with one plate of Chicken Chaap.', 'Our most-loved pairing on one order: a full plate of Kolkata Chicken Biriyani with a plate of Chicken Chaap.', 429, 'combos', '/images/chicken-biriyani.png', false, true, true, 'Serves 1–2'),
  ('family-feast', 'Family Feast', 'Two Chicken Handi Biriyani, two Chicken Chaap and two Firni.', null, 1199, 'combos', '/images/handi-biriyani.png', false, true, false, 'Serves 3–4'),
  ('lucknowi-subz-biriyani', 'Lucknowi Subz Biriyani', 'Awadhi-style vegetable biriyani with cauliflower, carrot, peas and mint.', 'Delicately spiced in the Awadhi way, with seasonal vegetables, fresh mint and coriander. Served with cooling raita.', 229, 'special', '/images/lucknowi-biriyani.jpg', true, true, false, 'Serves 1'),
  ('egg-biriyani', 'Egg Biriyani', 'Fragrant biriyani rice with two masala-fried eggs and potato.', null, 179, 'special', '/images/lucknowi-biriyani.jpg', false, true, false, 'Serves 1'),
  ('firni', 'Firni', 'Chilled ground-rice pudding with cardamom and pistachio.', null, 79, 'special', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80', true, true, false, null),
  ('mango-lassi', 'Mango Lassi', 'Thick, chilled yoghurt drink blended with ripe mango.', null, 89, 'beverages', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80', true, true, false, null),
  ('masala-chaas', 'Masala Chaas', 'Spiced buttermilk with roasted cumin and mint.', null, 59, 'beverages', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80', true, true, false, null)
on conflict (id) do nothing;

create table if not exists public.restaurant_settings (
  id boolean primary key default true check (id),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.restaurant_settings (id, config) values (
  true,
  jsonb_build_object(
    'isOpen', true,
    'acceptingOrders', true,
    'codEnabled', true,
    'deliveryFee', 40,
    'freeDeliveryAbove', 0,
    'minOrderValue', 0,
    'estimatedDeliveryMins', 45,
    'phone', '',
    'email', '',
    'address', '',
    'hours', jsonb_build_array(
      jsonb_build_object('day', 'Monday', 'open', '11:30', 'close', '23:00', 'closed', false),
      jsonb_build_object('day', 'Tuesday', 'open', '11:30', 'close', '23:00', 'closed', false),
      jsonb_build_object('day', 'Wednesday', 'open', '11:30', 'close', '23:00', 'closed', false),
      jsonb_build_object('day', 'Thursday', 'open', '11:30', 'close', '23:00', 'closed', false),
      jsonb_build_object('day', 'Friday', 'open', '11:30', 'close', '23:00', 'closed', false),
      jsonb_build_object('day', 'Saturday', 'open', '11:30', 'close', '23:00', 'closed', false),
      jsonb_build_object('day', 'Sunday', 'open', '11:30', 'close', '23:00', 'closed', false)
    ),
    'offers', jsonb_build_array(
      jsonb_build_object('id', 'offer-combo', 'title', 'Try the Babu Special Combo', 'description', 'Biriyani and Chicken Chaap together in one order.', 'active', true)
    ),
    'social', jsonb_build_object('instagram', '', 'facebook', '', 'youtube', '')
  )
) on conflict (id) do nothing;

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

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders (order_status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text references public.products (id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null check (unit_price > 0),
  quantity integer not null check (quantity between 1 and 20),
  line_total numeric(10, 2) not null check (line_total = unit_price * quantity),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete restrict,
  gateway text not null,
  transaction_reference text,
  amount numeric(10, 2) not null check (amount >= 0),
  payment_status text not null check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists payments_user_created_idx on public.payments (user_id, created_at desc);
create unique index if not exists payments_gateway_reference_idx
  on public.payments (gateway, transaction_reference) where transaction_reference is not null;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null default '' check (char_length(review_text) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists reviews_product_created_idx on public.reviews (product_id, created_at desc);

create or replace function public.create_customer_order(
  p_address_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_payment_method text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  item_count integer;
  matched_count integer;
  order_subtotal numeric(10, 2);
  fee numeric(10, 2);
  free_threshold numeric(10, 2);
  minimum_order numeric(10, 2);
  order_total numeric(10, 2);
  restaurant_config jsonb;
  generated_order_number text;
  generated_order_id uuid;
  created_order public.orders%rowtype;
begin
  if current_user_id is null then
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

  if not exists (
    select 1 from public.addresses
    where id = p_address_id and user_id = current_user_id
  ) then
    raise exception 'Select one of your saved addresses to place this order.';
  end if;

  select restaurant_settings.config into restaurant_config
  from public.restaurant_settings where id = true;
  restaurant_config := coalesce(restaurant_config, '{"acceptingOrders":true,"codEnabled":true,"deliveryFee":40,"freeDeliveryAbove":0,"minOrderValue":0}'::jsonb);
  if coalesce((restaurant_config ->> 'acceptingOrders')::boolean, true) is false then
    raise exception 'The restaurant is not accepting orders right now.';
  end if;
  if p_payment_method = 'cod' and coalesce((restaurant_config ->> 'codEnabled')::boolean, true) is false then
    raise exception 'Cash on delivery is currently unavailable.';
  end if;

  perform product.id
  from jsonb_to_recordset(p_items) as request(product_id text, quantity integer)
  join public.products as product on product.id = request.product_id
  where product.is_available and request.quantity between 1 and 20
  for share of product;

  select count(*), coalesce(sum(product.price * request.quantity), 0)
    into matched_count, order_subtotal
  from jsonb_to_recordset(p_items) as request(product_id text, quantity integer)
  join public.products as product on product.id = request.product_id
  where product.is_available and request.quantity between 1 and 20;

  select jsonb_array_length(p_items) into item_count;
  if matched_count <> item_count then
    raise exception 'One or more products are unavailable or have an invalid quantity. Refresh your cart and try again.';
  end if;

  fee := greatest(coalesce((restaurant_config ->> 'deliveryFee')::numeric, 40), 0);
  free_threshold := greatest(coalesce((restaurant_config ->> 'freeDeliveryAbove')::numeric, 0), 0);
  minimum_order := greatest(coalesce((restaurant_config ->> 'minOrderValue')::numeric, 0), 0);
  if order_subtotal < minimum_order then
    raise exception 'The order does not meet the restaurant minimum order value.';
  end if;
  if free_threshold > 0 and order_subtotal >= free_threshold then
    fee := 0;
  end if;
  order_total := order_subtotal + fee;
  generated_order_number := 'BB-' || to_char(now(), 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (
    user_id, address_id, order_number, customer_name_snapshot, customer_phone_snapshot,
    customer_email_snapshot, shipping_address, subtotal, delivery_fee, discount, total_amount,
    payment_method, payment_status, order_status
  ) values (
    current_user_id, p_address_id, generated_order_number, trim(p_customer_name), trim(p_customer_phone),
    nullif(trim(p_customer_email), ''), p_shipping_address, order_subtotal, fee, 0, order_total,
    p_payment_method, case when p_payment_method = 'cod' then 'cod' else 'pending' end, 'received'
  ) returning * into created_order;
  generated_order_id := created_order.id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
  select generated_order_id, product.id, product.name, product.price, request.quantity,
    product.price * request.quantity
  from jsonb_to_recordset(p_items) as request(product_id text, quantity integer)
  join public.products as product on product.id = request.product_id
  where product.is_available and request.quantity between 1 and 20;

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

revoke all on function public.create_customer_order(uuid, text, text, text, jsonb, jsonb, text) from public, anon;
grant execute on function public.create_customer_order(uuid, text, text, text, jsonb, jsonb, text) to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_public_read') then
    create policy categories_public_read on public.categories for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_admin_manage') then
    create policy categories_admin_manage on public.categories for all to authenticated
      using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_admin_insert_guard') then
    create policy categories_admin_insert_guard on public.categories as restrictive for insert to authenticated with check (public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_admin_update_guard') then
    create policy categories_admin_update_guard on public.categories as restrictive for update to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_admin_delete_guard') then
    create policy categories_admin_delete_guard on public.categories as restrictive for delete to authenticated using (public.is_restaurant_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'products_public_read') then
    create policy products_public_read on public.products for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'products_admin_manage') then
    create policy products_admin_manage on public.products for all to authenticated
      using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'products_admin_insert_guard') then
    create policy products_admin_insert_guard on public.products as restrictive for insert to authenticated with check (public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'products_admin_update_guard') then
    create policy products_admin_update_guard on public.products as restrictive for update to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'products_admin_delete_guard') then
    create policy products_admin_delete_guard on public.products as restrictive for delete to authenticated using (public.is_restaurant_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'restaurant_settings' and policyname = 'restaurant_settings_public_read') then
    create policy restaurant_settings_public_read on public.restaurant_settings for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'restaurant_settings' and policyname = 'restaurant_settings_admin_manage') then
    create policy restaurant_settings_admin_manage on public.restaurant_settings for all to authenticated
      using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'restaurant_settings' and policyname = 'restaurant_settings_admin_write_guard') then
    create policy restaurant_settings_admin_write_guard on public.restaurant_settings as restrictive for insert to authenticated with check (public.is_restaurant_admin());
    create policy restaurant_settings_admin_update_guard on public.restaurant_settings as restrictive for update to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
    create policy restaurant_settings_admin_delete_guard on public.restaurant_settings as restrictive for delete to authenticated using (public.is_restaurant_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_customer_or_admin_read') then
    create policy orders_customer_or_admin_read on public.orders for select to authenticated
      using (auth.uid() = user_id or public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_admin_update') then
    create policy orders_admin_update on public.orders for update to authenticated
      using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_read_guard') then
    create policy orders_read_guard on public.orders as restrictive for select to authenticated
      using (auth.uid() = user_id or public.is_restaurant_admin());
    create policy orders_update_guard on public.orders as restrictive for update to authenticated
      using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
    create policy orders_insert_guard on public.orders as restrictive for insert to authenticated
      with check (false);
    create policy orders_delete_guard on public.orders as restrictive for delete to authenticated
      using (false);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_anon_deny') then
    create policy orders_anon_deny on public.orders as restrictive for all to anon
      using (false) with check (false);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_items' and policyname = 'order_items_customer_or_admin_read') then
    create policy order_items_customer_or_admin_read on public.order_items for select to authenticated
      using (exists (
        select 1 from public.orders
        where orders.id = order_items.order_id
          and (orders.user_id = auth.uid() or public.is_restaurant_admin())
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_items' and policyname = 'order_items_read_guard') then
    create policy order_items_read_guard on public.order_items as restrictive for select to authenticated
      using (exists (
        select 1 from public.orders
        where orders.id = order_items.order_id
          and (orders.user_id = auth.uid() or public.is_restaurant_admin())
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_items' and policyname = 'order_items_insert_guard') then
    create policy order_items_insert_guard on public.order_items as restrictive for insert to authenticated
      with check (false);
    create policy order_items_update_guard on public.order_items as restrictive for update to authenticated
      using (false) with check (false);
    create policy order_items_delete_guard on public.order_items as restrictive for delete to authenticated
      using (false);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'order_items' and policyname = 'order_items_anon_deny') then
    create policy order_items_anon_deny on public.order_items as restrictive for all to anon
      using (false) with check (false);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_customer_or_admin_read') then
    create policy payments_customer_or_admin_read on public.payments for select to authenticated
      using (user_id = auth.uid() or public.is_restaurant_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_read_guard') then
    create policy payments_read_guard on public.payments as restrictive for select to authenticated
      using (user_id = auth.uid() or public.is_restaurant_admin());
    create policy payments_insert_guard on public.payments as restrictive for insert to authenticated
      with check (false);
    create policy payments_update_guard on public.payments as restrictive for update to authenticated
      using (false) with check (false);
    create policy payments_delete_guard on public.payments as restrictive for delete to authenticated
      using (false);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_anon_deny') then
    create policy payments_anon_deny on public.payments as restrictive for all to anon
      using (false) with check (false);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_public_read') then
    create policy reviews_public_read on public.reviews for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_insert_own') then
    create policy reviews_insert_own on public.reviews for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_update_own') then
    create policy reviews_update_own on public.reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_delete_own') then
    create policy reviews_delete_own on public.reviews for delete to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_insert_owner_guard') then
    create policy reviews_insert_owner_guard on public.reviews as restrictive for insert to authenticated
      with check (auth.uid() = user_id);
    create policy reviews_update_owner_guard on public.reviews as restrictive for update to authenticated
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
    create policy reviews_delete_owner_guard on public.reviews as restrictive for delete to authenticated
      using (auth.uid() = user_id);
  end if;
end;
$$;

revoke all on public.categories, public.products, public.restaurant_settings from anon;
revoke insert, update, delete, truncate, references, trigger on public.categories, public.products, public.restaurant_settings from anon;
grant select on public.categories, public.products, public.restaurant_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.restaurant_settings to authenticated;

revoke all on public.orders, public.order_items, public.payments, public.reviews from anon;
revoke insert, update, delete, truncate, references, trigger on public.orders, public.order_items, public.payments, public.reviews from anon, authenticated;
grant select on public.orders, public.order_items, public.payments, public.reviews to authenticated;
grant update (order_status) on public.orders to authenticated;
grant insert, update, delete on public.reviews to authenticated;

notify pgrst, 'reload schema';
