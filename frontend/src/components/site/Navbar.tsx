import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, Phone, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
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
  const { settings } = useStore();
  const { isAuthenticated, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#1a0a06] via-[#241208] to-[#1a0a06] border-b border-gold/15 py-1.5 px-3 text-xs text-ivory/90">
        <div className="container-page flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1 text-gold font-semibold tracking-wide uppercase text-[0.68rem] bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
              <Sparkles className="h-3 w-3 text-gold" /> Flat 10% OFF
            </span>
            <span className="hidden sm:inline text-ivory-muted">Use code</span>
            <strong className="text-gold tracking-wider font-mono">BABU10</strong>
            <span className="hidden md:inline text-ivory-muted/70">
              · Free delivery on orders over ₹499
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-xs text-ivory-muted">
            <div className="hidden lg:flex items-center gap-1.5 text-gold-soft font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Kitchen Live · Delivering across Kolkata</span>
            </div>
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
                className="hidden sm:flex items-center gap-1 text-gold hover:text-ivory transition-colors"
              >
                <Phone className="h-3 w-3" />
                <span>{settings.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="border-b border-gold/15 bg-charcoal/90 backdrop-blur-lg">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <Logo className="h-16 md:h-20" />

          <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="relative rounded-lg px-3.5 py-2 text-sm font-medium text-ivory-muted transition-all duration-200 hover:text-gold hover:bg-charcoal-soft after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
                activeProps={{
                  className: "text-gold font-semibold bg-charcoal-soft/80 after:scale-x-100",
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {isLoading ? (
              <span className="hidden px-3 text-sm text-ivory-muted sm:inline" aria-live="polite">
                Checking account…
              </span>
            ) : !isAuthenticated ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Button asChild variant="outline-light" className="h-10 rounded-lg px-4">
                  <Link to="/login" search={{ redirect: undefined }}>
                    Login
                  </Link>
                </Button>
                <Button asChild variant="gold" className="h-10 rounded-lg px-4">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            ) : (
              <UserMenu />
            )}

            <Link
              to="/cart"
              aria-label={`Cart, ${itemCount} items`}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-charcoal text-ivory transition-all duration-200 hover:border-gold/60 hover:bg-charcoal-soft hover:text-gold hover:shadow-gold"
            >
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-gold via-gold-soft to-gold px-1 text-[0.7rem] font-bold text-charcoal shadow-md animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </Link>

            <Button
              asChild
              variant="gold"
              className="hidden h-11 px-6 rounded-xl font-semibold shadow-gold sm:inline-flex"
            >
              <Link to="/menu" className="flex items-center gap-2">
                <span>Order Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 text-ivory hover:bg-charcoal-soft lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5 text-gold" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "border-t border-gold/15 bg-charcoal/98 lg:hidden transition-all duration-300 animate-in slide-in-from-top-2",
            open ? "block" : "hidden",
          )}
        >
          <nav className="container-page flex flex-col py-4 gap-1" aria-label="Mobile">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-gold-soft border-b border-gold/10 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Delivering Hot Dum Biriyani (30-45 mins)</span>
            </div>
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-lg px-3 py-3 text-base font-medium text-ivory-muted hover:bg-charcoal-soft hover:text-gold transition-colors"
                activeProps={{ className: "text-gold font-semibold bg-charcoal-soft" }}
              >
                {n.label}
              </Link>
            ))}
            {isLoading ? (
              <p className="mt-3 px-3 py-2 text-sm text-ivory-muted" aria-live="polite">
                Checking account…
              </p>
            ) : !isAuthenticated ? (
              <div className="mt-3 grid gap-2 sm:hidden">
                <Button asChild variant="outline-light" className="rounded-xl font-semibold">
                  <Link to="/login" search={{ redirect: undefined }} onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild variant="gold" className="rounded-xl font-semibold shadow-gold">
                  <Link to="/register" onClick={() => setOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-3 sm:hidden">
                <UserMenu />
              </div>
            )}
            <Button
              asChild
              variant="gold"
              size="xl"
              className="mt-3 sm:hidden rounded-xl font-semibold shadow-gold"
            >
              <Link
                to="/menu"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2"
              >
                <span>Order Fresh Handi Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
