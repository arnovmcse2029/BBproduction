import type {
  Customer,
  DeliveryAddress,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "@/types";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { isBackendConnected } from "./api";
import { delay, mockDb } from "./mock-db";
import { clearOrderIdempotencyKey, getOrderIdempotencyKey } from "@/lib/order-idempotency";

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  customer: Customer;
  address: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  settingsUpdatedAt: string;
}

type OrderRow = {
  id: string;
  order_number: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  customer_email_snapshot: string | null;
  shipping_address: DeliveryAddress;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: Order["paymentStatus"];
  order_status: OrderStatus;
  created_at: string;
  order_items: {
    id: string;
    product_id: string | null;
    product_name: string;
    unit_price: number;
    quantity: number;
  }[];
};

function fromOrderRow(row: OrderRow): Order {
  return {
    id: row.order_number,
    customer: {
      fullName: row.customer_name_snapshot,
      phone: row.customer_phone_snapshot,
      ...(row.customer_email_snapshot ? { email: row.customer_email_snapshot } : {}),
    },
    address: row.shipping_address,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id ?? item.id,
      name: item.product_name,
      price: Number(item.unit_price),
      quantity: item.quantity,
    })),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total_amount),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.order_status,
    createdAt: row.created_at,
    isDemo: false,
  };
}

async function getOrderCreationError(error: unknown) {
  if (error instanceof FunctionsHttpError && error.context instanceof Response) {
    const body: unknown = await error.context
      .clone()
      .json()
      .catch(() => undefined);
    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return new Error(body.error);
    }
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return new Error(error.message);
  }
  return new Error("Unable to create the order.");
}

async function getSupabaseOrder(id: string): Promise<Order | undefined> {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? fromOrderRow(data as OrderRow) : undefined;
}

function makeOrderId() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BB-${ymd}-${rand}`;
}

const inFlightOrderRequests = new Map<string, Promise<Order>>();

function unsupportedBackendOrderError() {
  return new Error(
    "Order operations are not supported by the configured Express backend. Use the Supabase order service.",
  );
}

export const ordersService = {
  async list(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase()
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data as OrderRow[]).map(fromOrderRow);
    }
    if (isBackendConnected) throw unsupportedBackendOrderError();
    await delay();
    return mockDb.getOrders();
  },
  async get(id: string): Promise<Order | undefined> {
    if (isSupabaseConfigured()) return getSupabaseOrder(id);
    if (isBackendConnected) throw unsupportedBackendOrderError();
    await delay();
    return mockDb.getOrders().find((o) => o.id.toLowerCase() === id.toLowerCase());
  },
  async create(input: CreateOrderInput): Promise<Order> {
    if (isSupabaseConfigured()) {
      const request = {
        addressId: input.addressId,
        customer: {
          fullName: input.customer.fullName,
          phone: input.customer.phone,
        },
        address: input.address,
        items: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: input.paymentMethod,
        settingsUpdatedAt: input.settingsUpdatedAt,
      };
      const logicalRequest = {
        userId: input.userId,
        addressId: request.addressId,
        customer: request.customer,
        address: request.address,
        items: request.items,
        paymentMethod: request.paymentMethod,
      };
      const requestFingerprint = JSON.stringify(logicalRequest);
      const inFlight = inFlightOrderRequests.get(requestFingerprint);
      if (inFlight) return inFlight;

      const creation = (async () => {
        const idempotencyKey = await getOrderIdempotencyKey(logicalRequest);
        const { data, error } = await getSupabase().functions.invoke("create-customer-order", {
          body: { ...request, idempotencyKey },
        });
        if (error) throw await getOrderCreationError(error);
        if (!data || typeof data !== "object") {
          throw new Error("Supabase did not return the created order.");
        }
        const order = fromOrderRow(data as OrderRow);
        clearOrderIdempotencyKey(idempotencyKey);
        return order;
      })();
      inFlightOrderRequests.set(requestFingerprint, creation);
      try {
        return await creation;
      } finally {
        if (inFlightOrderRequests.get(requestFingerprint) === creation) {
          inFlightOrderRequests.delete(requestFingerprint);
        }
      }
    }
    if (isBackendConnected) {
      throw unsupportedBackendOrderError();
    }
    await delay(400);
    const order: Order = {
      id: makeOrderId(),
      customer: input.customer,
      address: input.address,
      items: input.items,
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      total: input.total,
      paymentMethod: input.paymentMethod,
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
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase()
        .from("orders")
        .update({ order_status: status })
        .eq("order_number", id)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("Order not found or you are not authorized to update it.");
      return;
    }
    if (isBackendConnected) {
      throw unsupportedBackendOrderError();
    }
    mockDb.setOrders(mockDb.getOrders().map((o) => (o.id === id ? { ...o, status } : o)));
  },
};
