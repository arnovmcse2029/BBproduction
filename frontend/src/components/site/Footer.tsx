import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Youtube,
} from "lucide-react";
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
    <footer className="bg-[#0f0d0b] text-ivory-muted border-t border-gold/20 relative overflow-hidden font-sans">
      {/* Top gold shimmer line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      {/* Ambient glow top-left */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gold/8 blur-3xl" />

      <div className="container-page grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand block */}
        <div className="lg:col-span-1">
          <img src={images.logo} alt="Biriyani Babu" className="h-20 w-auto" />
          <p className="mt-2 text-xs font-semibold italic text-gold/80 tracking-wide">
            Cooked with patience, served with royal pride
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory-muted/80">
            Authentic Kolkata biriyani, Awadhi dum delicacies, and Bengali-style Chicken Chaap —
            heritage recipes cooked fresh on dum.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
            <Sparkles className="h-3 w-3 text-gold" />
            <span>Kolkata's Royal Dum Kitchen</span>
          </div>

          {/* Social icons */}
          <div className="mt-5 flex gap-2.5">
            {socials.map(({ href, label, Icon }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/25 bg-charcoal text-gold transition-all duration-200 hover:scale-110 hover:border-gold hover:bg-gold hover:text-charcoal hover:shadow-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ) : (
                <span
                  key={label}
                  title={`${label} link to be added`}
                  aria-label={`${label} (coming soon)`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/15 bg-charcoal text-gold/35"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ),
            )}
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="font-display text-base font-semibold text-ivory tracking-wide mb-1">
            Explore
          </h4>
          <div className="h-px w-8 bg-gold/50 mb-4" />
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                to="/menu"
                className="transition-colors duration-150 hover:text-gold flex items-center gap-1.5 group"
              >
                <span className="h-px w-3 bg-gold/40 group-hover:w-5 transition-all duration-200" />
                Our Royal Menu
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="transition-colors duration-150 hover:text-gold flex items-center gap-1.5 group"
              >
                <span className="h-px w-3 bg-gold/40 group-hover:w-5 transition-all duration-200" />
                Our Story &amp; Heritage
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="transition-colors duration-150 hover:text-gold flex items-center gap-1.5 group"
              >
                <span className="h-px w-3 bg-gold/40 group-hover:w-5 transition-all duration-200" />
                Find Our Kitchen
              </Link>
            </li>
            <li>
              <Link
                to="/track"
                className="transition-colors duration-150 hover:text-gold flex items-center gap-1.5 group"
              >
                <span className="h-px w-3 bg-gold/40 group-hover:w-5 transition-all duration-200" />
                Track Live Order
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className="transition-colors duration-150 hover:text-gold flex items-center gap-1.5 group"
              >
                <span className="h-px w-3 bg-gold/40 group-hover:w-5 transition-all duration-200" />
                Your Feast Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="font-display text-base font-semibold text-ivory tracking-wide mb-1">
            Reach Us
          </h4>
          <div className="h-px w-8 bg-gold/50 mb-4" />
          <ul className="space-y-3.5 text-sm">
            <li className="flex gap-3 items-start">
              <Phone className="h-4 w-4 shrink-0 text-gold mt-0.5" />
              <a
                href={`tel:${(settings.phone || "+919830012345").replace(/[^0-9+]/g, "")}`}
                className="hover:text-gold transition-colors"
              >
                {settings.phone || "123456789"}
              </a>
            </li>
            <li className="flex gap-3 items-start">
              <Mail className="h-4 w-4 shrink-0 text-gold mt-0.5" />
              <a
                href={`mailto:${settings.email || "orders@biriyanibabu.com"}`}
                className="hover:text-gold transition-colors break-all"
              >
                {settings.email || "orders@biriyanibabu.com"}
              </a>
            </li>
            <li className="flex gap-3 items-start">
              <MapPin className="h-4 w-4 shrink-0 text-gold mt-0.5" />
              <span className="leading-relaxed">
                {settings.address ||
                  "Kalibari Road, College, beside Lumding, Lumding, Assam 782447"}
              </span>
            </li>
          </ul>
        </div>

        {/* Kitchen Hours */}
        <div>
          <h4 className="font-display text-base font-semibold text-ivory tracking-wide mb-1">
            Kitchen Hours
          </h4>
          <div className="h-px w-8 bg-gold/50 mb-4" />
          <ul className="space-y-2 text-sm">
            {summariseHours(settings.hours).map((h) => (
              <li key={h.label} className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                <span>
                  <span className="text-ivory font-medium">{h.label}</span> · {h.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright strip */}
      <div className="border-t border-gold/10 bg-[#0a0908]">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs sm:flex-row">
          <p className="text-ivory-muted/70">
            © {new Date().getFullYear()} Biriyani Babu. Handcrafted with passion in Kolkata.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/menu" className="hover:text-gold transition-colors">
              Menu
            </Link>
            <Link to="/about" className="hover:text-gold transition-colors">
              About
            </Link>
            <Link to="/admin" className="text-gold/50 hover:text-gold transition-colors">
              Admin
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 bg-charcoal text-gold hover:bg-gold hover:text-charcoal transition-all duration-200 hover:shadow-gold"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
