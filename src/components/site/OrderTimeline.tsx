import { Bike, Check, ChefHat, ClipboardCheck, PackageCheck, Receipt, XCircle } from "lucide-react";
import { STATUS_LABEL, stepIndex } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

const ICONS = [Receipt, ClipboardCheck, ChefHat, PackageCheck, Bike, Check];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-destructive">
        <XCircle className="h-6 w-6" />
        <p className="font-medium">This order was cancelled.</p>
      </div>
    );
  }
  const current = stepIndex(status);
  return (
    <ol className="relative space-y-0">
      {ORDER_STATUSES.map((s, i) => {
        const Icon = ICONS[i] ?? Check;
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="relative flex gap-4 pb-8 last:pb-0">
            {i < ORDER_STATUSES.length - 1 && (
              <span
                className={cn(
                  "absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5",
                  done ? "bg-gold" : "bg-border",
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                done && "border-gold bg-gold text-gold-foreground",
                active && "border-gold bg-charcoal text-gold ring-4 ring-gold/20",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="pt-2">
              <p className={cn("font-semibold", !done && !active && "text-muted-foreground")}>
                {STATUS_LABEL[s]}
              </p>
              {active && <p className="text-sm text-earth">Current status</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
