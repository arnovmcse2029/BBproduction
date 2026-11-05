import { useState } from "react";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";

/** Food photo with an elegant branded placeholder when no image is set or it fails to load. */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = src && !failed;
  return (
    <div className={cn("relative overflow-hidden bg-charcoal", className)}>
      {showPhoto ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-gold/20 bg-charcoal p-6 text-center">
          <img src={images.logo} alt="" aria-hidden className="h-1/2 max-h-32 w-auto opacity-70" />
          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-ivory-muted/70">Photo coming soon</span>
        </div>
      )}
    </div>
  );
}
