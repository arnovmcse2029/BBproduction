import type { Order, Payment } from "@/types";
import { http, isBackendConnected } from "./api";

/**
 * Payments. Razorpay is NOT connected yet: the backend must create the Razorpay
 * order and verify the signature with the secret key — never in the browser.
 * Planned endpoints: POST /payments/razorpay/order, POST /payments/razorpay/verify, GET /payments
 */
export const paymentsService = {
  isOnlinePaymentAvailable: () => false,
  async list(orders: Order[]): Promise<Payment[]> {
    if (isBackendConnected) return http<Payment[]>("/payments");
    return orders.map((o) => ({
      id: `PAY-${o.id}`,
      orderId: o.id,
      method: o.paymentMethod,
      status: o.paymentStatus,
      amount: o.total,
      createdAt: o.createdAt,
    }));
  },
};
