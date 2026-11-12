import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageOpen, ReceiptText } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { ErrorState, LoadingState } from "@/components/site/States";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store";
import { formatINR } from "@/lib/pricing";
import { requireCustomer } from "@/lib/auth.server";

export const Route = createFileRoute("/orders")({
  beforeLoad: ({ location }) => requireCustomer(location.href),
  head: () => ({
    meta: [
      { title: "My orders — Biriyani Babu" },
      { name: "description", content: "View your Biriyani Babu order history." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { orders, ready, error, reload } = useStore();
  const customerOrders = orders;

  return (
    <ProtectedRoute>
      <SiteLayout>
        <PageHeader
          eyebrow="Account"
          title="My orders"
          description="Your recent Biriyani Babu orders and delivery status."
        />
        <div className="container-page py-12">
          {!ready ? (
            <LoadingState label="Loading your orders…" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void reload()} />
          ) : customerOrders.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-dashed bg-card p-8 text-center shadow-card">
              <PackageOpen className="mx-auto mb-4 h-10 w-10 text-gold" />
              <h2 className="text-2xl font-semibold">You haven't placed any orders yet.</h2>
              <p className="mt-3 text-muted-foreground">
                Start with your favourite biriyani and make your first order today.
              </p>
              <div className="mt-6 flex justify-center">
                <Button asChild variant="gold" size="xl" className="rounded-xl">
                  <Link to="/menu">Explore the menu</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Order ID
                      </p>
                      <h3 className="mt-1 text-xl font-semibold">{order.id}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-earth">
                        {order.status}
                      </span>
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                        {order.paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Order date
                      </p>
                      <p className="mt-1 font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Items
                      </p>
                      <p className="mt-1 font-medium">{order.items.length} item(s)</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Total
                      </p>
                      <p className="mt-1 font-medium">{formatINR(order.total)}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-gold" />
                      <span className="font-medium">Items</span>
                    </div>
                    <div className="space-y-2 text-sm text-foreground">
                      {order.items.map((item) => (
                        <div
                          key={`${order.id}-${item.productId}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>{formatINR(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <Button asChild variant="outline" size="lg" className="rounded-xl">
                      <Link to="/order/$orderId" params={{ orderId: order.id }}>
                        View details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SiteLayout>
    </ProtectedRoute>
  );
}
