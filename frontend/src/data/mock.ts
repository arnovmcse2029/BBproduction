import type { Order, OrderStatus, RestaurantSettings } from "@/types";
import { CATEGORIES, MENU_ITEMS, MENU_ORDER_SETTINGS, categoryLabel } from "./menu";

export { CATEGORIES, categoryLabel };
export const SEED_PRODUCTS = MENU_ITEMS;

export const SEED_SETTINGS: RestaurantSettings = {
  isOpen: true,
  ...MENU_ORDER_SETTINGS,
  estimatedDeliveryMins: 45,
  phone: "",
  email: "",
  address: "",
  hours: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
    (day) => ({ day, open: "11:30", close: "23:00", closed: false }),
  ),
  offers: [
    {
      id: "offer-combo",
      title: "Try the Babu Special Combo",
      description: "Biriyani and Chicken Chaap together in one order.",
      active: true,
    },
  ],
  social: { instagram: "", facebook: "", youtube: "" },
};

// Deterministic demo orders so the admin dashboard has something to show.
const DEMO_NAMES = [
  ["Ananya Sen", "98300 11223"],
  ["Rahul Das", "90070 44556"],
  ["Priya Ghosh", "98311 77889"],
  ["Arif Khan", "97480 22110"],
  ["Sohini Roy", "98741 33221"],
  ["Vikram Shah", "99030 55667"],
  ["Mehul Jain", "98364 99880"],
  ["Tania Bose", "90513 12121"],
];

const STATUS_CYCLE: Order["status"][] = [
  "received",
  "preparing",
  "out-for-delivery",
  "delivered",
  "delivered",
  "accepted",
  "delivered",
  "cancelled",
  "ready",
  "delivered",
];

export function buildSeedOrders(now = new Date()): Order[] {
  const orders: Order[] = [];
  const picks = [
    [0, 5],
    [1],
    [7, 12],
    [3, 5],
    [0, 13],
    [9],
    [8],
    [1, 5, 12],
    [2],
    [3, 11],
    [0],
    [7],
    [4 - 1, 5],
    [1, 13],
  ];
  picks.forEach((idxs, i) => {
    const items = idxs.map((pi, j) => {
      const p = SEED_PRODUCTS[pi];
      if (!p) throw new Error(`Invalid seed index ${pi}`);
      return { productId: p.id, name: p.name, price: p.price, quantity: j === 0 ? 1 + (i % 2) : 1 };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const deliveryFee = SEED_SETTINGS.deliveryFee;
    const created = new Date(now);
    created.setDate(created.getDate() - Math.floor(i / 2));
    created.setHours(12 + (i % 9), (i * 17) % 60, 0, 0);
    const demoEntry = DEMO_NAMES[i % DEMO_NAMES.length];
    const fullName = demoEntry?.[0] ?? "Customer";
    const phone = demoEntry?.[1] ?? "98300 00000";
    const status: OrderStatus =
      (i < 2 ? (i === 0 ? "received" : "preparing") : STATUS_CYCLE[i % STATUS_CYCLE.length]) ??
      "received";
    const method = i % 3 === 0 ? "online" : "cod";
    const area = ["Park Circus", "Salt Lake", "Gariahat", "New Town"][i % 4] ?? "Park Circus";
    orders.push({
      id: `BB-DEMO-${String(1001 + i)}`,
      customer: { fullName, phone: `+91 ${phone}` },
      address: {
        house: `${12 + i}B`,
        street: "Sample Street",
        area,
        fullAddress: `${12 + i}B, Sample Street, ${area}, Kolkata`,
      },
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: method,
      paymentStatus:
        status === "cancelled"
          ? "refunded"
          : method === "online"
            ? "paid"
            : status === "delivered"
              ? "paid"
              : "cod",
      status,
      createdAt: created.toISOString(),
      isDemo: true,
    });
  });
  return orders;
}
