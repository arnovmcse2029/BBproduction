import { Link } from "@tanstack/react-router";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Biriyani Babu — home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <img src={images.logo} alt="Biriyani Babu" className="h-full w-auto object-contain" />
    </Link>
  );
}
