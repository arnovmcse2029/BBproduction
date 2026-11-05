import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SEED_PRODUCTS, SEED_SETTINGS } from "@/data/mock";
import { adminService } from "@/services/admin.service";
import { ordersService, type CreateOrderInput } from "@/services/orders.service";
import { productsService } from "@/services/products.service";
import type { Order, OrderStatus, Product, RestaurantSettings } from "@/types";

interface StoreValue {
  ready: boolean;
  error: string | null;
  products: Product[];
  orders: Order[];
  settings: RestaurantSettings;
  reload: () => Promise<void>;
  createProduct: (p: Omit<Product, "id">) => Promise<Product>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  placeOrder: (input: CreateOrderInput) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  saveSettings: (s: RestaurantSettings) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Seed values render on the server; real (stored) data loads after hydration.
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(SEED_SETTINGS);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [p, o, s] = await Promise.all([
        productsService.list(),
        ordersService.list(),
        adminService.getSettings(),
      ]);
      setProducts(p);
      setOrders(o);
      setSettings(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      error,
      products,
      orders,
      settings,
      reload,
      createProduct: async (p) => {
        const created = await productsService.create(p);
        setProducts(await productsService.list());
        return created;
      },
      updateProduct: async (id, patch) => {
        await productsService.update(id, patch);
        setProducts(await productsService.list());
      },
      deleteProduct: async (id) => {
        await productsService.remove(id);
        setProducts(await productsService.list());
      },
      placeOrder: async (input) => {
        const order = await ordersService.create(input);
        setOrders(await ordersService.list());
        return order;
      },
      updateOrderStatus: async (id, status) => {
        await ordersService.updateStatus(id, status);
        setOrders(await ordersService.list());
      },
      saveSettings: async (s) => {
        setSettings(await adminService.saveSettings(s));
      },
    }),
    [ready, error, products, orders, settings, reload],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
