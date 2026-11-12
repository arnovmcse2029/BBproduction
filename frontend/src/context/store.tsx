import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";
import { CATEGORIES, SEED_PRODUCTS, SEED_SETTINGS } from "@/data/mock";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/services/admin.service";
import { ordersService, type CreateOrderInput } from "@/services/orders.service";
import { productsService } from "@/services/products.service";
import { restaurantSettingsService } from "@/services/restaurant-settings.service";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Order, OrderStatus, Product, RestaurantSettings } from "@/types";

interface StoreValue {
  ready: boolean;
  error: string | null;
  settingsError: string | null;
  settingsUpdatedAt: string | null;
  products: Product[];
  categories: typeof CATEGORIES;
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
  const { user, isLoading: isAuthLoading } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const userId = user?.id;
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [categories, setCategories] = useState<typeof CATEGORIES>(CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(SEED_SETTINGS);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsUpdatedAt, setSettingsUpdatedAt] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (isAuthLoading) return;
    setSettingsError(null);
    if (isSupabaseConfigured() && !pathname.startsWith("/admin")) {
      setSettingsUpdatedAt(null);
    }
    try {
      const isAdminRoute = pathname.startsWith("/admin");
      const isMenuRoute = pathname === "/menu" || pathname.startsWith("/menu/");
      if (isAdminRoute) {
        const o =
          isSupabaseConfigured() && (!userId || isMenuRoute) ? [] : await ordersService.list();
        setOrders(o);
        const [p, c, s] = await Promise.all([
          productsService.list(),
          productsService.listCategories(),
          adminService.getSettings(),
        ]);
        setProducts(p);
        setCategories([{ id: "all", label: "All Items" }, ...c]);
        setSettings(s);
        setSettingsUpdatedAt(null);
      } else {
        setProducts(SEED_PRODUCTS);
        setCategories(CATEGORIES);
        if (isSupabaseConfigured()) {
          try {
            const checkoutSettings = await restaurantSettingsService.getCheckoutSettings();
            setSettings(checkoutSettings.settings);
            setSettingsUpdatedAt(checkoutSettings.updatedAt);
            setSettingsError(null);
          } catch (e) {
            const message =
              e instanceof Error ? e.message : "Restaurant order settings are unavailable.";
            setSettingsError(message);
            throw e;
          }
        } else {
          setSettings(SEED_SETTINGS);
          setSettingsUpdatedAt(null);
          setSettingsError(null);
        }
      }
      if (!isAdminRoute) {
        const o =
          isSupabaseConfigured() && (!userId || isMenuRoute) ? [] : await ordersService.list();
        setOrders(o);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data");
    } finally {
      setReady(true);
    }
  }, [isAuthLoading, pathname, userId]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (isSupabaseConfigured()) setOrders([]);
    void reload();
  }, [isAuthLoading, reload]);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      error,
      settingsError,
      settingsUpdatedAt,
      products,
      categories,
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
        setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]);
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
    [
      ready,
      error,
      settingsError,
      settingsUpdatedAt,
      products,
      categories,
      orders,
      settings,
      reload,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
