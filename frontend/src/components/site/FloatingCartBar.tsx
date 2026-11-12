import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Bike, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { formatINR } from "@/lib/pricing";

export function FloatingCartBar() {
  const { itemCount, subtotal } = useCart();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Don't show floating cart on cart or checkout pages to avoid redundancy
  if (itemCount === 0 || currentPath === "/cart" || currentPath === "/checkout") {
    return null;
  }

  const freeDeliveryThreshold = 499;
  const remainingForFreeDelivery = freeDeliveryThreshold - subtotal;
  const hasFreeDelivery = remainingForFreeDelivery <= 0;

  return (
    <aside
      aria-label="Current order bar"
      className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-2xl animate-in slide-in-from-bottom-8 duration-300"
    >
      <div className="rounded-2xl border border-gold/40 bg-charcoal/95 p-3.5 sm:p-4 text-ivory shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Cart items info */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold border border-gold/30">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-soft text-[0.7rem] font-bold text-charcoal shadow-sm">
                {itemCount}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-xl font-bold text-gold">
                  {formatINR(subtotal)}
                </span>
                <span className="text-xs text-ivory-muted/80 hidden sm:inline">
                  ({itemCount} {itemCount === 1 ? "handi" : "items"})
                </span>
              </div>

              <p className="text-[0.72rem] text-ivory-muted flex items-center gap-1">
                {hasFreeDelivery ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Free Royal Delivery Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Bike className="h-3 w-3 text-gold" /> Add {formatINR(remainingForFreeDelivery)}{" "}
                    for FREE delivery
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Action button */}
          <Button
            asChild
            variant="gold"
            size="lg"
            className="rounded-xl px-5 sm:px-6 font-semibold shadow-gold shrink-0"
          >
            <Link to="/cart" className="flex items-center gap-2">
              <span>View Order</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
