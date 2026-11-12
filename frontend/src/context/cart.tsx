import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { calculateTotals, type Totals } from "@/lib/pricing";
import { MENU_ITEMS } from "@/data/menu";
import type { CartItem, Product } from "@/types";
import { useStore } from "./store";

const CART_KEY = "bb_cart_v1";

interface CartValue extends Totals {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  quantityOf: (productId: string) => number;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { settings, ready } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, loaded]);

  useEffect(() => {
    if (!ready) return;
    setItems((current) =>
      current.map((item) => {
        const product = MENU_ITEMS.find((candidate) => candidate.id === item.productId);
        return product
          ? {
              ...item,
              name: product.name,
              price: product.price,
              image: product.image,
              isVeg: product.isVeg,
            }
          : item;
      }),
    );
  }, [ready]);

  const value = useMemo<CartValue>(() => {
    const totals = calculateTotals(items, settings);
    return {
      ...totals,
      items,
      add: (product, qty = 1) => {
        if (!product.isAvailable) return;
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === product.id);
          if (existing) {
            return prev.map((i) =>
              i.productId === product.id ? { ...i, quantity: Math.min(20, i.quantity + qty) } : i,
            );
          }
          return [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              isVeg: product.isVeg,
              quantity: qty,
            },
          ];
        });
        toast.success(`${product.name} added to your cart`);
      },
      setQuantity: (productId, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.productId !== productId)
            : prev.map((i) =>
                i.productId === productId ? { ...i, quantity: Math.min(20, qty) } : i,
              ),
        ),
      remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
      clear: () => setItems([]),
      quantityOf: (productId) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    };
  }, [items, settings]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
