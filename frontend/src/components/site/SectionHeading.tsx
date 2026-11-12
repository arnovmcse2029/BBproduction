import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto text-center" : "", "max-w-2xl", className)}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-gold mb-2">
          ✦ {eyebrow} ◆
        </span>
      )}
      <h2
        className={cn(
          "mt-2 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl",
          light ? "text-ivory" : "text-foreground",
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "flex items-center gap-2 mt-4",
          align === "center" ? "justify-center" : "justify-start",
        )}
      >
        <span className="h-px w-8 sm:w-12 bg-gold/60" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold shadow-gold" />
        <span className="h-px w-8 sm:w-12 bg-gold/60" />
      </div>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed md:text-lg",
            light ? "text-ivory-muted" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
