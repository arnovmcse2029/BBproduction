// Shared domain types. These mirror the shape the future Node/Express + MongoDB API will return.

export type ProductCategory =
  | "chicken-biriyani"
  | "mutton-biriyani"
  | "chicken-chaap"
  | "combos"
  | "special"
  | "beverages";

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number; // INR
  category: ProductCategory;
  image?: string; // URL; when missing an elegant placeholder is shown
  isVeg: boolean;
  isAvailable: boolean;
  isBestseller: boolean;
  serves?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  isVeg: boolean;
  quantity: number;
}

export interface Customer {
  fullName: string;
  phone: string;
}

export interface DeliveryAddress {
  house: string;
  street: string;
  area: string;
  landmark?: string;
  fullAddress: string;
  instructions?: string;
}

export type PaymentMethod = "online" | "cod";
export type PaymentStatus = "pending" | "paid" | "cod" | "failed" | "refunded";

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
}

export const ORDER_STATUSES = [
  "received",
  "accepted",
  "preparing",
  "ready",
  "out-for-delivery",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: Customer;
  address: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  isDemo: boolean;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code?: string;
  active: boolean;
}

export interface RestaurantSettings {
  isOpen: boolean;
  acceptingOrders: boolean;
  codEnabled: boolean;
  deliveryFee: number;
  freeDeliveryAbove: number; // 0 disables free delivery
  minOrderValue: number;
  estimatedDeliveryMins: number;
  phone: string;
  email: string;
  address: string;
  hours: OpeningHours[];
  offers: Offer[];
  social: { instagram: string; facebook: string; youtube: string };
}
