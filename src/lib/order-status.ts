import { ORDER_STATUSES, type OrderStatus, type PaymentStatus } from "@/types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Order Received",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for Delivery",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  received: "bg-info/15 text-info",
  accepted: "bg-info/15 text-info",
  preparing: "bg-warning/25 text-warning-foreground",
  ready: "bg-warning/25 text-warning-foreground",
  "out-for-delivery": "bg-gold/25 text-earth",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  cod: "Cash on Delivery",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_TONE: Record<PaymentStatus, string> = {
  pending: "bg-warning/25 text-warning-foreground",
  paid: "bg-success/15 text-success",
  cod: "bg-muted text-muted-foreground",
  failed: "bg-destructive/15 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

export const stepIndex = (s: OrderStatus) => ORDER_STATUSES.indexOf(s as (typeof ORDER_STATUSES)[number]);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
