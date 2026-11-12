-- SQL Editor installer for customer profiles and addresses.
-- Safe to re-run. Existing profile rows and legacy JSON addresses are retained.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  avatar_url text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  mobile text not null default '',
  addresses jsonb not null default '[]'::jsonb,
  default_address_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists avatar_url text not null default '';
alter table public.profiles add column if not exists first_name text not null default '';
alter table public.profiles add column if not exists last_name text not null default '';
alter table public.profiles add column if not exists mobile text not null default '';
alter table public.profiles add column if not exists addresses jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists default_address_id text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

update public.profiles as profile
set
  phone = coalesce(nullif(profile.phone, ''), nullif(profile.mobile, ''), ''),
  email = coalesce(nullif(profile.email, ''), auth_user.email, ''),
  avatar_url = coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(auth_user.raw_user_meta_data ->> 'picture', ''),
    profile.avatar_url,
    ''
  ),
  full_name = coalesce(
    nullif(profile.full_name, ''),
    nullif(concat_ws(' ', nullif(profile.first_name, ''), nullif(profile.last_name, '')), ''),
    nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
    nullif(auth_user.raw_user_meta_data ->> 'name', ''),
    ''
  ),
  first_name = coalesce(
    nullif(profile.first_name, ''),
    nullif(auth_user.raw_user_meta_data ->> 'first_name', ''),
    nullif(auth_user.raw_user_meta_data ->> 'given_name', ''),
    ''
  ),
  last_name = coalesce(
    nullif(profile.last_name, ''),
    nullif(auth_user.raw_user_meta_data ->> 'last_name', ''),
    nullif(auth_user.raw_user_meta_data ->> 'family_name', ''),
    ''
  )
from auth.users as auth_user
where auth_user.id = profile.id;

insert into public.profiles (id, full_name, email, phone, avatar_url, first_name, last_name, mobile)
select
  auth_user.id,
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'full_name', ''),
    nullif(auth_user.raw_user_meta_data ->> 'name', ''),
    concat_ws(
      ' ',
      nullif(auth_user.raw_user_meta_data ->> 'first_name', ''),
      nullif(auth_user.raw_user_meta_data ->> 'last_name', '')
    ),
    ''
  ),
  coalesce(auth_user.email, ''),
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'phone', ''),
    nullif(auth_user.raw_user_meta_data ->> 'mobile', ''),
    ''
  ),
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(auth_user.raw_user_meta_data ->> 'picture', ''),
    ''
  ),
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'first_name', ''),
    nullif(auth_user.raw_user_meta_data ->> 'given_name', ''),
    ''
  ),
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'last_name', ''),
    nullif(auth_user.raw_user_meta_data ->> 'family_name', ''),
    ''
  ),
  coalesce(
    nullif(auth_user.raw_user_meta_data ->> 'phone', ''),
    nullif(auth_user.raw_user_meta_data ->> 'mobile', ''),
    ''
  )
from auth.users as auth_user
on conflict (id) do nothing;

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  house_building text not null check (length(trim(house_building)) > 0),
  street text not null check (length(trim(street)) > 0),
  locality text not null check (length(trim(locality)) > 0),
  landmark text,
  city text not null check (length(trim(city)) > 0),
  state text not null check (length(trim(state)) > 0),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  address_type text not null default 'Home' check (address_type in ('Home', 'Work', 'Other')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);

-- Import valid legacy registration/profile addresses without deleting their JSON source.
insert into public.addresses (
  user_id, house_building, street, locality, landmark, city, state, pincode, address_type, is_default
)
select
  profile.id,
  coalesce(nullif(trim(address.value ->> 'house_building'), ''), nullif(trim(address.value ->> 'house'), ''), ''),
  coalesce(nullif(trim(address.value ->> 'street'), ''), ''),
  coalesce(nullif(trim(address.value ->> 'locality'), ''), ''),
  nullif(trim(address.value ->> 'landmark'), ''),
  coalesce(nullif(trim(address.value ->> 'city'), ''), ''),
  coalesce(nullif(trim(address.value ->> 'state'), ''), ''),
  trim(address.value ->> 'pincode'),
  case
    when address.value ->> 'address_type' in ('Home', 'Work', 'Other') then address.value ->> 'address_type'
    when address.value ->> 'addressType' in ('Home', 'Work', 'Other') then address.value ->> 'addressType'
    else 'Home'
  end,
  false
from public.profiles as profile
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(profile.addresses) = 'array' then profile.addresses else '[]'::jsonb end
) as address(value)
where coalesce(nullif(trim(address.value ->> 'house_building'), ''), nullif(trim(address.value ->> 'house'), ''), '') <> ''
  and coalesce(nullif(trim(address.value ->> 'street'), ''), '') <> ''
  and coalesce(nullif(trim(address.value ->> 'locality'), ''), '') <> ''
  and coalesce(nullif(trim(address.value ->> 'city'), ''), '') <> ''
  and coalesce(nullif(trim(address.value ->> 'state'), ''), '') <> ''
  and coalesce(trim(address.value ->> 'pincode'), '') ~ '^[1-9][0-9]{5}$'
  and not exists (
    select 1
    from public.addresses as saved
    where saved.user_id = profile.id
      and saved.house_building = coalesce(nullif(trim(address.value ->> 'house_building'), ''), nullif(trim(address.value ->> 'house'), ''), '')
      and saved.street = coalesce(nullif(trim(address.value ->> 'street'), ''), '')
      and saved.locality = coalesce(nullif(trim(address.value ->> 'locality'), ''), '')
      and saved.city = coalesce(nullif(trim(address.value ->> 'city'), ''), '')
      and saved.state = coalesce(nullif(trim(address.value ->> 'state'), ''), '')
      and saved.pincode = trim(address.value ->> 'pincode')
  );

with ranked_addresses as (
  select id, row_number() over (
    partition by user_id order by is_default desc, created_at, id
  ) as position
  from public.addresses
)
update public.addresses as address
set is_default = (ranked_addresses.position = 1)
from ranked_addresses
where address.id = ranked_addresses.id
  and address.is_default is distinct from (ranked_addresses.position = 1);

create unique index if not exists addresses_one_default_per_user_idx
  on public.addresses (user_id) where is_default;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create or replace function public.promote_default_customer_address()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.is_default then
    update public.addresses
    set is_default = true, updated_at = now()
    where id = (
      select id
      from public.addresses
      where user_id = old.user_id
      order by created_at, id
      limit 1
    );
  end if;
  return old;
end;
$$;

revoke all on function public.promote_default_customer_address() from public, anon, authenticated;
drop trigger if exists promote_default_customer_address_after_delete on public.addresses;
create trigger promote_default_customer_address_after_delete
  after delete on public.addresses
  for each row execute function public.promote_default_customer_address();

create or replace function public.set_customer_default_address(p_address_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'An authenticated user is required.';
  end if;

  update public.addresses set is_default = false
  where user_id = auth.uid() and is_default;

  update public.addresses set is_default = true, updated_at = now()
  where id = p_address_id and user_id = auth.uid();

  if not found then
    raise exception 'The requested address does not belong to the authenticated user.';
  end if;
end;
$$;

create or replace function public.handle_new_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_name text;
  address_value jsonb;
begin
  customer_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    concat_ws(
      ' ',
      nullif(new.raw_user_meta_data ->> 'first_name', ''),
      nullif(new.raw_user_meta_data ->> 'last_name', '')
    ),
    ''
  );

  insert into public.profiles (id, full_name, email, phone, avatar_url, first_name, last_name, mobile)
  values (
    new.id,
    customer_name,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), nullif(new.raw_user_meta_data ->> 'mobile', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_url', ''), nullif(new.raw_user_meta_data ->> 'picture', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), nullif(new.raw_user_meta_data ->> 'given_name', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'last_name', ''), nullif(new.raw_user_meta_data ->> 'family_name', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), nullif(new.raw_user_meta_data ->> 'mobile', ''), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.profiles.avatar_url),
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    first_name = coalesce(nullif(public.profiles.first_name, ''), excluded.first_name),
    last_name = coalesce(nullif(public.profiles.last_name, ''), excluded.last_name),
    phone = coalesce(nullif(public.profiles.phone, ''), excluded.phone),
    mobile = coalesce(nullif(public.profiles.mobile, ''), excluded.mobile);

  if jsonb_typeof(new.raw_user_meta_data -> 'addresses') = 'array' then
    for address_value in
      select value from jsonb_array_elements(new.raw_user_meta_data -> 'addresses')
    loop
      if coalesce(nullif(trim(address_value ->> 'house'), ''), '') <> ''
        and coalesce(nullif(trim(address_value ->> 'street'), ''), '') <> ''
        and coalesce(nullif(trim(address_value ->> 'locality'), ''), '') <> ''
        and coalesce(nullif(trim(address_value ->> 'city'), ''), '') <> ''
        and coalesce(nullif(trim(address_value ->> 'state'), ''), '') <> ''
        and coalesce(trim(address_value ->> 'pincode'), '') ~ '^[1-9][0-9]{5}$'
      then
        insert into public.addresses (
          user_id, house_building, street, locality, landmark, city, state, pincode, address_type, is_default
        )
        select
          new.id,
          trim(address_value ->> 'house'),
          trim(address_value ->> 'street'),
          trim(address_value ->> 'locality'),
          nullif(trim(address_value ->> 'landmark'), ''),
          trim(address_value ->> 'city'),
          trim(address_value ->> 'state'),
          trim(address_value ->> 'pincode'),
          case when address_value ->> 'addressType' in ('Home', 'Work', 'Other')
            then address_value ->> 'addressType' else 'Home' end,
          not exists (select 1 from public.addresses where user_id = new.id and is_default)
        where not exists (
          select 1 from public.addresses
          where user_id = new.id
            and house_building = address_value ->> 'house'
            and street = address_value ->> 'street'
            and locality = address_value ->> 'locality'
            and pincode = address_value ->> 'pincode'
        );
      end if;
    end loop;
  end if;

  return new;
end;
$$;

create or replace function public.ensure_customer_profile()
returns setof public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_auth_user auth.users%rowtype;
  metadata jsonb;
  customer_name text;
begin
  select * into current_auth_user
  from auth.users
  where id = auth.uid();

  if not found then
    raise exception 'An authenticated user is required to retrieve a customer profile.';
  end if;

  metadata := coalesce(current_auth_user.raw_user_meta_data, '{}'::jsonb);
  customer_name := coalesce(
    nullif(metadata ->> 'full_name', ''),
    nullif(metadata ->> 'name', ''),
    concat_ws(' ', nullif(metadata ->> 'first_name', ''), nullif(metadata ->> 'last_name', '')),
    ''
  );

  insert into public.profiles (id, full_name, email, phone, avatar_url, first_name, last_name, mobile)
  values (
    current_auth_user.id,
    customer_name,
    coalesce(current_auth_user.email, ''),
    coalesce(nullif(metadata ->> 'phone', ''), nullif(metadata ->> 'mobile', ''), ''),
    coalesce(nullif(metadata ->> 'avatar_url', ''), nullif(metadata ->> 'picture', ''), ''),
    coalesce(nullif(metadata ->> 'first_name', ''), nullif(metadata ->> 'given_name', ''), ''),
    coalesce(nullif(metadata ->> 'last_name', ''), nullif(metadata ->> 'family_name', ''), ''),
    coalesce(nullif(metadata ->> 'phone', ''), nullif(metadata ->> 'mobile', ''), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.profiles.avatar_url),
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    first_name = coalesce(nullif(public.profiles.first_name, ''), excluded.first_name),
    last_name = coalesce(nullif(public.profiles.last_name, ''), excluded.last_name),
    phone = coalesce(nullif(public.profiles.phone, ''), excluded.phone),
    mobile = coalesce(nullif(public.profiles.mobile, ''), excluded.mobile);

  return query select profile.* from public.profiles as profile where profile.id = auth.uid();
end;
$$;

revoke all on function public.handle_new_customer_profile() from public, anon, authenticated;
revoke all on function public.ensure_customer_profile() from public, anon;
grant execute on function public.ensure_customer_profile() to authenticated;
revoke all on function public.set_customer_default_address(uuid) from public, anon;
grant execute on function public.set_customer_default_address(uuid) to authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_customer_profile();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own') then
    create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own') then
    create policy profiles_update_own on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_authenticated_own_guard') then
    create policy profiles_authenticated_own_guard on public.profiles as restrictive for all to authenticated
      using (auth.uid() = id) with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_anon_deny') then
    create policy profiles_anon_deny on public.profiles as restrictive for all to anon
      using (false) with check (false);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'addresses' and policyname = 'addresses_select_own') then
    create policy addresses_select_own on public.addresses for select to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'addresses' and policyname = 'addresses_insert_own') then
    create policy addresses_insert_own on public.addresses for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'addresses' and policyname = 'addresses_update_own') then
    create policy addresses_update_own on public.addresses for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'addresses' and policyname = 'addresses_delete_own') then
    create policy addresses_delete_own on public.addresses for delete to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'addresses' and policyname = 'addresses_authenticated_own_guard') then
    create policy addresses_authenticated_own_guard on public.addresses as restrictive for all to authenticated
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'addresses' and policyname = 'addresses_anon_deny') then
    create policy addresses_anon_deny on public.addresses as restrictive for all to anon
      using (false) with check (false);
  end if;
end;
$$;

revoke all on public.profiles from anon;
revoke all on public.addresses from anon;
revoke insert, delete, truncate, references, trigger on public.profiles from authenticated;
revoke update on public.profiles from authenticated;
revoke update (email, avatar_url, addresses, default_address_id, created_at)
  on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, first_name, last_name, mobile)
  on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;

notify pgrst, 'reload schema';
