import { cn } from "@/lib/utils";

export function VegMark({ isVeg, className }: { isVeg: boolean; className?: string }) {
  return (
    <span
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] bg-card",
        isVeg ? "border-veg" : "border-nonveg",
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", isVeg ? "bg-veg" : "bg-nonveg")} />
    </span>
  );
}

export function Tag({
  children,
  tone = "gold",
  className,
}: {
  children: React.ReactNode;
  tone?: "gold" | "dark" | "muted" | "danger";
  className?: string;
}) {
  const tones = {
    gold: "bg-gold text-gold-foreground",
    dark: "bg-charcoal text-ivory",
    muted: "bg-muted text-muted-foreground",
    danger: "bg-destructive text-destructive-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
