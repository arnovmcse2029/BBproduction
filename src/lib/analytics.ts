import type { Order, Product } from "@/types";

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function orderStats(orders: Order[], now = new Date()) {
  const valid = orders.filter((o) => o.status !== "cancelled");
  return {
    totalOrders: orders.length,
    todayOrders: orders.filter((o) => sameDay(new Date(o.createdAt), now)).length,
    revenue: valid.reduce((s, o) => s + o.total, 0),
    pending: orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
    completed: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    avgOrderValue: valid.length
      ? Math.round(valid.reduce((s, o) => s + o.total, 0) / valid.length)
      : 0,
  };
}

export function revenueByDay(orders: Order[], days = 7, now = new Date()) {
  const out: { day: string; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOrders = orders.filter(
      (o) => o.status !== "cancelled" && sameDay(new Date(o.createdAt), d),
    );
    out.push({
      day: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    });
  }
  return out;
}

export function popularItems(orders: Order[], limit = 5) {
  const map = new Map<string, { name: string; quantity: number; revenue: number }>();
  orders
    .filter((o) => o.status !== "cancelled")
    .forEach((o) =>
      o.items.forEach((i) => {
        const cur = map.get(i.productId) ?? { name: i.name, quantity: 0, revenue: 0 };
        cur.quantity += i.quantity;
        cur.revenue += i.quantity * i.price;
        map.set(i.productId, cur);
      }),
    );
  return [...map.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}

export function salesByCategory(orders: Order[], products: Product[]) {
  const catOf = new Map(products.map((p) => [p.id, p.category]));
  const map = new Map<string, number>();
  orders
    .filter((o) => o.status !== "cancelled")
    .forEach((o) =>
      o.items.forEach((i) => {
        const c = catOf.get(i.productId) ?? "other";
        map.set(c, (map.get(c) ?? 0) + i.price * i.quantity);
      }),
    );
  return [...map.entries()].map(([category, value]) => ({ category, value }));
}

export function customersFromOrders(orders: Order[]) {
  const map = new Map<
    string,
    { name: string; phone: string; orders: number; spent: number; lastOrder: string; area: string }
  >();
  orders.forEach((o) => {
    const key = o.customer.phone;
    const cur = map.get(key) ?? {
      name: o.customer.fullName,
      phone: key,
      orders: 0,
      spent: 0,
      lastOrder: o.createdAt,
      area: o.address.area,
    };
    cur.orders += 1;
    if (o.status !== "cancelled") cur.spent += o.total;
    if (o.createdAt > cur.lastOrder) cur.lastOrder = o.createdAt;
    map.set(key, cur);
  });
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}
