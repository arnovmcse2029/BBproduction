import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  size = "md",
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const btn = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className={cn("inline-flex items-center rounded-lg border bg-card", className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={cn(
          btn,
          "flex items-center justify-center text-foreground transition-colors hover:text-gold disabled:opacity-40",
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "min-w-8 text-center font-semibold tabular-nums",
          size === "sm" ? "text-sm" : "text-base",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={cn(
          btn,
          "flex items-center justify-center text-foreground transition-colors hover:text-gold disabled:opacity-40",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
