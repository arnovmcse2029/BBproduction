import { beforeEach, describe, expect, it, vi } from "vitest";
import { FunctionsHttpError } from "@supabase/supabase-js";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  supabaseConfigured: true,
  backendConnected: false,
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ functions: { invoke: mocks.invoke } }),
  isSupabaseConfigured: () => mocks.supabaseConfigured,
}));

vi.mock("@/services/api", () => ({
  http: vi.fn(),
  get isBackendConnected() {
    return mocks.backendConnected;
  },
}));

import { ordersService, type CreateOrderInput } from "@/services/orders.service";

const input: CreateOrderInput = {
  userId: "customer-uuid",
  addressId: "address-uuid",
  customer: { fullName: "Ada Bose", phone: "+91 9876543210", email: "ada@example.com" },
  address: {
    house: "12A",
    street: "Park Street",
    area: "Kolkata",
    fullAddress: "12A, Park Street, Kolkata",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700016",
  },
  items: [{ productId: "kolkata-chicken-biriyani", name: "Forged price", price: 1, quantity: 2 }],
  subtotal: 2,
  deliveryFee: 0,
  total: 2,
  paymentMethod: "cod",
  settingsUpdatedAt: "2026-11-11T00:00:00.000Z",
};

const createdOrder = {
  id: "order-uuid",
  order_number: "BB-261111-A1B2C3D4",
  customer_name_snapshot: "Ada Bose",
  customer_phone_snapshot: "+91 9876543210",
  customer_email_snapshot: "ada@example.com",
  shipping_address: input.address,
  subtotal: 498,
  delivery_fee: 40,
  discount: 0,
  total_amount: 538,
  payment_method: "cod",
  payment_status: "cod",
  order_status: "received",
  created_at: "2026-11-11T12:00:00.000Z",
  order_items: [
    {
      id: "item-uuid",
      product_id: "kolkata-chicken-biriyani",
      product_name: "Kolkata Chicken Biriyani",
      unit_price: 249,
      quantity: 2,
    },
  ],
};

function getCall(index: number) {
  const call = mocks.invoke.mock.calls[index];
  if (!call) throw new Error(`Missing Edge Function call at index ${index}.`);
  return call;
}

describe("Supabase order creation", () => {
  beforeEach(() => {
    mocks.invoke.mockReset();
    mocks.supabaseConfigured = true;
    mocks.backendConnected = false;
    localStorage.clear();
  });

  it("sends IDs and quantities only, with an idempotency key and server settings version", async () => {
    mocks.invoke.mockResolvedValue({ data: createdOrder, error: null });

    const order = await ordersService.create(input);
    const [functionName, options] = getCall(0);

    expect(functionName).toBe("create-customer-order");
    expect(options.body).toMatchObject({
      addressId: "address-uuid",
      customer: { fullName: "Ada Bose", phone: "+91 9876543210" },
      address: expect.objectContaining({ pincode: "700016" }),
      items: [{ productId: "kolkata-chicken-biriyani", quantity: 2 }],
      paymentMethod: "cod",
      settingsUpdatedAt: input.settingsUpdatedAt,
      idempotencyKey: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    });
    expect(options.body.items[0]).not.toHaveProperty("price");
    expect(options.body).not.toHaveProperty("deliveryFee");
    expect(options.body).not.toHaveProperty("discount");
    expect(order).toMatchObject({
      id: "BB-261111-A1B2C3D4",
      subtotal: 498,
      deliveryFee: 40,
      total: 538,
      paymentMethod: "cod",
      items: [{ name: "Kolkata Chicken Biriyani", price: 249, quantity: 2 }],
    });
  });

  it("reuses the same key after a successful server write whose response was lost", async () => {
    mocks.invoke
      .mockResolvedValueOnce({ data: null, error: { message: "Network response was lost" } })
      .mockResolvedValueOnce({ data: createdOrder, error: null });

    await expect(ordersService.create(input)).rejects.toThrow("Network response was lost");
    const retryOrder = await ordersService.create({
      ...input,
      settingsUpdatedAt: "2026-11-11T09:30:00.000Z",
    });
    const firstKey = getCall(0)[1].body.idempotencyKey;
    const retryKey = getCall(1)[1].body.idempotencyKey;

    expect(retryKey).toBe(firstKey);
    expect(retryOrder.id).toBe("BB-261111-A1B2C3D4");
    expect(localStorage.length).toBe(0);
  });

  it("keeps an uncertain attempt key when a different payload is tried before retrying it", async () => {
    mocks.invoke
      .mockResolvedValueOnce({ data: null, error: { message: "Network response was lost" } })
      .mockResolvedValueOnce({ data: null, error: { message: "Network response was lost" } })
      .mockResolvedValueOnce({ data: createdOrder, error: null });

    await expect(ordersService.create(input)).rejects.toThrow("Network response was lost");
    await expect(
      ordersService.create({
        ...input,
        items: [{ ...input.items[0]!, quantity: 3 }],
      }),
    ).rejects.toThrow("Network response was lost");
    await ordersService.create(input);

    const keys = [
      getCall(0)[1].body.idempotencyKey,
      getCall(1)[1].body.idempotencyKey,
      getCall(2)[1].body.idempotencyKey,
    ];
    expect(keys[2]).toBe(keys[0]);
    expect(keys[1]).not.toBe(keys[0]);
  });

  it("surfaces stale-settings conflicts so checkout can refresh the displayed estimate", async () => {
    mocks.invoke.mockResolvedValue({
      data: null,
      error: new FunctionsHttpError(
        new Response(
          JSON.stringify({
            error: "Order pricing settings changed. Review the updated total and retry.",
          }),
          { status: 409 },
        ),
      ),
    });

    await expect(ordersService.create(input)).rejects.toThrow("Order pricing settings changed");
  });

  it("sends the same key for concurrent identical submissions", async () => {
    mocks.invoke.mockResolvedValue({ data: createdOrder, error: null });

    const orders = await Promise.all([ordersService.create(input), ordersService.create(input)]);

    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    expect(getCall(0)[1].body.idempotencyKey).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(orders.map((order) => order.id)).toEqual(["BB-261111-A1B2C3D4", "BB-261111-A1B2C3D4"]);
  });

  it("creates a fresh key for a new intentional checkout after success", async () => {
    mocks.invoke.mockResolvedValue({ data: createdOrder, error: null });

    await ordersService.create(input);
    await ordersService.create(input);

    const keys = [getCall(0)[1].body.idempotencyKey, getCall(1)[1].body.idempotencyKey];
    expect(keys[1]).not.toBe(keys[0]);
  });

  it("fails clearly instead of calling unsupported Express order endpoints", async () => {
    mocks.supabaseConfigured = false;
    mocks.backendConnected = true;

    await expect(ordersService.create(input)).rejects.toThrow(
      "Order operations are not supported by the configured Express backend",
    );
    await expect(ordersService.list()).rejects.toThrow(
      "Order operations are not supported by the configured Express backend",
    );
    await expect(ordersService.get("order-uuid")).rejects.toThrow(
      "Order operations are not supported by the configured Express backend",
    );
    await expect(ordersService.updateStatus("order-uuid", "received")).rejects.toThrow(
      "Order operations are not supported by the configured Express backend",
    );
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("uses a new key when the order payload changes and preserves server conflict errors", async () => {
    mocks.invoke
      .mockResolvedValueOnce({
        data: null,
        error: { message: "Idempotency key has already been used with a different order request." },
      })
      .mockResolvedValueOnce({ data: createdOrder, error: null });

    await expect(
      ordersService.create({
        ...input,
        items: [
          {
            productId: "kolkata-chicken-biriyani",
            name: "Forged price",
            price: 1,
            quantity: 3,
          },
        ],
      }),
    ).rejects.toThrow("different order request");
    const firstKey = getCall(0)[1].body.idempotencyKey;

    await ordersService.create({
      ...input,
      items: [
        {
          productId: "kolkata-chicken-biriyani",
          name: "Forged price",
          price: 1,
          quantity: 4,
        },
      ],
    });
    const secondKey = getCall(1)[1].body.idempotencyKey;
    expect(secondKey).not.toBe(firstKey);
  });
});
