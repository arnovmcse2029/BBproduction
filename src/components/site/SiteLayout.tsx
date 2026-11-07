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
      <main className="flex-1 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        {children}
      </main>
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

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-charcoal border-b border-gold/15">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/15 via-charcoal/60 to-charcoal" />
      <div className="container-page relative py-14 md:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold mb-2">
          ✦ {eyebrow} ✦
        </span>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ivory md:text-6xl">{title}</h1>
        <div className="flex items-center gap-2 mt-4">
          <span className="h-px w-10 bg-gold/60" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="h-px w-10 bg-gold/60" />
        </div>
        {description && (
          <p className="mt-4 max-w-2xl text-base md:text-lg text-ivory-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
