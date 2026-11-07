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
      {
        name: "description",
        content: "Review the dishes in your Biriyani Babu cart before checkout.",
      },
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
  const unavailable = cart.items.filter(
    (i) => products.find((p) => p.id === i.productId)?.isAvailable === false,
  );
  const canOrder =
    settings.isOpen && settings.acceptingOrders && !belowMin && unavailable.length === 0;

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
                <li
                  key={item.productId}
                  className="flex gap-4 rounded-2xl border bg-card p-4 shadow-card"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <VegMark isVeg={item.isVeg} className="mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold leading-snug">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatINR(item.price)} each
                          </p>
                          {unavailable.some((u) => u.productId === item.productId) && (
                            <p className="mt-1 text-sm font-medium text-destructive">
                              Now out of stock — please remove
                            </p>
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
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        min={1}
                        onChange={(v) => cart.setQuantity(item.productId, v)}
                      />
                      <p className="font-display text-lg font-semibold">
                        {formatINR(item.price * item.quantity)}
                      </p>
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

            <Panel
              title="Order summary"
              className="h-fit lg:sticky lg:top-28 rounded-2xl border border-border/80 shadow-card"
            >
              <SummaryRows
                subtotal={cart.subtotal}
                deliveryFee={cart.deliveryFee}
                total={cart.total}
              />

              {/* Free delivery bar */}
              {settings.freeDeliveryAbove > 0 && (
                <div className="mt-5 rounded-xl border border-gold/20 bg-gold/10 p-3.5">
                  {cart.deliveryFee > 0 ? (
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gold-foreground">
                        <span>Free Delivery Progress</span>
                        <span>
                          {formatINR(cart.subtotal)} / {formatINR(settings.freeDeliveryAbove)}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full bg-gold transition-all duration-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (cart.subtotal / settings.freeDeliveryAbove) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Add{" "}
                        <strong className="text-foreground">
                          {formatINR(settings.freeDeliveryAbove - cart.subtotal)}
                        </strong>{" "}
                        more for <strong>FREE Delivery</strong>!
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <span>🎉</span> You've unlocked FREE Delivery on this order!
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground flex items-center justify-between">
                <span>Special Promo:</span>
                <span className="font-mono font-bold text-gold bg-charcoal px-2 py-0.5 rounded text-[0.7rem]">
                  BABU10
                </span>
              </div>

              {belowMin && (
                <p className="mt-4 text-sm text-destructive font-medium">
                  Minimum order amount is {formatINR(settings.minOrderValue)}.
                </p>
              )}

              {canOrder ? (
                <Button
                  asChild
                  variant="gold"
                  size="xl"
                  className="mt-6 w-full rounded-xl font-semibold shadow-gold hover:shadow-gold-lg"
                >
                  <Link to="/checkout" className="flex items-center justify-center gap-2">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="gold"
                  size="xl"
                  className="mt-6 w-full rounded-xl font-semibold"
                  disabled
                >
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
