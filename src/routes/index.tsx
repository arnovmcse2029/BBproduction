import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AboutBlock, ContactBlock, Testimonials, WhyChooseUs } from "@/components/site/HomeSections";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useStore } from "@/context/store";
import { images } from "@/data/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biriyani Babu — The Taste of Authentic Biriyani" },
      {
        name: "description",
        content:
          "Authentic Kolkata biriyani, Hyderabadi dum biriyani and Bengali Chicken Chaap. Order online from Biriyani Babu for home delivery.",
      },
      { property: "og:title", content: "Biriyani Babu — The Taste of Authentic Biriyani" },
      {
        property: "og:description",
        content: "Authentic flavours, aromatic spices and unforgettable taste. Order online for home delivery.",
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
  const featured = FEATURED_IDS.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const list = featured.length >= 3 ? featured : products.filter((p) => p.isBestseller).slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-charcoal">
        <img
          src={images.lucknowiBiriyani}
          alt="A platter of fragrant biriyani with raita on a carved wooden tray"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="container-page flex min-h-[78vh] flex-col justify-center py-24">
          <p className="eyebrow">Biriyani Babu · Nawab's Choice</p>
          <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.05] text-ivory md:text-7xl">
            The Taste of <em className="font-medium text-gold">Authentic</em> Biriyani.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ivory-muted">
            Authentic flavours, aromatic spices and unforgettable taste.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="xl">
              <Link to="/menu">
                Explore Our Menu <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="xl">
              <Link to="/menu">Order Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Bestsellers"
            title="Our guests' favourites"
            description="The dishes that keep Kolkata coming back — our signature biriyani, the classic chaap, and the combo that brings them together."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="xl" className="border-foreground/20">
              <Link to="/menu">
                See the full menu <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Signature strip */}
      <section className="pb-20 md:pb-28">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {[
            { src: images.chickenBiriyani, title: "Kolkata Chicken", id: "kolkata-chicken-biriyani" },
            { src: images.hyderabadiBiriyani, title: "Hyderabadi Dum", id: "hyderabadi-chicken-dum-biriyani" },
            { src: images.handiBiriyani, title: "Chicken Handi", id: "chicken-handi-biriyani" },
          ].map((s) => (
            <Link
              key={s.id}
              to="/menu/$productId"
              params={{ productId: s.id }}
              className="group relative block aspect-square overflow-hidden rounded-2xl bg-charcoal"
            >
              <img src={s.src} alt={`${s.title} biriyani`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-fade-up" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="eyebrow">Signature</p>
                <h3 className="mt-1 text-2xl text-ivory">{s.title} Biriyani</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <WhyChooseUs />
      <AboutBlock />
      <Testimonials />
      <ContactBlock />
    </SiteLayout>
  );
}
