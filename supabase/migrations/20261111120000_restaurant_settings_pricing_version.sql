-- Checkout uses updated_at as a version for the order-pricing settings.
do $$
begin
  if exists (
    select 1
    from public.restaurant_settings
    where not case
      when jsonb_typeof(config -> 'deliveryFee') = 'number'
        and jsonb_typeof(config -> 'freeDeliveryAbove') = 'number'
        and jsonb_typeof(config -> 'minOrderValue') = 'number'
      then
        (config ->> 'deliveryFee')::numeric between 0 and 99999999.99
        and (config ->> 'freeDeliveryAbove')::numeric between 0 and 99999999.99
        and (config ->> 'minOrderValue')::numeric between 0 and 99999999.99
        and pg_catalog.scale((config ->> 'deliveryFee')::numeric) <= 2
        and pg_catalog.scale((config ->> 'freeDeliveryAbove')::numeric) <= 2
        and pg_catalog.scale((config ->> 'minOrderValue')::numeric) <= 2
      else false
    end
  ) then
    raise exception 'Restaurant pricing settings must be valid amounts with at most two decimal places before this migration can be applied.';
  end if;
end;
$$;

create or replace function public.update_restaurant_settings_pricing_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  delivery_fee numeric;
  free_delivery_above numeric;
  min_order_value numeric;
  changed_at timestamptz;
begin
  if jsonb_typeof(new.config) is distinct from 'object'
    or jsonb_typeof(new.config -> 'deliveryFee') is distinct from 'number'
    or jsonb_typeof(new.config -> 'freeDeliveryAbove') is distinct from 'number'
    or jsonb_typeof(new.config -> 'minOrderValue') is distinct from 'number'
  then
    raise exception 'Restaurant pricing settings must contain valid numeric amounts.';
  end if;

  delivery_fee := (new.config ->> 'deliveryFee')::numeric;
  free_delivery_above := (new.config ->> 'freeDeliveryAbove')::numeric;
  min_order_value := (new.config ->> 'minOrderValue')::numeric;
  if delivery_fee not between 0 and 99999999.99
    or free_delivery_above not between 0 and 99999999.99
    or min_order_value not between 0 and 99999999.99
    or pg_catalog.scale(delivery_fee) > 2
    or pg_catalog.scale(free_delivery_above) > 2
    or pg_catalog.scale(min_order_value) > 2
  then
    raise exception 'Restaurant pricing settings must be valid amounts with at most two decimal places.';
  end if;

  if tg_op = 'UPDATE' then
    new.updated_at := old.updated_at;
    if (new.config -> 'isOpen') is distinct from (old.config -> 'isOpen')
      or (new.config -> 'acceptingOrders') is distinct from (old.config -> 'acceptingOrders')
      or (new.config -> 'codEnabled') is distinct from (old.config -> 'codEnabled')
      or (new.config -> 'deliveryFee') is distinct from (old.config -> 'deliveryFee')
      or (new.config -> 'freeDeliveryAbove') is distinct from (old.config -> 'freeDeliveryAbove')
      or (new.config -> 'minOrderValue') is distinct from (old.config -> 'minOrderValue')
    then
      changed_at := pg_catalog.clock_timestamp();
      if changed_at <= old.updated_at then
        changed_at := old.updated_at + interval '1 microsecond';
      end if;
      new.updated_at := changed_at;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.update_restaurant_settings_pricing_version()
  from public, anon, authenticated, service_role;

drop trigger if exists restaurant_settings_pricing_version on public.restaurant_settings;
create trigger restaurant_settings_pricing_version
  before insert or update on public.restaurant_settings
  for each row execute function public.update_restaurant_settings_pricing_version();
