import { CheckCircle2, Heart, Quote, Sparkles, Star } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

interface Review {
  name: string;
  location: string;
  handle: string;
  rating: number;
  order: string;
  comment: string;
  tag: string;
}

const REVIEWS_ROW_1: Review[] = [
  {
    name: "Ananya Sanyal",
    location: "Park Circus, Kolkata",
    handle: "@ananya_fooddiaries",
    rating: 5,
    order: "Kolkata Chicken Biriyani + Chaap",
    comment:
      "The potato in the Kolkata biriyani is sheer poetry — melting tender, imbued with saffron and pure ghee aroma. Authentic Awadhi flavours that remind me of old Kolkata.",
    tag: "Verified Feast Order",
  },
  {
    name: "Rahul Debnath",
    location: "Salt Lake Sector V",
    handle: "@rahul_techie_eats",
    rating: 5,
    order: "Babu Special Combo",
    comment:
      "Arrived double-sealed and steaming hot. Each long basmati grain is separate, delicately spiced, and never greasy. The Chicken Chaap cashew gravy is legendary.",
    tag: "Weekly Regular",
  },
  {
    name: "Priya Ganguly",
    location: "Ballygunge Circular Rd",
    handle: "@priya.g_kolkata",
    rating: 5,
    order: "Mutton Dum Biriyani (Family Box)",
    comment:
      "Ordered 6 handis for a Sunday family lunch. The mutton shanks were falling apart tender! The earthen aroma when opening the dough seal is unbeatable.",
    tag: "Sunday Feast Host",
  },
  {
    name: "Dr. Souvik Chatterjee",
    location: "Jadavpur, Kolkata",
    handle: "@souvik_md",
    rating: 5,
    order: "Awadhi Clay Handi Biriyani",
    comment:
      "Gentle on the stomach yet so fragrant with cardamom, mace and kewra. No artificial essences, pure royal craftsmanship.",
    tag: "Verified Guest",
  },
];

const REVIEWS_ROW_2: Review[] = [
  {
    name: "Debolina Mukherjee",
    location: "New Town Action Area 1",
    handle: "@debolina_m",
    rating: 5,
    order: "Twin Handi Duo + Firni",
    comment:
      "The chilled Matka Firni with pistachios was the perfect ending. Biriyani Babu has raised the benchmark for home delivered biriyani in Kolkata.",
    tag: "Top Reviewer",
  },
  {
    name: "Arjun Banerjee",
    location: "Behala Chowrasta",
    handle: "@arjun_b_food",
    rating: 5,
    order: "Hyderabadi Dum + Burani Raita",
    comment:
      "Crispy birista onions, robust masalas, and the smoked garlic burani raita took it to another level. Delivery in 32 minutes flat!",
    tag: "Express Order",
  },
  {
    name: "Rituparna Sen",
    location: "Southern Avenue, Kolkata",
    handle: "@ritu_culinary",
    rating: 5,
    order: "Kolkata Mutton Biriyani",
    comment:
      "Soft golden aloo, fragrant saffron rice, perfectly cooked egg, and melt-in-mouth mutton. My mother-in-law gave it a 10/10!",
    tag: "Heritage Approved",
  },
  {
    name: "Siddharth Roy",
    location: "Alipore, Kolkata",
    handle: "@sid_roy_kolkata",
    rating: 5,
    order: "Royal Party Pack (10 Servings)",
    comment:
      "The insulated delivery packaging kept all handis scorching hot. Everyone at our Diwali get-together kept asking where we ordered from.",
    tag: "Party Host",
  },
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="relative h-full w-[310px] sm:w-[350px] shrink-0 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-card transition-all duration-300 hover:border-gold/50 hover:shadow-gold">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-gold">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 border border-gold/25 px-2 py-0.5 text-[0.65rem] font-bold text-gold">
          <CheckCircle2 className="h-3 w-3" />
          {review.tag}
        </span>
      </div>

      <blockquote className="mt-3.5 font-display text-sm sm:text-base leading-relaxed text-foreground">
        “{review.comment}”
      </blockquote>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <div>
          <p className="font-semibold text-foreground text-sm">{review.name}</p>
          <p className="text-muted-foreground text-[0.72rem]">{review.location}</p>
        </div>
        <div className="text-right">
          <span className="text-[0.68rem] text-gold font-medium block truncate max-w-[130px]">
            {review.order}
          </span>
          <span className="text-[0.65rem] text-muted-foreground/80">{review.handle}</span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialMarqueeSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-secondary/30 py-20 md:py-28 border-y border-border/80">
      <div className="container-page mb-12 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold">
          <Heart className="h-3.5 w-3.5 text-gold fill-gold" />
          Loved Across Kolkata
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Stories from True Biriyani Lovers
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-sm md:text-base text-muted-foreground">
          Over 50,000 dough-sealed handis delivered to homes across Salt Lake, Park Street, New
          Town, and beyond.
        </p>

        {/* Aggregate Ratings Callout */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-gold/25 bg-card px-5 py-2.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-gold font-bold text-lg">
            <span>4.9</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
              ))}
            </div>
          </div>
          <span className="h-4 w-px bg-border" />
          <span className="text-xs font-medium text-foreground">
            3,200+ Verified Foodie Reviews
          </span>
          <span className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-xs font-semibold text-gold hidden sm:block">
            98.4% Would Order Again
          </span>
        </div>
      </div>

      {/* Infinite Scrolling Marquee Container with Edge Fade Gradients */}
      <div className="relative flex w-full flex-col gap-4 overflow-hidden py-2">
        <Marquee pauseOnHover className="[--duration:38s]">
          {REVIEWS_ROW_1.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:42s]">
          {REVIEWS_ROW_2.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </Marquee>

        {/* Edge Fade Gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10" />
      </div>
    </section>
  );
}
