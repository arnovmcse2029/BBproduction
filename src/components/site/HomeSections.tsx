import { Link } from "@tanstack/react-router";
import { Bike, ChefHat, Clock, Flame, Leaf, Mail, MapPin, Phone, Quote, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store";
import { images } from "@/data/images";
import { summariseHours } from "@/lib/hours";
import { SectionHeading } from "./SectionHeading";

const REASONS = [
  { Icon: ChefHat, title: "Authentic recipes", text: "Time-honoured Kolkata and Awadhi recipes, cooked slowly on dum." },
  { Icon: Flame, title: "Freshly prepared", text: "Every handi is cooked fresh through the day — never reheated." },
  { Icon: Wheat, title: "Quality ingredients", text: "Aged basmati, whole spices, pure ghee and hand-picked meat." },
  { Icon: Bike, title: "Home delivery", text: "Hot, sealed and delivered to your door, ready to enjoy." },
];

export function WhyChooseUs() {
  return (
    <section className="bg-charcoal py-20 md:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Why Biriyani Babu" title="Cooked with patience, served with pride" light />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-gold/15 bg-gold/15 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ Icon, title, text }) => (
            <div key={title} className="bg-charcoal p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl text-ivory">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutBlock({ withLink = true }: { withLink?: boolean }) {
  return (
    <section className="py-20 md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <img
            src={images.restaurantInterior}
            alt="Inside the Biriyani Babu restaurant"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card"
          />
          <div className="absolute -bottom-6 -right-4 hidden rounded-xl bg-charcoal p-5 shadow-gold sm:block">
            <img src={images.logo} alt="" aria-hidden className="h-20 w-auto" />
          </div>
        </div>
        <div>
          <SectionHeading
            align="left"
            eyebrow="Our Story"
            title="A tribute to the biriyani of old Kolkata"
          />
          <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
            <p>
              Biriyani Babu was born from a simple belief: great biriyani can't be rushed. Inspired by the
              Awadhi kitchens that shaped Kolkata's food culture, we layer fragrant rice and tender meat in sealed
              handis and let time do the rest.
            </p>
            <p>
              Alongside our biriyani, we serve the Bengali favourite that completes the meal — a rich, gently sweet
              Chicken Chaap. Honest food, generous portions and flavours you'll remember.
            </p>
          </div>
          {withLink && (
            <Button asChild variant="outline" size="xl" className="mt-8 border-foreground/20">
              <Link to="/about">Read more about us</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

// Sample reviews — replace with genuine customer reviews before launch.
const TESTIMONIALS = [
  { name: "Ananya S.", place: "Park Circus", text: "The aloo in the Kolkata biriyani is perfect, and the chaap is just like the old para shops." },
  { name: "Rahul D.", place: "Salt Lake", text: "Arrived hot and well-packed. The rice was fragrant and every grain separate. Ordering again." },
  { name: "Priya G.", place: "Gariahat", text: "Our family feast was generous — everyone had seconds. The firni was a lovely finish." },
];

export function Testimonials() {
  return (
    <section className="bg-secondary/60 py-20 md:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Kind Words" title="What our guests say" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border bg-card p-8 shadow-card">
              <Quote className="h-7 w-7 text-gold" />
              <blockquote className="mt-4 flex-1 font-display text-lg leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="text-muted-foreground"> · {t.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactBlock() {
  const { settings } = useStore();
  const rows = [
    { Icon: Phone, label: "Call us", value: settings.phone || "Phone number to be updated" },
    { Icon: Mail, label: "Email", value: settings.email || "Email to be updated" },
    { Icon: MapPin, label: "Visit us", value: settings.address || "Restaurant address to be updated" },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container-page grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionHeading align="left" eyebrow="Find Us" title="Come hungry, leave happy" />
          <ul className="mt-8 space-y-5">
            {rows.map(({ Icon, label, value }) => (
              <li key={label} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-charcoal text-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-0.5 font-medium">{value}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-charcoal text-gold">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hours</p>
                {summariseHours(settings.hours).map((h) => (
                  <p key={h.label} className="mt-0.5 font-medium">
                    {h.label}: {h.value}
                  </p>
                ))}
              </div>
            </li>
          </ul>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-2xl bg-charcoal lg:col-span-3">
          <img
            src={images.restaurantInterior}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="relative flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
            <MapPin className="h-10 w-10 text-gold" />
            <h3 className="text-2xl text-ivory">Map & directions</h3>
            <p className="max-w-sm text-sm text-ivory-muted">
              The map will appear here once the restaurant address is added in the admin settings.
            </p>
            <Button asChild variant="gold" size="xl">
              <Link to="/menu">Order for delivery</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VegNote() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Leaf className="h-3.5 w-3.5 text-veg" /> Vegetarian options available
    </span>
  );
}
