import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VegMark } from "@/components/site/Badges";
import { Panel, SummaryRows } from "@/components/site/OrderSummary";
import { ProductImage } from "@/components/site/ProductImage";
import { QuantityStepper } from "@/components/site/QuantityStepper";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState } from "@/components/site/States";
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
import { formatINR } from "@/lib/pricing";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Biriyani Babu" },
      { name: "description", content: "Review the dishes in your Biriyani Babu cart before checkout." },
      { property: "og:title", content: "Your Cart — Biriyani Babu" },
      { property: "og:description", content: "Review your order before checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { settings, products } = useStore();
  const belowMin = settings.minOrderValue > 0 && cart.subtotal < settings.minOrderValue;
  const unavailable = cart.items.filter((i) => products.find((p) => p.id === i.productId)?.isAvailable === false);
  const canOrder = settings.isOpen && settings.acceptingOrders && !belowMin && unavailable.length === 0;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Your Cart" title="Your order" />
      <div className="container-page py-12">
        {cart.items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-10 w-10" />}
            title="Your cart is empty"
            description="Add a biriyani or two from our menu to get started."
            action={
              <Button asChild size="xl">
                <Link to="/menu">Browse the menu</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <ul className="space-y-4 lg:col-span-2">
              {cart.items.map((item) => (
                <li key={item.productId} className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card">
                  <ProductImage src={item.image} alt={item.name} className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <VegMark isVeg={item.isVeg} className="mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold leading-snug">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{formatINR(item.price)} each</p>
                          {unavailable.some((u) => u.productId === item.productId) && (
                            <p className="mt-1 text-sm font-medium text-destructive">Now out of stock — please remove</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => cart.remove(item.productId)}
                        aria-label={`Remove ${item.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper size="sm" value={item.quantity} min={1} onChange={(v) => cart.setQuantity(item.productId, v)} />
                      <p className="font-display text-lg font-semibold">{formatINR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
              <li>
                <Button asChild variant="link" className="px-0 text-earth">
                  <Link to="/menu">← Continue shopping</Link>
                </Button>
              </li>
            </ul>

            <Panel title="Order summary" className="h-fit lg:sticky lg:top-28">
              <SummaryRows subtotal={cart.subtotal} deliveryFee={cart.deliveryFee} total={cart.total} />
              {settings.freeDeliveryAbove > 0 && cart.deliveryFee > 0 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Add {formatINR(settings.freeDeliveryAbove - cart.subtotal)} more for free delivery.
                </p>
              )}
              {belowMin && (
                <p className="mt-4 text-sm text-destructive">Minimum order is {formatINR(settings.minOrderValue)}.</p>
              )}
              {canOrder ? (
                <Button asChild variant="gold" size="xl" className="mt-6 w-full">
                  <Link to="/checkout">
                    Proceed to Checkout <ArrowRight />
                  </Link>
                </Button>
              ) : (
                <Button variant="gold" size="xl" className="mt-6 w-full" disabled>
                  Proceed to Checkout
                </Button>
              )}
            </Panel>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
