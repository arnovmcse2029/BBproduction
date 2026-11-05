import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
import { formatINR } from "@/lib/pricing";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { itemCount, subtotal } = useCart();
  const { settings } = useStore();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hideBar = path.startsWith("/cart") || path.startsWith("/checkout");

  return (
    <div className="flex min-h-screen flex-col">
      {(!settings.isOpen || !settings.acceptingOrders) && (
        <div className="bg-gold px-4 py-2 text-center text-sm font-medium text-gold-foreground">
          We're not accepting orders right now. Please check back during opening hours.
        </div>
      )}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      {itemCount > 0 && !hideBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 md:hidden">
          <Link
            to="/cart"
            className="flex h-14 items-center justify-between rounded-xl bg-charcoal px-5 text-ivory shadow-gold"
          >
            <span className="flex items-center gap-2 text-sm">
              <ShoppingBag className="h-5 w-5 text-gold" />
              {itemCount} item{itemCount > 1 ? "s" : ""} · {formatINR(subtotal)}
            </span>
            <span className="font-semibold text-gold">View cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <section className="bg-charcoal">
      <div className="container-page py-14 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold text-ivory md:text-6xl">{title}</h1>
        <span className="gold-rule mt-5" />
        {description && <p className="mt-5 max-w-2xl text-ivory-muted">{description}</p>}
      </div>
    </section>
  );
}
