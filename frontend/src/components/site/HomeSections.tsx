import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Quote,
  Sparkles,
  Star,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store";
import { images } from "@/data/images";
import { summariseHours } from "@/lib/hours";
import { SectionHeading } from "./SectionHeading";

const REASONS = [
  {
    Icon: ChefHat,
    title: "Awadhi Heritage Recipes",
    text: "Time-honoured recipes inspired by the Nawabs of Awadh, perfected for generations in Kolkata.",
    tag: "Authentic",
  },
  {
    Icon: Flame,
    title: "Cooked Fresh on Dum",
    text: "Every handi is sealed with dough and slow-cooked over burning embers — never pre-cooked or microwaved.",
    tag: "Traditional",
  },
  {
    Icon: Wheat,
    title: "Aged Basmati & Pure Ghee",
    text: "2-year aged long-grain basmati, real Kashmiri saffron, pure cow ghee, and tender farm-fresh cuts.",
    tag: "Premium",
  },
  {
    Icon: Bike,
    title: "Double-Sealed Delivery",
    text: "Delivered piping hot in insulated, spill-proof packaging so the aroma releases right at your table.",
    tag: "Express",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-charcoal via-[#1a1714] to-charcoal py-20 md:py-28 text-ivory">
      {/* Decorative ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="The Babu Promise"
          title="Cooked with patience, served with royal pride"
          description="We take no shortcuts. From hand-ground whole spices to slow charcoal dum, experience biriyani as it was meant to be enjoyed."
          light
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ Icon, title, text, tag }) => (
            <div
              key={title}
              className="group relative flex flex-col rounded-2xl border border-gold/20 bg-charcoal/90 p-8 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_16px_36px_-12px_rgba(198,155,80,0.25)] hover:bg-gradient-to-b hover:from-charcoal-soft hover:to-charcoal"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/25 via-charcoal-soft to-charcoal text-gold shadow-gold transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-gold/10 border border-gold/25 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-gold">
                  {tag}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-ivory transition-colors group-hover:text-gold">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory-muted/90">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CRAFT_STEPS = [
  {
    step: "01",
    title: "The 12-Hour Marinade",
    desc: "Tender cuts are steeped in fresh hung curd, ginger-garlic paste, and a secret blend of 14 roasted aromatics.",
  },
  {
    step: "02",
    title: "The Iconic Kolkata Aloo",
    desc: "Large golden potatoes gently braised in aromatic meat broth until they turn silky, tender, and flavor-soaked.",
  },
  {
    step: "03",
    title: "Flour-Sealed Clay Dum",
    desc: "Aged long-grain rice and meat are layered with saffron milk and sealed with kneaded dough over glowing charcoal.",
  },
  {
    step: "04",
    title: "Broken Fresh for You",
    desc: "The steaming handi seal is opened fresh upon your order, releasing a burst of saffron and ghee perfume.",
  },
];

export function RoyalCraftSection() {
  return (
    <section className="py-20 md:py-28 bg-card border-y border-border/70">
      <div className="container-page">
        <SectionHeading
          eyebrow="The Royal Dum Craft"
          title="How our Master Bawarchis brew the magic"
          description="True Kolkata biriyani is a slow, rhythmic culinary dance where every step preserves the essence of royal Awadh."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {CRAFT_STEPS.map((s, idx) => (
            <div
              key={s.step}
              className="relative flex flex-col rounded-2xl border border-border/80 bg-background/60 p-7 shadow-sm transition-all duration-300 hover:border-gold/50 hover:shadow-card"
            >
              {/* Connecting dotted line to next card (not on last item) */}
              {idx < CRAFT_STEPS.length - 1 && (
                <span className="hidden lg:block absolute top-8 left-full w-8 border-t border-dashed border-gold/25 z-10" />
              )}
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-bold text-gold/80">{s.step}</span>
                <span className="h-2 w-2 rounded-full bg-gold" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutBlock({ withLink = true }: { withLink?: boolean }) {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          {/* Decorative frame */}
          <div className="absolute -inset-3 rounded-3xl border border-gold/30 -z-10 translate-x-2 translate-y-2 hidden sm:block" />
          <img
            src={images.restaurantInterior}
            alt="Inside the Biriyani Babu restaurant"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] border border-gold/20"
          />
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-charcoal p-5 shadow-gold sm:block border border-gold/30">
            <img src={images.logo} alt="Biriyani Babu Emblem" className="h-20 w-auto" />
          </div>
          <div className="absolute -top-4 -left-4 hidden sm:flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-charcoal shadow-gold">
            <Award className="h-4 w-4" />
            <span>Kolkata Heritage Certified</span>
          </div>
        </div>

        <div>
          <SectionHeading
            align="left"
            eyebrow="Our Story"
            title="A tribute to the grand biriyani of old Kolkata"
          />
          <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
            <p>
              Biriyani Babu was born from a simple belief:{" "}
              <strong>great biriyani can never be rushed.</strong> Inspired by the legendary Awadhi
              kitchens that accompanied Nawab Wajid Ali Shah to Kolkata, we layer fragrant aged
              basmati, slow-braised meat, and the iconic melting potato into sealed handis, allowing
              gentle charcoal heat to work its magic.
            </p>
            <p>
              Alongside our biriyani, we serve Kolkata's treasured companion — a velvety, mildly
              sweet <strong>Chicken Chaap</strong> made with cashew paste, poppy seeds, and
              slow-fried aromatic ghee. Generous portions, authentic heritage recipes, and flavors
              that linger in your memory.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-border/80 py-6 sm:grid-cols-3">
            <div>
              <p className="font-display text-3xl font-bold text-gold">50K+</p>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Handis Served
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-gold">100%</p>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Fresh Charcoal Dum
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-gold">4.9 ★</p>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Customer Rating
              </p>
            </div>
          </div>

          {withLink && (
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                variant="gold"
                size="xl"
                className="rounded-xl shadow-gold font-semibold"
              >
                <Link to="/menu" className="flex items-center gap-2">
                  <span>Explore Menu</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="rounded-xl border-foreground/20 font-medium"
              >
                <Link to="/about">Read our full story</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: "Ananya Sanyal",
    place: "Park Circus, Kolkata",
    rating: 5,
    tag: "Verified Feast Order",
    text: "The aloo in the Kolkata biriyani is absolute perfection — tender and infused with saffron broth. And the Chicken Chaap tastes just like the legendary heritage eateries.",
  },
  {
    name: "Rahul Debnath",
    place: "Salt Lake Sector V",
    rating: 5,
    tag: "Weekly Regular",
    text: "Arrived piping hot and sealed tight. The basmati rice is light, fragrant, and every single grain is separate without being oily. Biriyani Babu is now our family's Sunday go-to.",
  },
  {
    name: "Priya Ganguly",
    place: "Ballygunge Circular Rd",
    rating: 5,
    tag: "Family Feast Order",
    text: "Ordered the Babu Special Combo for a family gathering. The portion sizes were exceptionally generous, meat tender off the bone, and the chilled firni was an exquisite finale!",
  },
];

export function Testimonials() {
  return (
    <section className="bg-secondary/40 py-20 md:py-28 border-y border-border/70 relative">
      <div className="container-page">
        <SectionHeading
          eyebrow="Guest Love"
          title="What biriyani lovers in Kolkata say"
          description="Thousands of Kolkata foodies trust Biriyani Babu for their celebratory dinners, lazy Sunday lunches, and late-night cravings."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_36px_-12px_rgba(198,155,80,0.15)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-gold/30" />
                </div>
                <blockquote className="mt-4 font-display text-lg leading-relaxed text-foreground">
                  “{t.text}”
                </blockquote>
              </div>

              <figcaption className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-muted-foreground">{t.place}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[0.65rem] font-semibold text-gold">
                  <CheckCircle2 className="h-3 w-3" />
                  {t.tag}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeastCtaBanner() {
  return (
    <section className="py-16 md:py-24 bg-charcoal text-ivory relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent" />
      <div className="container-page relative">
        <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-[#1c1815] via-[#261f18] to-[#1c1815] p-8 md:p-14 shadow-gold-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            {/* Limited Slots urgency badge */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-900/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
              </span>
              Limited Weekend Slots — Book Now
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold mb-3">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Sunday Feasts &amp; Party Orders
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ivory leading-tight">
              Hosting a feast or dinner party?
            </h2>
            <p className="mt-3 text-ivory-muted text-base">
              Order our customized Family Feast Combos with generous handis, Chicken Chaap, and
              Firni. Freshly packed on dum and delivered hot to your doorstep.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              asChild
              variant="gold"
              size="xl"
              className="rounded-xl font-semibold shadow-gold px-8"
            >
              <Link to="/menu" className="flex items-center gap-2">
                <span>Order Family Feast</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="xl" className="rounded-xl font-medium">
              <Link to="/contact">Custom Catering Inquiry</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactBlock() {
  const { settings } = useStore();
  const rows = [
    { Icon: Phone, label: "Call for Orders & Support", value: settings.phone || "123456789" },
    { Icon: Mail, label: "Email Us", value: settings.email || "orders@biriyanibabu.com" },
    {
      Icon: MapPin,
      label: "Visit Our Kitchen",
      value: settings.address || "Kalibari Road, College, beside Lumding, Lumding, Assam 782447",
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container-page grid gap-10 lg:grid-cols-5 items-center">
        <div className="lg:col-span-2">
          <SectionHeading align="left" eyebrow="Visit Us" title="Come hungry, leave smiling" />
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Stop by for the freshest hot handi takeouts or have your royal biriyani delivered
            directly anywhere in Kolkata.
          </p>

          <ul className="mt-8 space-y-5">
            {rows.map(({ Icon, label, value }) => (
              <li key={label} className="flex gap-4 items-start">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-charcoal text-gold shadow-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-0.5 font-medium text-foreground">{value}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-4 items-start">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-charcoal text-gold shadow-gold">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kitchen & Delivery Hours
                </p>
                {summariseHours(settings.hours).map((h) => (
                  <p key={h.label} className="mt-0.5 font-medium text-foreground">
                    <span className="font-semibold text-gold-foreground">{h.label}:</span> {h.value}
                  </p>
                ))}
              </div>
            </li>
          </ul>
        </div>

        {/* Map & Directions Container */}
        <div className="relative min-h-[460px] overflow-hidden rounded-3xl border border-gold/25 bg-charcoal shadow-card lg:col-span-3">
          <iframe
            title="Biriyani Babu location"
            src="https://www.google.com/maps?q=25.7598318,93.1742665&output=embed"
            className="absolute inset-0 h-full w-full border-0 filter contrast-105"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating Glass Card for Directions */}
          <div className="absolute inset-x-4 bottom-4 md:right-4 md:left-auto md:w-80 rounded-2xl glass-dark p-5 shadow-gold border border-gold/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-charcoal">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-ivory text-sm">
                  Biriyani Babu Kitchen
                </h4>
                <p className="text-xs text-ivory-muted line-clamp-1">Lumding, Assam</p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                asChild
                variant="gold"
                className="w-full h-10 rounded-xl font-semibold shadow-gold text-xs"
              >
                <a
                  href="https://maps.app.goo.gl/sLtUNoArGUgvA85R8"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5"
                >
                  <span>Get Directions on Google Maps</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VegNote() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
      <Leaf className="h-3.5 w-3.5 text-veg" /> Pure vegetarian items prepared with dedicated
      utensils
    </span>
  );
}
