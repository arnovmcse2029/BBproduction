import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "..",
    "supabase",
    "migrations",
    "20261112100000_profile_address_privilege_reconciliation.sql",
  ),
  "utf8",
);
const installer = readFileSync(resolve(process.cwd(), "..", "supabase", "profiles.sql"), "utf8");
const baseMigration = readFileSync(
  resolve(
    process.cwd(),
    "..",
    "supabase",
    "migrations",
    "20261110130000_customer_profiles_addresses.sql",
  ),
  "utf8",
);
const defaultAddressMigration = readFileSync(
  resolve(
    process.cwd(),
    "..",
    "supabase",
    "migrations",
    "20261112110000_customer_default_address_function.sql",
  ),
  "utf8",
);

describe("profile and address privilege reconciliation contract", () => {
  it("defines the default-address function as security definer with an empty search path", () => {
    expect(defaultAddressMigration).toMatch(
      /create or replace function public\.set_customer_default_address\(p_address_id uuid\)[\s\S]*?security definer[\s\S]*?set search_path\s*=\s*''/i,
    );
  });

  it("clears table and per-column profile grants before granting only approved fields", () => {
    expect(migration).toMatch(
      /revoke all privileges on table public\.profiles from public,\s*anon,\s*authenticated/i,
    );
    expect(migration).toMatch(
      /revoke all privileges \(%i\) on table public\.profiles from public,\s*anon,\s*authenticated/i,
    );
    expect(migration).toMatch(/from pg_catalog\.pg_attribute/i);
    expect(migration).toMatch(/grant select on table public\.profiles to authenticated/i);
    expect(migration).toMatch(
      /grant update\s*\(\s*full_name\s*,\s*phone\s*,\s*avatar_url\s*\)\s*on table public\.profiles to authenticated/i,
    );
    expect(migration).not.toMatch(
      /grant\s+(?:all|insert|delete|truncate|references|trigger|maintain)[^;]*on table public\.profiles to (?:public|anon|authenticated)\b/i,
    );
    expect(migration).not.toMatch(/grant update on table public\.profiles/i);
    expect(migration).toMatch(
      /has_table_privilege\('authenticated', 'public\.profiles', 'update'\)/i,
    );
    expect(migration).toMatch(/has_column_privilege[\s\S]*?column_name[\s\S]*?'update'/i);
    expect(baseMigration).toMatch(
      /create policy profiles_select_own on public\.profiles for select to authenticated using \(auth\.uid\(\) = id\)/i,
    );
    expect(baseMigration).toMatch(
      /create policy profiles_update_own on public\.profiles for update to authenticated using \(auth\.uid\(\) = id\) with check \(auth\.uid\(\) = id\)/i,
    );
  });

  it("removes elevated address privileges while preserving customer CRUD", () => {
    expect(migration).toMatch(
      /revoke all privileges on table public\.addresses from public,\s*anon,\s*authenticated/i,
    );
    expect(migration).toMatch(
      /revoke all privileges \(%i\) on table public\.addresses from public,\s*anon,\s*authenticated/i,
    );
    expect(migration).toMatch(
      /grant select,\s*insert,\s*update,\s*delete on table public\.addresses to authenticated/i,
    );
    expect(migration).not.toMatch(/(?:grant|revoke)\b[^;]*\bservice_role\b/i);
    expect(migration).toMatch(
      /has_table_privilege\('service_role',\s*table_name,\s*privilege_name\)/i,
    );
    expect(migration).toMatch(
      /has_table_privilege\('authenticated', 'public\.addresses', 'truncate'\)/i,
    );
    expect(migration).toMatch(
      /has_table_privilege\('authenticated', 'public\.addresses', 'references'\)/i,
    );
    expect(migration).toMatch(
      /has_table_privilege\('authenticated', 'public\.addresses', 'trigger'\)/i,
    );
    expect(migration).toMatch(
      /has_table_privilege\('authenticated', 'public\.addresses', 'maintain'\)/i,
    );
    expect(migration).toMatch(/has_table_privilege\('anon', table_name, privilege_name\)/i);
    expect(baseMigration).toMatch(
      /create policy addresses_select_own on public\.addresses for select to authenticated using \(auth\.uid\(\) = user_id\)/i,
    );
    expect(baseMigration).toMatch(
      /create policy addresses_insert_own on public\.addresses for insert to authenticated with check \(auth\.uid\(\) = user_id\)/i,
    );
    expect(baseMigration).toMatch(
      /create policy addresses_update_own on public\.addresses for update to authenticated using \(auth\.uid\(\) = user_id\) with check \(auth\.uid\(\) = user_id\)/i,
    );
    expect(baseMigration).toMatch(
      /create policy addresses_delete_own on public\.addresses for delete to authenticated using \(auth\.uid\(\) = user_id\)/i,
    );
  });

  it("restricts direct trigger-function execution without changing triggers or service-role ACLs", () => {
    expect(migration).toMatch(
      /revoke all privileges on function public\.handle_new_customer\(\) from public,\s*anon,\s*authenticated/i,
    );
    expect(migration).toMatch(
      /revoke all privileges on function public\.handle_new_customer_profile\(\) from public,\s*anon,\s*authenticated/i,
    );
    expect(migration).toMatch(
      /revoke all privileges on function public\.ensure_customer_profile\(\) from public,\s*anon/i,
    );
    expect(migration).toMatch(
      /grant execute on function public\.ensure_customer_profile\(\) to authenticated/i,
    );
    expect(migration).toMatch(
      /has_function_privilege\(\s*'anon', 'public\.ensure_customer_profile\(\)', 'execute'\s*\)\s*or not pg_catalog\.has_function_privilege\(\s*'authenticated', 'public\.ensure_customer_profile\(\)', 'execute'/i,
    );
    expect(migration).not.toMatch(/create or replace function|create trigger|drop trigger/i);
    expect(migration).not.toMatch(
      /set_customer_default_address|addresses_one_default_per_user_idx/i,
    );
    expect(migration).not.toMatch(
      /revoke all privileges on function public\.handle_new_customer(?:_profile)?\(\) from [^;]*service_role/i,
    );
    expect(migration).toMatch(/^\s*(?:--[^\n]*\n)*begin;[\s\S]*commit;\s*$/i);
  });

  it("keeps the rerunnable profile installer aligned with the corrected grants", () => {
    expect(installer).toMatch(
      /revoke all privileges on table public\.profiles from public,\s*anon,\s*authenticated/i,
    );
    expect(installer).toMatch(
      /grant update\s*\(\s*full_name\s*,\s*phone\s*,\s*avatar_url\s*\)\s*on public\.profiles to authenticated/i,
    );
    expect(installer).toMatch(
      /revoke truncate,\s*references,\s*trigger,\s*maintain\s+on table public\.addresses from public,\s*anon,\s*authenticated/i,
    );
    expect(installer).toMatch(
      /grant select,\s*insert,\s*update,\s*delete on public\.addresses to authenticated/i,
    );
    expect(installer).toMatch(
      /grant all privileges on public\.profiles,\s*public\.addresses to service_role/i,
    );
  });
});
