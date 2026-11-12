// Browser-only demo "database" (localStorage). Replaced by the API once VITE_API_BASE_URL is set.
import { SEED_PRODUCTS, SEED_SETTINGS, buildSeedOrders } from "@/data/mock";
import type { Order, Product, RestaurantSettings } from "@/types";

const KEYS = {
  products: "bb_products_v1",
  orders: "bb_orders_v1",
  settings: "bb_settings_v1",
};

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

function read<T>(key: string, fallback: () => T): T {
  if (!hasStorage()) return fallback();
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore corrupt storage */
  }
  const seed = fallback();
  write(key, seed);
  return seed;
}

function write<T>(key: string, value: T) {
  if (hasStorage()) window.localStorage.setItem(key, JSON.stringify(value));
}

export const mockDb = {
  getProducts: () => read<Product[]>(KEYS.products, () => SEED_PRODUCTS),
  setProducts: (p: Product[]) => write(KEYS.products, p),
  getOrders: () => read<Order[]>(KEYS.orders, () => buildSeedOrders()),
  setOrders: (o: Order[]) => write(KEYS.orders, o),
  getSettings: () => ({
    ...SEED_SETTINGS,
    ...read<RestaurantSettings>(KEYS.settings, () => SEED_SETTINGS),
  }),
  setSettings: (s: RestaurantSettings) => write(KEYS.settings, s),
  reset: () => {
    Object.values(KEYS).forEach((k) => hasStorage() && window.localStorage.removeItem(k));
  },
};

export const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));
