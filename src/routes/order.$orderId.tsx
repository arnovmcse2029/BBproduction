import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Panel, SummaryRows } from "@/components/site/OrderSummary";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DemoNotice, EmptyState, LoadingState } from "@/components/site/States";
import { useStore } from "@/context/store";
import { formatDateTime, PAYMENT_LABEL, PAYMENT_TONE } from "@/lib/order-status";
import { formatINR } from "@/lib/pricing";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Biriyani Babu" },
      { name: "description", content: "Your Biriyani Babu order confirmation." },
      { property: "og:title", content: "Order Confirmed — Biriyani Babu" },
      { property: "og:description", content: "Your Biriyani Babu order confirmation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { orderId } = Route.useParams();
  const { orders, ready, settings } = useStore();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <SiteLayout>
        <div className="container-page py-20">
          {!ready ? (
            <LoadingState label="Finding your order…" />
          ) : (
            <EmptyState
              title="We couldn't find that order"
              description="Check the order reference and try tracking it again."
              action={
                <Button asChild>
                  <Link to="/track">Track an order</Link>
                </Button>
              }
            />
          )}
        </div>
      </SiteLayout>
    );
  }

  const eta = new Date(new Date(order.createdAt).getTime() + settings.estimatedDeliveryMins * 60000);

  return (
    <SiteLayout>
      <section className="bg-charcoal">
        <div className="container-page py-16 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
          <h1 className="mt-5 text-4xl font-semibold text-ivory md:text-5xl">Thank you, {order.customer.fullName.split(" ")[0]}!</h1>
          <p className="mt-3 text-ivory-muted">Your order has been received.</p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(order.id);
              toast.success("Order reference copied");
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2 font-mono text-lg tracking-wider text-gold hover:bg-gold/10"
          >
            {order.id} <Copy className="h-4 w-4" />
          </button>
        </div>
      </section>

      <div className="container-page grid gap-6 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DemoNotice>
            This is a demo confirmation. The order is saved in this browser only and has not been sent to the
            restaurant's kitchen yet.
          </DemoNotice>
          <Panel title="Items">
            <ul className="mb-5 space-y-3 border-b pb-5">
              {order.items.map((i) => (
                <li key={i.productId} className="flex justify-between text-sm">
                  <span><span className="font-semibold">{i.quantity}×</span> {i.name}</span>
                  <span className="tabular-nums">{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <SummaryRows subtotal={order.subtotal} deliveryFee={order.deliveryFee} total={order.total} />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gold" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimated delivery</p>
                <p className="font-semibold">
                  Around {eta.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} (estimate)
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t pt-5 text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_TONE[order.paymentStatus]}`}>
                {PAYMENT_LABEL[order.paymentStatus]}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
          </Panel>
          <Panel title="Deliver to">
            <p className="font-semibold">{order.customer.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
            <p className="mt-3 text-sm leading-relaxed">{order.address.fullAddress}</p>
            {order.address.landmark && <p className="text-sm text-muted-foreground">Near {order.address.landmark}</p>}
            {order.address.instructions && <p className="mt-2 text-sm italic text-muted-foreground">“{order.address.instructions}”</p>}
          </Panel>
          <div className="flex flex-col gap-3">
            <Button asChild variant="gold" size="xl">
              <Link to="/track" search={{ id: order.id }}>Track this order</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/menu">Order something else</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
