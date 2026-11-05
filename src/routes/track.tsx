import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { Panel } from "@/components/site/OrderSummary";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { DemoNotice, EmptyState, LoadingState } from "@/components/site/States";
import { useStore } from "@/context/store";
import { formatDateTime, STATUS_LABEL } from "@/lib/order-status";
import { formatINR } from "@/lib/pricing";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => (typeof s.id === "string" ? { id: s.id } : {}),
  head: () => ({
    meta: [
      { title: "Track Your Order — Biriyani Babu" },
      { name: "description", content: "Follow your Biriyani Babu order from the kitchen to your door." },
      { property: "og:title", content: "Track Your Order — Biriyani Babu" },
      { property: "og:description", content: "Follow your order from the kitchen to your door." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { id } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { orders, ready } = useStore();
  const [input, setInput] = useState(id ?? "");
  const order = id ? orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase()) : undefined;
  const sample = orders.find((o) => o.isDemo && o.id.startsWith("BB-DEMO"));

  return (
    <SiteLayout>
      <PageHeader eyebrow="Order Tracking" title="Where's my biriyani?" description="Enter the order reference from your confirmation." />
      <div className="container-page max-w-4xl py-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: input.trim() ? { id: input.trim() } : {} });
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. BB-261105-AB12"
            aria-label="Order reference"
            className="h-12 bg-card font-mono"
          />
          <Button type="submit" size="xl">
            <Search /> Track
          </Button>
        </form>
        {sample && !id && (
          <p className="mt-3 text-sm text-muted-foreground">
            Want to see how it works?{" "}
            <Link to="/track" search={{ id: sample.id }} className="font-medium text-earth underline">
              View a sample order
            </Link>
          </p>
        )}

        <div className="mt-10">
          {!id ? null : !ready ? (
            <LoadingState label="Looking up your order…" />
          ) : !order ? (
            <EmptyState title="No order found" description={`We couldn't find an order with reference “${id}”.`} />
          ) : (
            <div className="space-y-6">
              <DemoNotice>
                Demo status only — live updates from the kitchen will appear here once the restaurant's system is connected.
              </DemoNotice>
              <div className="grid gap-6 md:grid-cols-5">
                <Panel className="md:col-span-3">
                  <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-xl font-semibold">{STATUS_LABEL[order.status]}</h2>
                    <span className="font-mono text-sm text-muted-foreground">{order.id}</span>
                  </div>
                  <OrderTimeline status={order.status} />
                </Panel>
                <Panel title="Order details" className="h-fit md:col-span-2">
                  <ul className="space-y-2 text-sm">
                    {order.items.map((i) => (
                      <li key={i.productId} className="flex justify-between gap-2">
                        <span>{i.quantity}× {i.name}</span>
                        <span className="tabular-nums">{formatINR(i.price * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
                    <span>Total</span>
                    <span>{formatINR(order.total)}</span>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
                </Panel>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
