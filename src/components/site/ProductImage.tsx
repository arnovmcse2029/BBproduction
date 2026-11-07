import { useState } from "react";
import { Utensils } from "lucide-react";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";

/** Food photo with an elegant branded placeholder when no image is set or it fails to load. */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
}: {
  src?: string | undefined;
  alt: string;
  className?: string | undefined;
  imgClassName?: string | undefined;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showPhoto = Boolean(src && !failed);

  return (
    <div className={cn("relative overflow-hidden bg-charcoal", className)}>
      {showPhoto ? (
        <>
          <img
            src={src}
            alt={alt}
            loading="eager"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "h-full w-full object-cover transition-all duration-700",
              loaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
              imgClassName,
            )}
          />
          {/* Subtle bottom gradient to ensure text/overlays pop */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        </>
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 border border-gold/20 bg-gradient-to-br from-[#1C1815] via-[#241D17] to-[#141210] p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-charcoal/80 text-gold shadow-gold">
            <Utensils className="h-6 w-6" />
          </div>
          <div className="relative">
            <p className="font-display text-sm font-medium text-ivory/90">{alt}</p>
            <span className="mt-0.5 inline-block text-[0.65rem] uppercase tracking-[0.22em] text-gold/80 font-medium">
              Handcrafted in Kitchen
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
