import type { Customer, DeliveryAddress, Order, OrderItem, OrderStatus, PaymentMethod } from "@/types";
import { http, isBackendConnected } from "./api";
import { delay, mockDb } from "./mock-db";

export interface CreateOrderInput {
  customer: Customer;
  address: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
}

function makeOrderId() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BB-${ymd}-${rand}`;
}

// Planned endpoints: GET /orders, GET /orders/:id, POST /orders, PATCH /orders/:id/status
export const ordersService = {
  async list(): Promise<Order[]> {
    if (isBackendConnected) return http<Order[]>("/orders");
    await delay();
    return mockDb.getOrders();
  },
  async get(id: string): Promise<Order | undefined> {
    if (isBackendConnected) return http<Order>(`/orders/${encodeURIComponent(id)}`);
    await delay();
    return mockDb.getOrders().find((o) => o.id.toLowerCase() === id.toLowerCase());
  },
  async create(input: CreateOrderInput): Promise<Order> {
    if (isBackendConnected) return http<Order>("/orders", { method: "POST", body: JSON.stringify(input) });
    await delay(400);
    const order: Order = {
      ...input,
      id: makeOrderId(),
      // Online payment is not connected yet, so it stays pending — never marked paid here.
      paymentStatus: input.paymentMethod === "online" ? "pending" : "cod",
      status: "received",
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    mockDb.setOrders([order, ...mockDb.getOrders()]);
    return order;
  },
  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    if (isBackendConnected) {
      await http(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      return;
    }
    mockDb.setOrders(mockDb.getOrders().map((o) => (o.id === id ? { ...o, status } : o)));
  },
};
