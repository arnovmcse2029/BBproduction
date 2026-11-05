import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, CreditCard, Loader2, Lock } from "lucide-react";
import { useState } from "react";
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
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
import { formatINR } from "@/lib/pricing";
import { cn } from "@/lib/utils";
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
  head: () => ({
    meta: [
      { title: "Checkout — Biriyani Babu" },
      { name: "description", content: "Enter your delivery details and choose a payment method." },
      { property: "og:title", content: "Checkout — Biriyani Babu" },
      { property: "og:description", content: "Delivery details and payment for your Biriyani Babu order." },
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
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
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
  const { settings, placeOrder } = useStore();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>(settings.codEnabled ? "cod" : "online");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema) });

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
    try {
      const order = await placeOrder({
        customer: { fullName: v.fullName, phone: `+91 ${v.phone}` },
        address: {
          house: v.house,
          street: v.street,
          area: v.area,
          landmark: v.landmark || undefined,
          fullAddress: v.fullAddress,
          instructions: v.instructions || undefined,
        },
        items: cart.items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee,
        total: cart.total,
        paymentMethod: method,
      });
      cart.clear();
      navigate({ to: "/order/$orderId", params: { orderId: order.id } });
    } catch {
      toast.error("We couldn't place your order. Please try again.");
    }
  });

  const inputCls = (bad?: boolean) => cn("h-11 bg-background", bad && "border-destructive");

  return (
    <SiteLayout>
      <PageHeader eyebrow="Checkout" title="Almost there" description="Tell us where to bring your biriyani." />
      <form onSubmit={onSubmit} noValidate className="container-page grid gap-8 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Your details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="fullName" label="Full name" error={errors.fullName?.message}>
                <Input id="fullName" autoComplete="name" className={inputCls(!!errors.fullName)} aria-invalid={!!errors.fullName} {...register("fullName")} />
              </Field>
              <Field id="phone" label="Mobile number" error={errors.phone?.message}>
                <div className="flex">
                  <span className="inline-flex h-11 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">+91</span>
                  <Input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98XXXXXXXX" className={cn(inputCls(!!errors.phone), "rounded-l-none")} aria-invalid={!!errors.phone} {...register("phone")} />
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
              <Field id="fullAddress" label="Complete delivery address" error={errors.fullAddress?.message} className="sm:col-span-2">
                <Textarea id="fullAddress" rows={3} autoComplete="street-address" className={cn("bg-background", errors.fullAddress && "border-destructive")} {...register("fullAddress")} />
              </Field>
              <Field id="instructions" label="Delivery instructions" optional className="sm:col-span-2">
                <Textarea id="instructions" rows={2} placeholder="e.g. Ring the bell twice, leave at the gate" className="bg-background" {...register("instructions")} />
              </Field>
            </div>
          </Panel>

          <Panel title="Payment method">
            <div role="radiogroup" aria-label="Payment method" className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                selected={method === "online"}
                onSelect={() => setMethod("online")}
                icon={<CreditCard className="h-5 w-5" />}
                title="Online payment"
                text="UPI, cards, net banking"
              />
              <PaymentOption
                selected={method === "cod"}
                onSelect={() => settings.codEnabled && setMethod("cod")}
                disabled={!settings.codEnabled}
                icon={<Banknote className="h-5 w-5" />}
                title="Cash on Delivery"
                text={settings.codEnabled ? "Pay when your food arrives" : "Not available right now"}
              />
            </div>
            {method === "online" && (
              <div className="mt-4">
                <DemoNotice>
                  Online payment isn't connected yet. Your order will be saved with payment <strong>pending</strong> —
                  no money will be taken.
                </DemoNotice>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Order summary" className="h-fit lg:sticky lg:top-28">
          <ul className="mb-5 space-y-3 border-b pb-5">
            {cart.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">{i.quantity}×</span> {i.name}
                </span>
                <span className="tabular-nums">{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <SummaryRows subtotal={cart.subtotal} deliveryFee={cart.deliveryFee} total={cart.total} />
          <Button type="submit" variant="gold" size="xl" className="mt-6 w-full" disabled={isSubmitting || !settings.acceptingOrders || !settings.isOpen}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Lock />}
            Place order · {formatINR(cart.total)}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Demo checkout — orders are saved in this browser until the restaurant's system is connected.
          </p>
        </Panel>
      </form>
    </SiteLayout>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon,
  title,
  text,
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-gold bg-gold/10" : "border-border bg-background hover:border-gold/50",
      )}
    >
      <span className={cn("mt-0.5", selected ? "text-earth" : "text-muted-foreground")}>{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">{text}</span>
      </span>
    </button>
  );
}
