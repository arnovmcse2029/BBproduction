import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = (name: string) =>
  readFileSync(resolve(process.cwd(), "..", "supabase", "migrations", name), "utf8");

describe("order migration security and settings version contract", () => {
  it("revokes all legacy order RPC execution grants without granting a caller", () => {
    const sql = migration("20261111110000_retire_legacy_customer_order_rpc.sql");

    expect(sql).toMatch(
      /revoke\s+all\s+on\s+function\s+public\.create_customer_order\s*\(\s*uuid,\s*text,\s*text,\s*text,\s*jsonb,\s*jsonb,\s*text\s*\)\s+from\s+public,\s*anon,\s*authenticated,\s*service_role/i,
    );
    expect(sql).toMatch(/to_regprocedure\([\s\S]*?\)\s+is not null/i);
    expect(sql).not.toMatch(/grant\s+execute\s+on\s+function\s+public\.create_customer_order/i);
  });

  it("changes the settings version for order configuration but not unrelated configuration", () => {
    const sql = migration("20261111120000_restaurant_settings_pricing_version.sql");
    const functionSql = sql.match(
      /create or replace function public\.update_restaurant_settings_pricing_version\(\)([\s\S]*?)\$\$;/i,
    )?.[1];
    const versionCondition = functionSql?.match(/if \(new\.config -> 'isOpen'\)[\s\S]*?then/i)?.[0];

    expect(functionSql).toBeDefined();
    expect(functionSql).toMatch(/security invoker/i);
    expect(functionSql).toMatch(/set search_path\s*=\s*''/i);
    expect(functionSql).toMatch(/new\.updated_at\s*:=\s*old\.updated_at/i);
    expect(versionCondition).toMatch(/new\.config\s*->\s*'deliveryFee'[\s\S]*?is distinct from/i);
    expect(versionCondition).toMatch(
      /new\.config\s*->\s*'freeDeliveryAbove'[\s\S]*?is distinct from/i,
    );
    expect(versionCondition).toMatch(/new\.config\s*->\s*'minOrderValue'[\s\S]*?is distinct from/i);
    expect(versionCondition).toMatch(/new\.config\s*->\s*'isOpen'[\s\S]*?is distinct from/i);
    expect(versionCondition).toMatch(
      /new\.config\s*->\s*'acceptingOrders'[\s\S]*?is distinct from/i,
    );
    expect(versionCondition).toMatch(/new\.config\s*->\s*'codEnabled'[\s\S]*?is distinct from/i);
    expect(versionCondition).not.toMatch(/offers|hours|theme/i);
    expect(functionSql).toMatch(/clock_timestamp\(\)/i);
    expect(sql).toMatch(/before insert or update on public\.restaurant_settings/i);
    expect(sql).toMatch(/pg_catalog\.scale\([\s\S]*?\)\s*>\s*2/i);
  });

  it("rejects stale checkout versions and calculates amounts with numeric columns", () => {
    const sql = migration("20261111100000_order_settings_and_idempotency.sql");
    const orderFunction = sql.match(
      /create or replace function public\.create_code_menu_order\([\s\S]*?\$\$;/i,
    )?.[0];

    expect(orderFunction).toBeDefined();
    expect(orderFunction).toMatch(/settings_updated_at\s*<>\s*p_settings_updated_at/i);
    expect(orderFunction).toMatch(/errcode\s*=\s*'40001'/i);
    expect(orderFunction).toMatch(/numeric\(10,\s*2\)/i);
    expect(orderFunction).toMatch(/sum\(item\.unit_price\s*\*\s*item\.quantity\)/i);
  });
});
