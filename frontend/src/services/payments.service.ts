import type { Order, Payment } from "@/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { http, isBackendConnected } from "./api";

/**
 * Payments. Razorpay is NOT connected yet: the backend must create the Razorpay
 * order and verify the signature with the secret key — never in the browser.
 * Planned endpoints: POST /payments/razorpay/order, POST /payments/razorpay/verify, GET /payments
 */
export const paymentsService = {
  isOnlinePaymentAvailable: () => false,
  async list(orders: Order[]): Promise<Payment[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase()
        .from("payments")
        .select(
          "id, order_id, gateway, transaction_reference, amount, payment_status, created_at, orders(order_number, customer_name_snapshot, payment_method)",
        )
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => {
        const order = row.orders[0];
        return {
          id: row.id,
          orderId: order?.order_number ?? row.order_id,
          method: order?.payment_method ?? "online",
          status: row.payment_status as Payment["status"],
          amount: Number(row.amount),
          createdAt: row.created_at,
          gateway: row.gateway,
          ...(order?.customer_name_snapshot ? { customerName: order.customer_name_snapshot } : {}),
          ...(row.transaction_reference ? { transactionReference: row.transaction_reference } : {}),
        };
      });
    }
    if (isBackendConnected) return http<Payment[]>("/payments");
    return orders.map((o) => ({
      id: `PAY-${o.id}`,
      orderId: o.id,
      method: o.paymentMethod,
      status: o.paymentStatus,
      amount: o.total,
      createdAt: o.createdAt,
      customerName: o.customer.fullName,
    }));
  },
};
