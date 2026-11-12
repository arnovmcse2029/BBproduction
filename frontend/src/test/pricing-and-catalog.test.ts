import { describe, expect, it } from "vitest";
import {
  calculateTotals,
  formatINR,
  meetsMinimumOrderValue,
  validateOrderSettings,
} from "@/lib/pricing";
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

  it("calculates decimal fees and thresholds at paise precision", () => {
    const belowThreshold = calculateTotals([{ price: 249, quantity: 2 }], {
      deliveryFee: 40.5,
      freeDeliveryAbove: 498.5,
    });
    expect(belowThreshold).toMatchObject({
      subtotal: 498,
      deliveryFee: 40.5,
      total: 538.5,
    });

    const atThreshold = calculateTotals(
      [
        { price: 249, quantity: 2 },
        { price: 79, quantity: 1 },
      ],
      { deliveryFee: 40.25, freeDeliveryAbove: 576.5 },
    );
    expect(atThreshold).toMatchObject({ subtotal: 577, deliveryFee: 0, total: 577 });

    const fractionalTotals = calculateTotals([{ price: 0.1, quantity: 3 }], {
      deliveryFee: 0.2,
      freeDeliveryAbove: 0.31,
    });
    expect(fractionalTotals).toMatchObject({ subtotal: 0.3, deliveryFee: 0.2, total: 0.5 });
    expect(formatINR(fractionalTotals.total)).toBe("₹0.50");
  });

  it("formats fractional INR amounts to paise without adding decimals to whole rupees", () => {
    expect(formatINR(40.5)).toBe("₹40.50");
    expect(formatINR(40)).toBe("₹40");
  });

  it("handles empty cart with zero delivery fee and zero total", () => {
    const totals = calculateTotals([], { deliveryFee: 40, freeDeliveryAbove: 499 });
    expect(totals.subtotal).toBe(0);
    expect(totals.deliveryFee).toBe(0);
    expect(totals.total).toBe(0);
    expect(totals.itemCount).toBe(0);
  });

  it("uses validated delivery settings and keeps discounts out of customer totals", () => {
    const settings = {
      isOpen: true,
      acceptingOrders: true,
      codEnabled: true,
      deliveryFee: 55,
      freeDeliveryAbove: 500,
      minOrderValue: 250,
    };
    expect(() => validateOrderSettings(settings)).not.toThrow();
    expect(meetsMinimumOrderValue(249, settings.minOrderValue)).toBe(false);
    expect(meetsMinimumOrderValue(250, settings.minOrderValue)).toBe(true);
    expect(calculateTotals([{ price: 249, quantity: 2 }], settings)).toEqual({
      subtotal: 498,
      deliveryFee: 55,
      total: 553,
      itemCount: 2,
    });
    expect(
      calculateTotals(
        [
          { price: 249, quantity: 2 },
          { price: 79, quantity: 1 },
        ],
        settings,
      ),
    ).toMatchObject({ subtotal: 577, deliveryFee: 0, total: 577 });
  });

  it("rejects missing, negative, non-finite, or mistyped order settings", () => {
    expect(() => validateOrderSettings({})).toThrow("invalid");
    expect(() =>
      validateOrderSettings({
        isOpen: true,
        acceptingOrders: true,
        codEnabled: true,
        deliveryFee: -1,
        freeDeliveryAbove: 0,
        minOrderValue: 0,
      }),
    ).toThrow("invalid");
    expect(() =>
      calculateTotals([{ price: 249, quantity: 1 }], {
        deliveryFee: Number.NaN,
        freeDeliveryAbove: 0,
      }),
    ).toThrow("invalid");
    expect(() => meetsMinimumOrderValue(250, Number.NaN)).toThrow("invalid");
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
