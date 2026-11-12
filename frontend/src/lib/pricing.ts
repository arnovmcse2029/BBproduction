import type { RestaurantSettings } from "@/types";

export interface PricedLine {
  price: number;
  quantity: number;
}

export interface Totals {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export type OrderSettings = Pick<
  RestaurantSettings,
  | "isOpen"
  | "acceptingOrders"
  | "codEnabled"
  | "deliveryFee"
  | "freeDeliveryAbove"
  | "minOrderValue"
>;

function toPaise(value: unknown): number {
  if (typeof value !== "number") {
    throw new Error("Order amounts must be non-negative with at most two decimal places.");
  }
  const paise = Math.round(value * 100);
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 99999999.99 ||
    Math.abs(value * 100 - paise) > Number.EPSILON * Math.max(1, Math.abs(value * 100)) * 2
  ) {
    throw new Error(
      "Order amount is invalid: it must be non-negative with at most two decimal places.",
    );
  }
  return paise;
}

export function validateOrderSettings(settings: unknown): asserts settings is OrderSettings {
  if (typeof settings !== "object" || settings === null) {
    throw new Error("Restaurant order settings are unavailable.");
  }
  const values = settings as Record<string, unknown>;
  if (
    typeof values["isOpen"] !== "boolean" ||
    typeof values["acceptingOrders"] !== "boolean" ||
    typeof values["codEnabled"] !== "boolean" ||
    ![values["deliveryFee"], values["freeDeliveryAbove"], values["minOrderValue"]].every(
      (value) => typeof value === "number" && Number.isFinite(value) && value >= 0,
    )
  ) {
    throw new Error("Restaurant order settings are invalid. Please contact the restaurant.");
  }
  for (const value of [
    values["deliveryFee"],
    values["freeDeliveryAbove"],
    values["minOrderValue"],
  ]) {
    try {
      toPaise(value);
    } catch {
      throw new Error("Restaurant order settings are invalid. Please contact the restaurant.");
    }
  }
}

/** Cart / order totals. Delivery is free only when the owner sets a free-delivery threshold. */
export function calculateTotals(
  lines: PricedLine[],
  settings: Pick<OrderSettings, "deliveryFee" | "freeDeliveryAbove">,
): Totals {
  const deliveryFeePaise = toPaise(settings.deliveryFee);
  const freeDeliveryAbovePaise = toPaise(settings.freeDeliveryAbove);
  const subtotalPaise = lines.reduce((sum, line) => sum + toPaise(line.price) * line.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  let chargedFeePaise = subtotalPaise > 0 ? deliveryFeePaise : 0;
  if (freeDeliveryAbovePaise > 0 && subtotalPaise >= freeDeliveryAbovePaise) {
    chargedFeePaise = 0;
  }
  return {
    subtotal: subtotalPaise / 100,
    deliveryFee: chargedFeePaise / 100,
    total: (subtotalPaise + chargedFeePaise) / 100,
    itemCount,
  };
}

export function meetsMinimumOrderValue(subtotal: number, minimum: number) {
  return toPaise(subtotal) >= toPaise(minimum);
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
