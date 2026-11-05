import { formatINR } from "@/lib/pricing";
import type { ReactNode } from "react";

export function SummaryRows({
  subtotal,
  deliveryFee,
  total,
}: {
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-medium tabular-nums">{formatINR(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Delivery fee</dt>
        <dd className="font-medium tabular-nums">{deliveryFee === 0 ? "Free" : formatINR(deliveryFee)}</dd>
      </div>
      <div className="flex justify-between border-t pt-3 text-base">
        <dt className="font-semibold">Total payable</dt>
        <dd className="font-display text-xl font-semibold tabular-nums">{formatINR(total)}</dd>
      </div>
    </dl>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-6 shadow-card ${className ?? ""}`}>
      {title && <h2 className="mb-5 text-xl font-semibold">{title}</h2>}
      {children}
    </div>
  );
}
