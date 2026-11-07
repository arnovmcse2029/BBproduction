import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  IndianRupee,
  Package,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AdminCard,
  AdminPageHeader,
  PaymentBadge,
  StatCard,
  StatusBadge,
} from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, categoryLabel } from "@/data/mock";
import { ORDER_STATUSES } from "@/types";
import type {
  Offer,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  RestaurantSettings,
} from "@/types";
import { useStore } from "@/context/store";

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );

function useAdminAction() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<void>) => {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  };
  return { error, busy, run };
}

function ActionError({ children }: { children: ReactNode }) {
  return children ? (
    <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
      {children}
    </p>
  ) : null;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

function OrderTable({
  orders,
  onStatusChange,
}: {
  orders: Order[];
  onStatusChange?: (id: string, status: OrderStatus) => void;
}) {
  if (!orders.length) return <EmptyState>No orders match this view yet.</EmptyState>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b text-xs uppercase text-muted-foreground">
          <tr>
            {["Order", "Customer", "Items", "Total", "Payment", "Status", "Placed"].map((item) => (
              <th className="px-3 py-3 font-medium" key={item}>
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr className="border-b last:border-0" key={order.id}>
              <td className="px-3 py-3 font-medium">{order.id}</td>
              <td className="px-3 py-3">
                <span className="block font-medium">{order.customer.fullName}</span>
                <span className="text-xs text-muted-foreground">{order.customer.phone}</span>
              </td>
              <td className="px-3 py-3">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
              </td>
              <td className="px-3 py-3 font-medium">{money(order.total)}</td>
              <td className="px-3 py-3">
                <PaymentBadge status={order.paymentStatus} />
              </td>
              <td className="px-3 py-3">
                {onStatusChange ? (
                  <select
                    aria-label={`Update status for ${order.id}`}
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                    value={order.status}
                    onChange={(event) =>
                      onStatusChange(order.id, event.target.value as OrderStatus)
                    }
                  >
                    {[...ORDER_STATUSES, "cancelled"].map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("-", " ")}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={order.status} />
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                {dateTime(order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminDashboard() {
  const { orders, products, settings } = useStore();
  const today = new Date().toDateString();
  const todaysOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today);
  const revenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);
  const pending = orders.filter((order) =>
    ["received", "accepted", "preparing"].includes(order.status),
  ).length;
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  return (
    <>
      <AdminPageHeader title="Dashboard" description="Your restaurant at a glance." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's orders"
          value={todaysOrders.length}
          hint="Orders placed today"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          label="Paid revenue"
          value={money(revenue)}
          hint="All-time confirmed payments"
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          label="Needs attention"
          value={pending}
          hint="Received, accepted or preparing"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          label="Menu items"
          value={products.length}
          hint={`${products.filter((product) => product.isAvailable).length} currently available`}
          icon={<Package className="h-4 w-4" />}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
        <AdminCard
          title="Recent orders"
          actions={
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/orders">View all</Link>
            </Button>
          }
        >
          <OrderTable orders={recentOrders} />
        </AdminCard>
        <div className="space-y-6">
          <AdminCard title="Restaurant status">
            <div className="space-y-4">
              <p className="flex items-center justify-between text-sm">
                <span>Restaurant</span>
                <strong>{settings.isOpen ? "Open" : "Closed"}</strong>
              </p>
              <p className="flex items-center justify-between text-sm">
                <span>Online orders</span>
                <strong>{settings.acceptingOrders ? "Accepting" : "Paused"}</strong>
              </p>
              <p className="flex items-center justify-between text-sm">
                <span>Estimated delivery</span>
                <strong>{settings.estimatedDeliveryMins} min</strong>
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/settings">Manage settings</Link>
              </Button>
            </div>
          </AdminCard>
          <AdminCard title="Quick links">
            <div className="grid gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/products">
                  <Package /> Manage menu
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/analytics">
                  <BarChart3 /> View sales analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/admin/customers">
                  <Users /> Browse customers
                </Link>
              </Button>
            </div>
          </AdminCard>
        </div>
      </div>
    </>
  );
}

export function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { error, busy, run } = useAdminAction();
  const filtered = orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customer.fullName} ${order.customer.phone}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesQuery && (filter === "all" || order.status === filter);
  });
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description={`${orders.length} orders · Update an order's status as it moves through the kitchen.`}
      />
      <AdminCard>
        <ActionError>{error}</ActionError>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order, customer or phone"
              className="pl-9"
            />
          </div>
          <select
            aria-label="Filter orders by status"
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {[...ORDER_STATUSES, "cancelled"].map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("-", " ")}
              </option>
            ))}
          </select>
        </div>
        <OrderTable
          orders={filtered}
          onStatusChange={(id, status) => void run(() => updateOrderStatus(id, status))}
        />
        {busy && <p className="mt-3 text-xs text-muted-foreground">Saving order status…</p>}
      </AdminCard>
    </>
  );
}

type ProductDraft = Omit<Product, "id">;
const emptyProduct: ProductDraft = {
  name: "",
  description: "",
  price: 0,
  category: "chicken-biriyani",
  isVeg: false,
  isAvailable: true,
  isBestseller: false,
};

function ProductEditor({
  product,
  onSave,
  onCancel,
  busy,
}: {
  product: Product | undefined;
  onSave: (draft: ProductDraft) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [draft, setDraft] = useState<ProductDraft>(
    product
      ? {
          name: product.name,
          description: product.description,
          ...(product.longDescription !== undefined
            ? { longDescription: product.longDescription }
            : {}),
          price: product.price,
          category: product.category,
          ...(product.image !== undefined ? { image: product.image } : {}),
          isVeg: product.isVeg,
          isAvailable: product.isAvailable,
          isBestseller: product.isBestseller,
          ...(product.serves !== undefined ? { serves: product.serves } : {}),
        }
      : emptyProduct,
  );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave(draft);
  };
  return (
    <form className="mb-6 space-y-4 rounded-lg border bg-muted/30 p-4" onSubmit={submit}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{product ? "Edit menu item" : "Add menu item"}</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cancel editing"
          onClick={onCancel}
        >
          <X />
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          Name
          <Input
            required
            maxLength={80}
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          Price (₹)
          <Input
            required
            type="number"
            min="1"
            step="1"
            value={draft.price}
            onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
          />
        </label>
        <label className="space-y-1 text-sm">
          Category
          <select
            className="h-10 w-full rounded-md border bg-background px-3"
            value={draft.category}
            onChange={(event) =>
              setDraft({ ...draft, category: event.target.value as ProductCategory })
            }
          >
            {CATEGORIES.filter((category) => category.id !== "all").map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Short description
          <Input
            required
            maxLength={180}
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          Image URL (optional)
          <Input
            value={draft.image ?? ""}
            onChange={(event) => setDraft({ ...draft, image: event.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          Serves (optional)
          <Input
            value={draft.serves ?? ""}
            onChange={(event) => setDraft({ ...draft, serves: event.target.value })}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-5 text-sm">
        {(
          [
            ["isAvailable", "Available to order"],
            ["isVeg", "Vegetarian"],
            ["isBestseller", "Bestseller"],
          ] as const
        ).map(([field, label]) => (
          <label key={field} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft[field]}
              onChange={(event) => setDraft({ ...draft, [field]: event.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          <Save />
          {product ? "Save changes" : "Add item"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AdminProducts() {
  const { products, createProduct, updateProduct, deleteProduct } = useStore();
  const [editor, setEditor] = useState<Product | "new" | null>(null);
  const [query, setQuery] = useState("");
  const { error, busy, run } = useAdminAction();
  const filtered = products.filter((product) =>
    `${product.name} ${categoryLabel(product.category)}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Create menu items, update prices and control availability."
        actions={
          <Button onClick={() => setEditor("new")}>
            <Plus /> Add product
          </Button>
        }
      />
      <AdminCard>
        <ActionError>{error}</ActionError>
        {editor && (
          <ProductEditor
            key={editor === "new" ? "new" : editor.id}
            product={editor === "new" ? undefined : editor}
            busy={busy}
            onCancel={() => setEditor(null)}
            onSave={(draft) =>
              void run(async () => {
                if (editor === "new") await createProduct(draft);
                else await updateProduct(editor.id, draft);
                setEditor(null);
              })
            }
          />
        )}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search menu items"
            className="pl-9"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                {["Item", "Category", "Price", "Availability", "Actions"].map((item) => (
                  <th className="px-3 py-3 font-medium" key={item}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="px-3 py-3">
                    <span className="font-medium">{product.name}</span>
                    <span className="block max-w-sm truncate text-xs text-muted-foreground">
                      {product.description}
                    </span>
                  </td>
                  <td className="px-3 py-3">{categoryLabel(product.category)}</td>
                  <td className="px-3 py-3">{money(product.price)}</td>
                  <td className="px-3 py-3">{product.isAvailable ? "Available" : "Unavailable"}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditor(product)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        aria-label={`Delete ${product.name}`}
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(`Delete "${product.name}" from the menu?`))
                            void run(() => deleteProduct(product.id));
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <EmptyState>No menu items match your search.</EmptyState>}
        </div>
      </AdminCard>
    </>
  );
}

export function AdminCustomers() {
  const { orders } = useStore();
  const [query, setQuery] = useState("");
  const customers = useMemo(() => {
    const grouped = new Map<
      string,
      { name: string; phone: string; orders: number; spend: number; lastOrder: string }
    >();
    for (const order of orders) {
      const key = order.customer.phone || order.customer.fullName;
      const existing = grouped.get(key);
      if (existing) {
        existing.orders += 1;
        existing.spend += order.total;
        if (order.createdAt > existing.lastOrder) existing.lastOrder = order.createdAt;
      } else
        grouped.set(key, {
          name: order.customer.fullName,
          phone: order.customer.phone,
          orders: 1,
          spend: order.total,
          lastOrder: order.createdAt,
        });
    }
    return [...grouped.values()].sort((a, b) => b.orders - a.orders);
  }, [orders]);
  const filtered = customers.filter((customer) =>
    `${customer.name} ${customer.phone}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Customer details and order history, gathered from placed orders."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Customers" value={customers.length} icon={<Users />} />
        <StatCard
          label="Repeat customers"
          value={customers.filter((customer) => customer.orders > 1).length}
          hint="More than one order"
          icon={<ShoppingBag />}
        />
      </div>
      <AdminCard title="Customer directory">
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or phone"
            className="pl-9"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                {["Customer", "Phone", "Orders", "Lifetime spend", "Last order"].map((item) => (
                  <th key={item} className="px-3 py-3 font-medium">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.phone || customer.name} className="border-b last:border-0">
                  <td className="px-3 py-3 font-medium">{customer.name}</td>
                  <td className="px-3 py-3">{customer.phone || "—"}</td>
                  <td className="px-3 py-3">{customer.orders}</td>
                  <td className="px-3 py-3">{money(customer.spend)}</td>
                  <td className="px-3 py-3">{dateTime(customer.lastOrder)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <EmptyState>No customers match your search.</EmptyState>}
        </div>
      </AdminCard>
    </>
  );
}

export function AdminPayments() {
  const { orders } = useStore();
  const [filter, setFilter] = useState("all");
  const paid = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);
  const pending = orders
    .filter((order) => order.paymentStatus === "pending")
    .reduce((sum, order) => sum + order.total, 0);
  const payments = orders.filter((order) => filter === "all" || order.paymentStatus === filter);
  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Payment records are read from orders. Payment processing and refunds are not connected in this demo."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Paid"
          value={money(paid)}
          hint="Confirmed payment totals"
          icon={<ArrowUpRight />}
        />
        <StatCard
          label="Pending"
          value={money(pending)}
          hint="Awaiting online payment"
          icon={<ArrowDownRight />}
        />
      </div>
      <AdminCard
        title="Transactions"
        actions={
          <select
            aria-label="Filter payments by status"
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All payments</option>
            {["paid", "pending", "cod", "failed", "refunded"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        }
      >
        {!payments.length ? (
          <EmptyState>No payment records found.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  {["Order", "Customer", "Method", "Amount", "Payment status", "Date"].map(
                    (item) => (
                      <th key={item} className="px-3 py-3 font-medium">
                        {item}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {payments.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-3 py-3 font-medium">{order.id}</td>
                    <td className="px-3 py-3">{order.customer.fullName}</td>
                    <td className="px-3 py-3 uppercase">
                      {order.paymentMethod === "cod" ? "Cash on delivery" : "Online"}
                    </td>
                    <td className="px-3 py-3">{money(order.total)}</td>
                    <td className="px-3 py-3">
                      <PaymentBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-3 py-3">{dateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </>
  );
}

export function AdminOffers() {
  const { settings, saveSettings } = useStore();
  const { error, busy, run } = useAdminAction();
  const [draft, setDraft] = useState<Offer>({
    id: "",
    title: "",
    description: "",
    code: "",
    active: true,
  });
  const [editing, setEditing] = useState(false);
  const save = (offers: Offer[]) => run(() => saveSettings({ ...settings, offers }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const promoCode = draft.code?.trim();
    const offer: Offer = {
      ...draft,
      id: draft.id || `offer-${Date.now().toString(36)}`,
      ...(promoCode ? { code: promoCode } : {}),
    };
    void run(async () => {
      await saveSettings({
        ...settings,
        offers: editing
          ? settings.offers.map((item) => (item.id === offer.id ? offer : item))
          : [...settings.offers, offer],
      });
      setDraft({ id: "", title: "", description: "", code: "", active: true });
      setEditing(false);
    });
  };
  return (
    <>
      <AdminPageHeader
        title="Offers & Banners"
        description="Manage promotional offers displayed with your restaurant's menu."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <AdminCard title={editing ? "Edit offer" : "Create offer"}>
          <ActionError>{error}</ActionError>
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1 text-sm">
              Offer title
              <Input
                required
                maxLength={100}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </label>
            <label className="block space-y-1 text-sm">
              Description
              <Input
                required
                maxLength={200}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </label>
            <label className="block space-y-1 text-sm">
              Promo code (optional)
              <Input
                value={draft.code ?? ""}
                onChange={(event) => setDraft({ ...draft, code: event.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
              />{" "}
              Offer is active
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                <Save />
                {editing ? "Save offer" : "Add offer"}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setDraft({ id: "", title: "", description: "", code: "", active: true });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </AdminCard>
        <AdminCard title="Current promotions">
          {!settings.offers.length ? (
            <EmptyState>No offers yet. Create one to promote a deal.</EmptyState>
          ) : (
            <div className="space-y-3">
              {settings.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{offer.title}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${offer.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                      >
                        {offer.active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>
                    {offer.code && (
                      <p className="mt-2 text-xs">
                        Code: <code>{offer.code}</code>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void save(
                          settings.offers.map((item) =>
                            item.id === offer.id ? { ...item, active: !item.active } : item,
                          ),
                        )
                      }
                    >
                      {offer.active ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDraft({ ...offer });
                        setEditing(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      aria-label={`Delete ${offer.title}`}
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`Delete offer "${offer.title}"?`))
                          void save(settings.offers.filter((item) => item.id !== offer.id));
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </>
  );
}

export function AdminAnalytics() {
  const { orders, products } = useStore();
  const [days, setDays] = useState(7);
  const series = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const daily = orders.filter(
        (order) => new Date(order.createdAt).toDateString() === date.toDateString(),
      );
      return {
        date,
        count: daily.length,
        revenue: daily
          .filter((order) => order.paymentStatus === "paid")
          .reduce((sum, order) => sum + order.total, 0),
      };
    });
  }, [days, orders]);
  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) =>
      order.items.forEach((item) =>
        counts.set(item.name, (counts.get(item.name) ?? 0) + item.quantity),
      ),
    );
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);
  const periodOrders = series.reduce((sum, day) => sum + day.count, 0);
  const periodRevenue = series.reduce((sum, day) => sum + day.revenue, 0);
  const average = periodOrders ? periodRevenue / periodOrders : 0;
  const maxRevenue = Math.max(...series.map((day) => day.revenue), 1);
  return (
    <>
      <AdminPageHeader
        title="Sales Analytics"
        description="Order and confirmed-payment trends from your order history."
        actions={
          <select
            aria-label="Analytics date range"
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Orders in period" value={periodOrders} icon={<ShoppingBag />} />
        <StatCard
          label="Paid revenue in period"
          value={money(periodRevenue)}
          icon={<IndianRupee />}
        />
        <StatCard label="Average paid order" value={money(average)} icon={<BarChart3 />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
        <AdminCard title="Daily paid revenue">
          <div className="flex h-64 items-end gap-1 border-b border-l px-2 pb-0 pt-5 sm:gap-2">
            {series.map((day) => (
              <div
                key={day.date.toISOString()}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="invisible whitespace-nowrap text-[10px] group-hover:visible">
                  {money(day.revenue)}
                </span>
                <div
                  className="w-full max-w-10 rounded-t bg-gold transition-all"
                  style={{
                    height: `${Math.max((day.revenue / maxRevenue) * 70, day.revenue ? 3 : 0)}%`,
                  }}
                  title={`${day.date.toLocaleDateString()}: ${money(day.revenue)}`}
                />
                <span className="pb-2 text-[10px] text-muted-foreground">
                  {day.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Only orders marked as paid are counted as revenue.
          </p>
        </AdminCard>
        <AdminCard title="Top selling items">
          {topProducts.length ? (
            <ol className="space-y-4">
              {topProducts.map(([name, count], index) => (
                <li key={name} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                      {index + 1}
                    </span>
                    <span className="truncate text-sm">{name}</span>
                  </span>
                  <strong className="text-sm">{count} sold</strong>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState>Sales will appear when orders are placed.</EmptyState>
          )}
          <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
            {products.length} menu items available for sale.
          </p>
        </AdminCard>
      </div>
    </>
  );
}

function SettingsField({
  label,
  value,
  type = "text",
  onChange,
  ...inputProps
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
  [key: string]: unknown;
}) {
  return (
    <label className="block space-y-1 text-sm">
      {label}
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </label>
  );
}

export function AdminSettings() {
  const { settings, saveSettings } = useStore();
  const [draft, setDraft] = useState<RestaurantSettings>(settings);
  const { error, busy, run } = useAdminAction();
  useEffect(() => setDraft(settings), [settings]);
  const update = <K extends keyof RestaurantSettings>(key: K, value: RestaurantSettings[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const save = (event: FormEvent) => {
    event.preventDefault();
    void run(() => saveSettings(draft));
  };
  return (
    <>
      <AdminPageHeader
        title="Restaurant Settings"
        description="Control ordering, delivery, contact details and opening hours."
      />
      <form onSubmit={save} className="space-y-6">
        <ActionError>{error}</ActionError>
        <div className="grid gap-6 xl:grid-cols-2">
          <AdminCard title="Ordering & delivery">
            <div className="space-y-5">
              {(
                [
                  ["isOpen", "Restaurant is open"],
                  ["acceptingOrders", "Accept online orders"],
                  ["codEnabled", "Cash on delivery enabled"],
                ] as const
              ).map(([field, label]) => (
                <label
                  key={field}
                  className="flex items-center justify-between gap-4 border-b pb-4 text-sm"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={draft[field]}
                    onChange={(event) => update(field, event.target.checked)}
                  />
                </label>
              ))}
              <SettingsField
                label="Delivery fee (₹)"
                type="number"
                min="0"
                value={draft.deliveryFee}
                onChange={(value) => update("deliveryFee", Number(value))}
              />
              <SettingsField
                label="Free delivery above (₹, 0 disables)"
                type="number"
                min="0"
                value={draft.freeDeliveryAbove}
                onChange={(value) => update("freeDeliveryAbove", Number(value))}
              />
              <SettingsField
                label="Minimum order value (₹)"
                type="number"
                min="0"
                value={draft.minOrderValue}
                onChange={(value) => update("minOrderValue", Number(value))}
              />
              <SettingsField
                label="Estimated delivery (minutes)"
                type="number"
                min="1"
                value={draft.estimatedDeliveryMins}
                onChange={(value) => update("estimatedDeliveryMins", Number(value))}
              />
            </div>
          </AdminCard>
          <AdminCard title="Contact details">
            <div className="space-y-4">
              <SettingsField
                label="Phone"
                type="tel"
                value={draft.phone}
                onChange={(value) => update("phone", value)}
              />
              <SettingsField
                label="Email"
                type="email"
                value={draft.email}
                onChange={(value) => update("email", value)}
              />
              <label className="block space-y-1 text-sm">
                Address
                <textarea
                  className="min-h-24 w-full rounded-md border bg-background px-3 py-2"
                  value={draft.address}
                  onChange={(event) => update("address", event.target.value)}
                />
              </label>
              <SettingsField
                label="Instagram URL"
                value={draft.social.instagram}
                onChange={(value) => update("social", { ...draft.social, instagram: value })}
              />
              <SettingsField
                label="Facebook URL"
                value={draft.social.facebook}
                onChange={(value) => update("social", { ...draft.social, facebook: value })}
              />
              <SettingsField
                label="YouTube URL"
                value={draft.social.youtube}
                onChange={(value) => update("social", { ...draft.social, youtube: value })}
              />
            </div>
          </AdminCard>
        </div>
        <AdminCard title="Opening hours">
          <div className="space-y-3">
            {draft.hours.map((hours, index) => (
              <div
                key={hours.day}
                className="grid items-center gap-3 border-b pb-3 last:border-0 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <span className="text-sm font-medium">{hours.day}</span>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Opens
                  <input
                    type="time"
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"
                    disabled={hours.closed}
                    value={hours.open}
                    onChange={(event) =>
                      update(
                        "hours",
                        draft.hours.map((item, i) =>
                          i === index ? { ...item, open: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  Closes
                  <input
                    type="time"
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"
                    disabled={hours.closed}
                    value={hours.close}
                    onChange={(event) =>
                      update(
                        "hours",
                        draft.hours.map((item, i) =>
                          i === index ? { ...item, close: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(event) =>
                      update(
                        "hours",
                        draft.hours.map((item, i) =>
                          i === index ? { ...item, closed: event.target.checked } : item,
                        ),
                      )
                    }
                  />{" "}
                  Closed
                </label>
              </div>
            ))}
          </div>
        </AdminCard>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>
            <Save />
            {busy ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </>
  );
}
