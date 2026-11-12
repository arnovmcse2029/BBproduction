import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.0";
import { priceMenuOrderItems } from "../../../frontend/src/data/menu.ts";
import { hashOrderPayload } from "../../../frontend/src/lib/order-idempotency.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return respond({ error: "You need to be logged in to place an order." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Supabase Edge Function environment is incomplete.");
    return respond({ error: "Order service is not configured." }, 500);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser();
  if (authError || !authData.user) {
    return respond({ error: "Your session is invalid. Sign in again to place your order." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond({ error: "The order request must contain valid JSON." }, 400);
  }
  if (!isRecord(body) || !isRecord(body.customer) || !isRecord(body.address)) {
    return respond({ error: "Customer and delivery details are required." }, 400);
  }

  const addressId = body.addressId;
  const customerName = body.customer.fullName;
  const customerPhone = body.customer.phone;
  const address = body.address;
  const paymentMethod = body.paymentMethod;
  const idempotencyKey = body.idempotencyKey;
  const settingsUpdatedAt = body.settingsUpdatedAt;
  const pin = address.pincode;
  if (
    !nonEmptyString(addressId) ||
    !nonEmptyString(customerName) ||
    !nonEmptyString(customerPhone) ||
    !nonEmptyString(address.house) ||
    !nonEmptyString(address.street) ||
    !nonEmptyString(address.area) ||
    !nonEmptyString(address.fullAddress) ||
    !nonEmptyString(address.city) ||
    !nonEmptyString(address.state) ||
    typeof pin !== "string" ||
    !/^[1-9]\d{5}$/.test(pin) ||
    (paymentMethod !== "cod" && paymentMethod !== "online") ||
    typeof idempotencyKey !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idempotencyKey,
    ) ||
    typeof settingsUpdatedAt !== "string" ||
    !Number.isFinite(Date.parse(settingsUpdatedAt))
  ) {
    return respond({ error: "Complete the required customer and delivery details." }, 400);
  }

  let pricedItems: ReturnType<typeof priceMenuOrderItems>;
  try {
    pricedItems = priceMenuOrderItems(body.items);
  } catch (error) {
    return respond(
      { error: error instanceof Error ? error.message : "The cart contains an invalid menu item." },
      400,
    );
  }
  const requestHash = await hashOrderPayload({
    userId: authData.user.id,
    addressId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    address,
    items: pricedItems.items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    })),
    paymentMethod,
  });

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await serviceClient.rpc("create_code_menu_order", {
    p_user_id: authData.user.id,
    p_address_id: addressId,
    p_customer_name: customerName.trim(),
    p_customer_phone: customerPhone.trim(),
    p_customer_email: authData.user.email ?? "",
    p_shipping_address: address,
    p_items: pricedItems.items,
    p_payment_method: paymentMethod,
    p_idempotency_key: idempotencyKey,
    p_request_hash: requestHash,
    p_settings_updated_at: settingsUpdatedAt,
  });
  if (error) {
    console.error("Unable to create customer order.", error.message);
    return respond(
      { error: error.message },
      error.code === "40001" || error.code === "22023" ? 409 : 400,
    );
  }
  if (!data || typeof data !== "object") {
    console.error("Order RPC returned no order row.");
    return respond({ error: "The order could not be confirmed." }, 500);
  }

  return respond(data);
});
