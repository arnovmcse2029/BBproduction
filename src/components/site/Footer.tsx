import { Link } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { useStore } from "@/context/store";
import { images } from "@/data/images";
import { summariseHours } from "@/lib/hours";

export function Footer() {
  const { settings } = useStore();
  const socials = [
    { href: settings.social.instagram, label: "Instagram", Icon: Instagram },
    { href: settings.social.facebook, label: "Facebook", Icon: Facebook },
    { href: settings.social.youtube, label: "YouTube", Icon: Youtube },
  ];

  return (
    <footer className="bg-charcoal text-ivory-muted">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={images.logo} alt="Biriyani Babu" className="h-28 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Authentic biriyani and Bengali-style Chicken Chaap, cooked the slow, traditional way.
          </p>
        </div>

        <div>
          <h4 className="text-lg text-ivory">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/menu" className="hover:text-gold">Our Menu</Link></li>
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/track" className="hover:text-gold">Track Your Order</Link></li>
            <li><Link to="/cart" className="hover:text-gold">Your Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg text-ivory">Reach Us</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-gold" />{settings.phone || "Phone number to be updated"}</li>
            <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-gold" />{settings.email || "Email to be updated"}</li>
            <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-gold" />{settings.address || "Restaurant address to be updated"}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg text-ivory">Hours</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {summariseHours(settings.hours).map((h) => (
              <li key={h.label} className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 text-gold" />
                <span><span className="text-ivory">{h.label}</span> · {h.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            {socials.map(({ href, label, Icon }) =>
              href ? (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-gold-foreground">
                  <Icon className="h-4 w-4" />
                </a>
              ) : (
                <span key={label} title={`${label} link to be added`} aria-label={`${label} (coming soon)`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 text-gold/50">
                  <Icon className="h-4 w-4" />
                </span>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-gold/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Biriyani Babu. All rights reserved.</p>
          <Link to="/admin" className="hover:text-gold">Restaurant admin</Link>
        </div>
      </div>
    </footer>
  );
}
