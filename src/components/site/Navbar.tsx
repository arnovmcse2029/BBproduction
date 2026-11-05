import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Our Menu" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/track", label: "Track Order" },
] as const;

export function Navbar() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-charcoal/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo className="h-16 md:h-[4.5rem]" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-ivory-muted transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} items`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-ivory transition-colors hover:bg-charcoal-soft hover:text-gold"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.7rem] font-bold text-gold-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <Button asChild variant="gold" className="hidden h-11 px-6 sm:inline-flex">
            <Link to="/menu">Order Now</Link>
          </Button>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full text-ivory hover:bg-charcoal-soft lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-gold/15 bg-charcoal lg:hidden", open ? "block" : "hidden")}>
        <nav className="container-page flex flex-col py-3" aria-label="Mobile">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-2 py-3 text-base font-medium text-ivory-muted hover:text-gold"
              activeProps={{ className: "text-gold" }}
            >
              {n.label}
            </Link>
          ))}
          <Button asChild variant="gold" size="xl" className="mt-2 sm:hidden">
            <Link to="/menu" onClick={() => setOpen(false)}>
              Order Now
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
