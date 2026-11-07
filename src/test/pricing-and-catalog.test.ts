import { describe, expect, it } from "vitest";
import { calculateTotals } from "@/lib/pricing";
import { summariseHours, to12h } from "@/lib/hours";
import { SEED_PRODUCTS, SEED_SETTINGS } from "@/data/mock";

describe("Pricing and Totals", () => {
  it("calculates accurate subtotal, delivery fee and total below free delivery threshold", () => {
    const items = [
      { price: 249, quantity: 2 }, // 498
    ];
    const settings = { deliveryFee: 40, freeDeliveryAbove: 499 };
    const totals = calculateTotals(items, settings);

    expect(totals.subtotal).toBe(498);
    expect(totals.deliveryFee).toBe(40);
    expect(totals.total).toBe(538);
    expect(totals.itemCount).toBe(2);
  });

  it("applies free delivery when subtotal meets or exceeds threshold", () => {
    const items = [
      { price: 249, quantity: 2 },
      { price: 79, quantity: 1 }, // 577
    ];
    const settings = { deliveryFee: 40, freeDeliveryAbove: 499 };
    const totals = calculateTotals(items, settings);

    expect(totals.subtotal).toBe(577);
    expect(totals.deliveryFee).toBe(0);
    expect(totals.total).toBe(577);
    expect(totals.itemCount).toBe(3);
  });

  it("handles empty cart with zero delivery fee and zero total", () => {
    const totals = calculateTotals([], { deliveryFee: 40, freeDeliveryAbove: 499 });
    expect(totals.subtotal).toBe(0);
    expect(totals.deliveryFee).toBe(0);
    expect(totals.total).toBe(0);
    expect(totals.itemCount).toBe(0);
  });
});

describe("Catalog Integrity", () => {
  it("ensures all seed products have valid positive prices and categories", () => {
    expect(SEED_PRODUCTS.length).toBeGreaterThan(0);
    for (const p of SEED_PRODUCTS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect([
        "chicken-biriyani",
        "mutton-biriyani",
        "chicken-chaap",
        "combos",
        "special",
        "beverages",
      ]).toContain(p.category);
    }
  });
});

describe("Hours Formatting", () => {
  it("formats 24-hour time to 12-hour AM/PM correctly", () => {
    expect(to12h("11:30")).toBe("11:30 AM");
    expect(to12h("23:00")).toBe("11:00 PM");
    expect(to12h("12:00")).toBe("12:00 PM");
    expect(to12h("00:00")).toBe("12:00 AM");
  });

  it("summarises contiguous operating hours", () => {
    const hours = summariseHours(SEED_SETTINGS.hours);
    expect(hours.length).toBe(1);
    expect(hours[0]?.label).toBe("Mon – Sun");
    expect(hours[0]?.value).toBe("11:30 AM – 11:00 PM");
  });
});
