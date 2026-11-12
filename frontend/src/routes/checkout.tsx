import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, CheckCircle2, CreditCard, Loader2, Lock, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel, SummaryRows } from "@/components/site/OrderSummary";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { DemoNotice, EmptyState } from "@/components/site/States";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
import { formatINR, meetsMinimumOrderValue } from "@/lib/pricing";
import { requireCustomer } from "@/lib/auth.server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { paymentsService } from "@/services/payments.service";
import type { PaymentMethod } from "@/types";

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+?91/, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number"),
  house: z.string().trim().min(1, "House / building number is required").max(60),
  street: z.string().trim().min(2, "Street / locality is required").max(120),
  area: z.string().trim().min(2, "Area is required").max(80),
  landmark: z.string().trim().max(120).optional(),
  fullAddress: z.string().trim().min(10, "Please enter the complete delivery address").max(300),
  instructions: z.string().trim().max(300).optional(),
});

type CheckoutValues = z.input<typeof checkoutSchema>;

export const Route = createFileRoute("/checkout")({
  beforeLoad: ({ location }) => requireCustomer(location.href),
  head: () => ({
    meta: [
      { title: "Checkout — Biriyani Babu" },
      { name: "description", content: "Enter your delivery details and choose a payment method." },
      { property: "og:title", content: "Checkout — Biriyani Babu" },
      {
        property: "og:description",
        content: "Delivery details and payment for your Biriyani Babu order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function Field({
  id,
  label,
  error,
  optional,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  optional?: boolean | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckoutPage() {
  const cart = useCart();
  const { settings, settingsError, settingsUpdatedAt, ready, placeOrder, reload } = useStore();
  const { isAuthenticated, user, addresses } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>(settings.codEnabled ? "cod" : "online");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? defaultAddress,
    [addresses, defaultAddress, selectedAddressId],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/checkout" }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user || !selectedAddress) return;
    setSelectedAddressId(selectedAddress.id);
    setValue("fullName", `${user.firstName} ${user.lastName}`.trim());
    setValue("phone", user.mobile.replace(/\D/g, "").slice(-10));
    setValue("house", selectedAddress.house);
    setValue("street", selectedAddress.street);
    setValue("area", selectedAddress.locality);
    setValue("landmark", selectedAddress.landmark ?? "");
    setValue(
      "fullAddress",
      selectedAddress.fullAddress ||
        `${selectedAddress.house}, ${selectedAddress.street}, ${selectedAddress.locality}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`,
    );
  }, [selectedAddress, setValue, user]);

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <PageHeader
          eyebrow="Checkout"
          title="Redirecting to login"
          description="Please sign in to continue your order."
        />
        <div className="container-page py-12">
          <EmptyState
            title="Secure checkout"
            description="We are redirecting you to login so your cart and order details stay protected."
          />
        </div>
      </SiteLayout>
    );
  }

  if (cart.items.length === 0) {
    return (
      <SiteLayout>
        <PageHeader eyebrow="Checkout" title="Checkout" />
        <div className="container-page py-12">
          <EmptyState
            title="Nothing to check out yet"
            description="Your cart is empty."
            action={
              <Button asChild size="xl">
                <Link to="/menu">Browse the menu</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  const onSubmit = handleSubmit(async (raw) => {
    const v = checkoutSchema.parse(raw);
    if (!user?.id) {
      toast.error("Your customer session is unavailable. Sign in again before placing an order.");
      return;
    }
    if (isSupabaseConfigured() && (!ready || settingsError || !settingsUpdatedAt)) {
      toast.error(settingsError ?? "Restaurant order settings are still loading.");
      return;
    }
    if (!settings.isOpen || !settings.acceptingOrders) {
      toast.error("The restaurant is not accepting orders right now.");
      return;
    }
    if (!meetsMinimumOrderValue(cart.subtotal, settings.minOrderValue)) {
      toast.error(`The minimum order value is ${formatINR(settings.minOrderValue)}.`);
      return;
    }
    if (method === "cod" && !settings.codEnabled) {
      toast.error("Cash on delivery is currently unavailable.");
      return;
    }
    if (!selectedAddress) {
      toast.error("Add and select a saved delivery address before placing your order.");
      return;
    }
    if (method === "online" && !paymentsService.isOnlinePaymentAvailable()) {
      toast.error("Online payment is not available yet. Choose cash on delivery.");
      return;
    }
    try {
      const order = await placeOrder({
        userId: user.id,
        addressId: selectedAddress.id,
        customer: { fullName: v.fullName, phone: `+91 ${v.phone}`, email: user?.email },
        address: {
          house: v.house,
          street: v.street,
          area: v.area,
          landmark: v.landmark || undefined,
          fullAddress: v.fullAddress,
          instructions: v.instructions || undefined,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
        },
        items: cart.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee,
        total: cart.total,
        paymentMethod: method,
        settingsUpdatedAt: settingsUpdatedAt ?? "",
      });
      cart.clear();
      navigate({ to: "/order/$orderId", params: { orderId: order.id } });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Order pricing settings changed")) {
        await reload();
        toast.error(
          "Delivery settings changed. Review the updated total and place your order again.",
        );
        return;
      }
      toast.error(error instanceof Error ? error.message : "We couldn't place your order.");
    }
  });

  const inputCls = (bad?: boolean) => cn("h-11 bg-background", bad && "border-destructive");

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Checkout"
        title="Almost there"
        description="Tell us where to bring your biriyani."
      />
      <div className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <form onSubmit={onSubmit} noValidate className="space-y-6 lg:col-span-2">
          <Panel title="Saved delivery addresses">
            <div className="space-y-3">
              {addresses.length > 0 ? (
                addresses.map((address) => {
                  const selected = selectedAddress?.id === address.id;
                  return (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                        selected
                          ? "border-gold bg-gold/5 shadow-sm"
                          : "border-border bg-background hover:border-gold/40",
                      )}
                    >
                      <span className="mt-1 rounded-full bg-gold/10 p-2 text-gold">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {address.addressType}
                          </span>
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.68rem] font-medium text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Default
                            </span>
                          )}
                        </span>
                        <span className="mt-2 block text-sm text-muted-foreground">
                          {address.house}, {address.street}, {address.locality}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {address.city}, {address.state} - {address.pincode}
                        </span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No saved addresses yet. Add a delivery address before ordering.
                </p>
              )}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link to="/addresses" search={{ return: "/checkout" }}>
                  Add new address
                </Link>
              </Button>
            </div>
          </Panel>

          <Panel title="Your details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="fullName" label="Full name" error={errors.fullName?.message}>
                <Input
                  id="fullName"
                  autoComplete="name"
                  className={inputCls(!!errors.fullName)}
                  aria-invalid={!!errors.fullName}
                  {...register("fullName")}
                />
              </Field>
              <Field id="phone" label="Mobile number" error={errors.phone?.message}>
                <div className="flex">
                  <span className="inline-flex h-11 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98XXXXXXXX"
                    className={cn(inputCls(!!errors.phone), "rounded-l-none")}
                    aria-invalid={!!errors.phone}
                    {...register("phone")}
                  />
                </div>
              </Field>
            </div>
          </Panel>

          <Panel title="Delivery address">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="house" label="House / building number" error={errors.house?.message}>
                <Input id="house" className={inputCls(!!errors.house)} {...register("house")} />
              </Field>
              <Field id="street" label="Street / locality" error={errors.street?.message}>
                <Input id="street" className={inputCls(!!errors.street)} {...register("street")} />
              </Field>
              <Field id="area" label="Area" error={errors.area?.message}>
                <Input id="area" className={inputCls(!!errors.area)} {...register("area")} />
              </Field>
              <Field id="landmark" label="Landmark" optional error={errors.landmark?.message}>
                <Input id="landmark" className={inputCls()} {...register("landmark")} />
              </Field>
              <Field
                id="fullAddress"
                label="Complete delivery address"
                error={errors.fullAddress?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="fullAddress"
                  rows={3}
                  autoComplete="street-address"
                  className={cn("bg-background", errors.fullAddress && "border-destructive")}
                  {...register("fullAddress")}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Delivery notes">
            <Field
              id="instructions"
              label="Any delivery instructions?"
              optional
              error={errors.instructions?.message}
            >
              <Textarea
                id="instructions"
                rows={3}
                placeholder="Example: Please ring the bell, leave at the gate, or call on arrival."
                className={cn("bg-background", errors.instructions && "border-destructive")}
                {...register("instructions")}
              />
            </Field>
          </Panel>
        </form>

        <aside className="space-y-6">
          <Panel
            title="Payment method"
            className="rounded-2xl border border-border bg-card shadow-card"
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMethod("cod")}
                disabled={!settings.codEnabled}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left",
                  method === "cod" ? "border-gold bg-gold/5" : "border-border bg-background",
                  !settings.codEnabled && "cursor-not-allowed opacity-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gold/10 p-2 text-gold">
                    <Banknote className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Cash on delivery</p>
                    <p className="text-xs text-muted-foreground">
                      {settings.codEnabled
                        ? "Pay when your order arrives"
                        : "Currently unavailable"}
                    </p>
                  </div>
                </div>
                {method === "cod" && <CheckCircle2 className="h-4 w-4 text-gold" />}
              </button>

              <button
                type="button"
                onClick={() => setMethod("online")}
                disabled={!paymentsService.isOnlinePaymentAvailable()}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left",
                  method === "online" ? "border-gold bg-gold/5" : "border-border bg-background",
                  !paymentsService.isOnlinePaymentAvailable() && "cursor-not-allowed opacity-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gold/10 p-2 text-gold">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Online payment</p>
                    <p className="text-xs text-muted-foreground">Razorpay is not connected yet</p>
                  </div>
                </div>
                {method === "online" && <CheckCircle2 className="h-4 w-4 text-gold" />}
              </button>
              {!settings.codEnabled && !paymentsService.isOnlinePaymentAvailable() && (
                <p className="text-sm text-destructive" role="status">
                  No payment methods are available right now. Please contact the restaurant.
                </p>
              )}
            </div>
          </Panel>

          <Panel
            title="Order summary"
            className="rounded-2xl border border-border bg-card shadow-card"
          >
            <SummaryRows
              subtotal={cart.subtotal}
              deliveryFee={cart.deliveryFee}
              total={cart.total}
            />
            <DemoNotice>
              {isSupabaseConfigured()
                ? "Order totals and item prices are verified by Supabase. Online payments remain pending until Razorpay is connected."
                : "Demo checkout mode only. Orders are saved in this browser for local preview."}
            </DemoNotice>
            {settingsError && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                Checkout is unavailable because restaurant pricing could not be verified:{" "}
                {settingsError}
              </p>
            )}
            {!meetsMinimumOrderValue(cart.subtotal, settings.minOrderValue) && (
              <p className="mt-3 text-sm text-destructive" role="status">
                Add {formatINR(settings.minOrderValue - cart.subtotal)} more to meet the minimum
                order value of {formatINR(settings.minOrderValue)}.
              </p>
            )}
            {(!settings.isOpen || !settings.acceptingOrders) && (
              <p className="mt-3 text-sm text-destructive" role="status">
                The restaurant is not accepting orders right now.
              </p>
            )}

            <Button
              type="button"
              onClick={() => void onSubmit()}
              variant="gold"
              size="xl"
              className="mt-5 w-full rounded-xl font-semibold shadow-gold"
              disabled={
                isSubmitting ||
                (isSupabaseConfigured() && (!ready || !!settingsError || !settingsUpdatedAt)) ||
                !selectedAddress ||
                !settings.isOpen ||
                !settings.acceptingOrders ||
                !meetsMinimumOrderValue(cart.subtotal, settings.minOrderValue) ||
                (method === "cod" && !settings.codEnabled) ||
                (method === "online" && !paymentsService.isOnlinePaymentAvailable())
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Place order · ${formatINR(cart.total)}`
              )}
            </Button>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              {isSupabaseConfigured()
                ? "Secure Supabase order creation"
                : "Secure mock checkout (frontend demo only)"}
            </div>
          </Panel>
        </aside>
      </div>
    </SiteLayout>
  );
}
