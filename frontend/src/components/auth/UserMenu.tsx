import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, MapPin, ShoppingBag, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      navigate({ to: "/", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log out right now.");
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-gold/30 bg-charcoal-soft px-2.5 py-1.5 text-left transition-colors hover:border-gold/60"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
          <AvatarFallback className="bg-gold text-sm font-semibold text-charcoal">
            {initials || "BB"}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:block text-sm font-medium text-ivory">
          {user.firstName || "Customer"}
        </span>
        <ChevronDown className="h-4 w-4 text-gold" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Account</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <div className="p-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <User className="h-4 w-4 text-gold" />
              My Profile
            </Link>
            <Link
              to="/addresses"
              search={{ return: undefined }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <MapPin className="h-4 w-4 text-gold" />
              My Addresses
            </Link>
            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4 text-gold" />
              My Orders
            </Link>
            <Link
              to="/forgot-password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              <User className="h-4 w-4 text-gold" />
              Change Password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4 text-gold" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
