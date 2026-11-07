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

/** Cart / order totals. Delivery is free only when the owner sets a free-delivery threshold. */
export function calculateTotals(
  lines: PricedLine[],
  settings: Pick<RestaurantSettings, "deliveryFee" | "freeDeliveryAbove">,
): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  let deliveryFee = subtotal > 0 ? settings.deliveryFee : 0;
  if (settings.freeDeliveryAbove > 0 && subtotal >= settings.freeDeliveryAbove) deliveryFee = 0;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee, itemCount };
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
