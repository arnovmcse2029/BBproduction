import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Flame,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AboutBlock,
  ContactBlock,
  FeastCtaBanner,
  RoyalCraftSection,
  WhyChooseUs,
} from "@/components/site/HomeSections";
import { KolkataPairingSection } from "@/components/site/KolkataPairingSection";
import { LiveOrderTicker } from "@/components/site/LiveOrderTicker";
import { MenuLedger } from "@/components/site/MenuLedger";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TestimonialMarqueeSection } from "@/components/site/TestimonialMarqueeSection";
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
import { images } from "@/data/images";
import { formatINR } from "@/lib/pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biriyani Babu — Authentic Kolkata Biriyani & Chicken Chaap" },
      {
        name: "description",
        content:
          "Authentic Kolkata biriyani, Hyderabadi dum biriyani and Bengali Chicken Chaap. Cooked fresh on dum with aged basmati and pure ghee. Order online for hot home delivery across Kolkata.",
      },
      { property: "og:title", content: "Biriyani Babu — The Taste of Authentic Biriyani" },
      {
        property: "og:description",
        content:
          "Authentic flavours, aromatic spices and unforgettable taste. Order online for hot home delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const FEATURED_IDS = ["kolkata-chicken-biriyani", "chicken-chaap", "babu-special-combo"];

function HomePage() {
  const { products } = useStore();
  const cart = useCart();
  const featured = FEATURED_IDS.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const list = featured.length >= 3 ? featured : products.filter((p) => p.isBestseller).slice(0, 3);
  const heroSpecial = products.find((p) => p.id === "kolkata-chicken-biriyani") ?? products[0];

  return (
    <SiteLayout>
      {/* ===== HERO SECTION ===== */}
      <section className="relative isolate overflow-hidden bg-charcoal min-h-[90vh] flex flex-col justify-center">
        {/* Background image */}
        <img
          src={images.lucknowiBiriyani}
          alt="A platter of fragrant biriyani with raita on a carved wooden tray"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center] opacity-40 scale-105"
        />
        {/* Multi-layer gradient overlays */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#120a06]/95 via-[#1a1109]/75 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/40" />
        {/* Warm ember glow effect bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-64 md:h-96 md:w-96 rounded-full bg-amber-900/30 blur-3xl -z-10" />

        <div className="container-page relative py-20 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Left Content */}
            <div className="lg:col-span-7 xl:col-span-6">
              {/* Live Ticker — New addition */}
              <LiveOrderTicker className="mb-5 hidden sm:inline-flex" />

              {/* Eyebrow pill */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-charcoal/85 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur-md shadow-gold">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>The Royal Awadhi Dum Tradition · Estd. Kolkata</span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl font-bold leading-[1.05] text-ivory sm:text-5xl md:text-6xl lg:text-7xl">
                The Taste of{" "}
                <span className="text-gradient-gold block font-display italic font-semibold">
                  Authentic Kolkata
                </span>
                Biriyani.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg">
                Slow-cooked in dough-sealed clay handis over gentle charcoal embers. Aged basmati
                rice, tender farm-fresh cuts, pure cow ghee, and Kolkata's legendary
                melt-in-the-mouth spiced golden potato.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button
                  asChild
                  variant="gold"
                  size="xl"
                  className="rounded-xl px-8 font-semibold shadow-gold hover:shadow-gold-lg transition-all duration-300"
                >
                  <Link to="/menu" className="flex items-center gap-2">
                    <Flame className="h-4 w-4 fill-current" />
                    <span>Order Fresh Handi</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline-light"
                  size="xl"
                  className="rounded-xl px-7 font-medium backdrop-blur-sm border-ivory/30 hover:bg-ivory/10 transition-all duration-300"
                >
                  <Link to="/menu">Explore Menu &amp; Combos</Link>
                </Button>
              </div>

              {/* Trust strip */}
              <div className="mt-10 pt-8 border-t border-gold/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-ivory/80">
                {[
                  { Icon: Star, strong: "4.9 / 5", sub: "3,200+ Reviews" },
                  { Icon: Flame, strong: "Fresh Dum", sub: "Never Reheated" },
                  { Icon: UtensilsCrossed, strong: "Aloo & Egg", sub: "Kolkata Classic" },
                  { Icon: ShieldCheck, strong: "Sealed Handi", sub: "Hot Delivery" },
                ].map(({ Icon, strong, sub }) => (
                  <div key={strong} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold border border-gold/30">
                      <Icon className="h-4 w-4 fill-gold" />
                    </div>
                    <div>
                      <strong className="block text-ivory text-sm">{strong}</strong>
                      <span className="text-ivory/70">{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Floating Showcase Card */}
            {heroSpecial && (
              <div className="hidden lg:col-span-5 xl:col-span-6 lg:flex flex-col items-center justify-center">
                <div className="relative w-full max-w-sm rounded-3xl border border-gold/40 bg-charcoal/90 p-6 shadow-gold-lg backdrop-blur-md animate-float">
                  {/* Chef's Signature badge */}
                  <div className="absolute -top-3.5 right-6 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold via-gold-soft to-gold px-3 py-1 text-xs font-bold text-charcoal shadow-md">
                    <Sparkles className="h-3 w-3 fill-charcoal" /> Chef's Signature
                  </div>

                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gold/20">
                    <img
                      src={heroSpecial.image || images.chickenBiriyani}
                      alt={heroSpecial.name}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-ivory">
                      <span className="rounded-full bg-charcoal/80 px-2.5 py-0.5 border border-gold/20 font-medium">
                        {heroSpecial.serves || "Serves 1"}
                      </span>
                      <span className="flex items-center gap-1 text-gold font-semibold">
                        <Star className="h-3 w-3 fill-gold" /> 4.9 (1.8k orders)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-display text-xl font-semibold text-ivory">
                      {heroSpecial.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs text-ivory/70 leading-relaxed">
                      {heroSpecial.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-gold/20">
                    <div>
                      <span className="text-[0.65rem] text-ivory/60 uppercase tracking-wider block">
                        Price
                      </span>
                      <p className="font-display text-2xl font-bold text-gold">
                        {formatINR(heroSpecial.price)}
                      </p>
                    </div>
                    <Button
                      onClick={() => cart.add(heroSpecial)}
                      variant="gold"
                      className="h-10 rounded-xl px-5 font-semibold shadow-gold hover:shadow-gold-lg transition-all duration-300"
                    >
                      <Plus className="h-4 w-4" /> Add to Order
                    </Button>
                  </div>

                  {/* Delivery badge */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-gold-soft bg-gold/10 rounded-xl py-2 border border-gold/15">
                    <Timer className="h-3.5 w-3.5 text-gold" />
                    <span>
                      Delivered fresh in <strong className="text-gold">30-45 mins</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== LIVE ORDER TICKER (Mobile only - shown below hero) ===== */}
      <div className="bg-charcoal/95 border-b border-gold/20 py-3 sm:hidden overflow-hidden">
        <div className="container-page">
          <LiveOrderTicker />
        </div>
      </div>

      {/* ===== BESTSELLERS SECTION ===== */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />
        <div className="container-page relative">
          <SectionHeading
            eyebrow="Bestsellers"
            title="Our guests' beloved favourites"
            description="The dishes that keep food lovers coming back — our signature Kolkata biriyani, the nutty Chicken Chaap, and the iconic combo that pairs them together."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button
              asChild
              variant="outline"
              size="xl"
              className="rounded-xl border-foreground/20 px-8 font-medium hover:border-gold/50 hover:text-gold transition-all duration-200"
            >
              <Link to="/menu" className="flex items-center gap-2">
                <span>View Full Menu &amp; Combos (12 Dishes)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== SIGNATURE TRIO SHOWCASE STRIP ===== */}
      <section className="pb-20 md:pb-28 relative overflow-hidden">
        <div className="container-page">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-gold">
              ✦ Handcrafted Specialties ✦
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl text-foreground">
              The Babu Trio of Flavours
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                src: images.chickenBiriyani,
                title: "Kolkata Chicken",
                desc: "Aromatic aged rice, succulent meat, the iconic golden potato & boiled egg.",
                tag: "House Classic",
                price: "₹249",
                id: "kolkata-chicken-biriyani",
              },
              {
                src: images.hyderabadiBiriyani,
                title: "Hyderabadi Dum",
                desc: "Kacchi dum style with spicy masala, crispy birista onions & fresh mint.",
                tag: "Spiced & Zesty",
                price: "₹279",
                id: "hyderabadi-chicken-dum-biriyani",
              },
              {
                src: images.handiBiriyani,
                title: "Chicken Handi",
                desc: "Copper handi cooked with rich gravy, aromatic herbs and green peas.",
                tag: "Chef's Special",
                price: "₹329",
                id: "chicken-handi-biriyani",
              },
            ].map((s) => (
              <Link
                key={s.id}
                to="/menu/$productId"
                params={{ productId: s.id }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-charcoal border border-border/80 shadow-card cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-gold/60 hover:shadow-gold-lg"
              >
                <img
                  src={s.src}
                  alt={`${s.title} biriyani`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
                <div className="absolute top-4 left-4 z-10">
                  <span className="rounded-full bg-gold/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-charcoal shadow-sm">
                    {s.tag}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-2xl font-bold text-ivory group-hover:text-gold transition-colors duration-300">
                      {s.title} Biriyani
                    </h3>
                    <span className="font-display text-xl font-bold text-gold">{s.price}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ivory/75 line-clamp-2">
                    {s.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gold">
                    <span>Order this specialty</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEW: KOLKATA PAIRING SECTION ===== */}
      <KolkataPairingSection />

      {/* ===== ROYAL CRAFT SECTION ===== */}
      <RoyalCraftSection />

      {/* ===== NEW: AWADHI LEDGER MENU ===== */}
      <MenuLedger />

      {/* ===== WHY CHOOSE US ===== */}
      <WhyChooseUs />

      {/* ===== ABOUT BLOCK ===== */}
      <AboutBlock />

      {/* ===== NEW: TESTIMONIAL MARQUEE ===== */}
      <TestimonialMarqueeSection />

      {/* ===== FEAST CTA BANNER ===== */}
      <FeastCtaBanner />

      {/* ===== CONTACT BLOCK ===== */}
      <ContactBlock />
    </SiteLayout>
  );
}
