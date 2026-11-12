import { describe, expect, it } from "vitest";
import { CATEGORIES, MENU_ITEMS, priceMenuOrderItems } from "@/data/menu";

describe("code-managed menu", () => {
  it("uses unique IDs and known categories for every dish", () => {
    expect(new Set(MENU_ITEMS.map((item) => item.id)).size).toBe(MENU_ITEMS.length);
    for (const item of MENU_ITEMS) {
      expect(CATEGORIES.some((category) => category.id === item.category)).toBe(true);
      expect(item.price).toBeGreaterThan(0);
    }
  });

  it("uses code prices and names for order snapshots, not supplied values", () => {
    expect(
      priceMenuOrderItems([
        { productId: "kolkata-chicken-biriyani", quantity: 2, price: 1, name: "Forged" },
      ]),
    ).toEqual({
      items: [
        {
          product_id: "kolkata-chicken-biriyani",
          product_name: "Kolkata Chicken Biriyani",
          unit_price: 249,
          quantity: 2,
        },
      ],
      subtotal: 498,
    });
  });

  it("rejects unavailable dishes and invalid quantities", () => {
    expect(() => priceMenuOrderItems([{ productId: "mutton-dum-biriyani", quantity: 1 }])).toThrow(
      "unavailable",
    );
    expect(() =>
      priceMenuOrderItems([{ productId: "kolkata-chicken-biriyani", quantity: 21 }]),
    ).toThrow("quantity");
  });

  it("rejects duplicate product lines that could bypass the per-dish quantity limit", () => {
    expect(() =>
      priceMenuOrderItems([
        { productId: "kolkata-chicken-biriyani", quantity: 20 },
        { productId: "kolkata-chicken-biriyani", quantity: 20 },
      ]),
    ).toThrow("Each dish can only appear once");
  });
});
