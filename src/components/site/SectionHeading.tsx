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
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        className={cn(
          "mt-3 text-3xl font-semibold leading-tight md:text-5xl",
          light ? "text-ivory" : "text-foreground",
        )}
      >
        {title}
      </h2>
      <span className={cn("gold-rule mt-5", align === "center" && "mx-auto")} />
      {description && (
        <p className={cn("mt-5 text-base leading-relaxed", light ? "text-ivory-muted" : "text-muted-foreground")}>
          {description}
        </p>
      )}
    </div>
  );
}
