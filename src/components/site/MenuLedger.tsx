import { Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Plus, Sparkles, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VegMark } from "@/components/site/Badges";
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
import { formatINR } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface LedgerCourse {
  title: string;
  subtitle: string;
  categoryKey: string;
  items: {
    id: string;
    name: string;
    detail: string;
    price: number;
    serves: string;
    isVeg: boolean;
    tag?: string;
  }[];
}

const COURSES: LedgerCourse[] = [
  {
    title: "Dawat-e-Biriyani",
    subtitle: "Dough-sealed handis slow-steamed over charcoal embers",
    categoryKey: "chicken-biriyani",
    items: [
      {
        id: "kolkata-chicken-biriyani",
        name: "Kolkata Special Chicken Biriyani",
        detail: "Fragrant aged basmati, tender chicken thigh, spiced braised aloo & boiled egg",
        price: 249,
        serves: "Serves 1",
        isVeg: false,
        tag: "Royal Signature",
      },
      {
        id: "kolkata-mutton-biriyani",
        name: "Kolkata Royal Mutton Biriyani",
        detail: "Slow-braised tender baby mutton shank, melting saffron aloo & brown onions",
        price: 349,
        serves: "Serves 1",
        isVeg: false,
        tag: "Bestseller",
      },
      {
        id: "hyderabadi-chicken-dum-biriyani",
        name: "Hyderabadi Kacchi Dum Biriyani",
        detail: "Spicy layered marinade, caramelized birista, fresh mint & saffron broth",
        price: 279,
        serves: "Serves 1",
        isVeg: false,
      },
      {
        id: "chicken-handi-biriyani",
        name: "Awadhi Clay Handi Chicken Biriyani",
        detail: "Slow cooked in traditional handi, sealed with whole wheat dough & kewra essence",
        price: 329,
        serves: "Serves 1-2",
        isVeg: false,
        tag: "Chef's Cut",
      },
    ],
  },
  {
    title: "Bawarchi Shahi Curries",
    subtitle: "Silky, slow-simmered Awadhi gravy companions",
    categoryKey: "chicken-chaap",
    items: [
      {
        id: "chicken-chaap",
        name: "Classic Kolkata Chicken Chaap",
        detail: "Bone-in chicken cut slow-fried in pure desi ghee, cashew-poppy paste & rose water",
        price: 199,
        serves: "2 pieces",
        isVeg: false,
        tag: "Biriyani Soulmate",
      },
      {
        id: "chicken-rezala",
        name: "Royal Mughlai Chicken Rezala",
        detail: "Delicate white aromatic gravy with yoghurt, cashew, mace and green chilli",
        price: 229,
        serves: "2 pieces",
        isVeg: false,
        tag: "Classic Pairing",
      },
    ],
  },
  {
    title: "Feast & Dawat Combos",
    subtitle: "Complete celebratory meals paired with chaap & desserts",
    categoryKey: "combos",
    items: [
      {
        id: "babu-special-combo",
        name: "The Babu Special Feast Combo",
        detail:
          "Kolkata Chicken Biriyani with golden potato and egg, paired with royal Chicken Chaap",
        price: 429,
        serves: "Serves 1-2",
        isVeg: false,
        tag: "Top Value",
      },
      {
        id: "family-feast",
        name: "Royal Family Grand Feast",
        detail: "Two Chicken Handi Biriyanis, two Chicken Chaap plates and two chilled Firnis",
        price: 1199,
        serves: "Serves 3-4",
        isVeg: false,
        tag: "Grand Box",
      },
    ],
  },
  {
    title: "Meetha, Veg & Refreshers",
    subtitle: "Chilled palate cleansers, royal desserts and Awadhi specials",
    categoryKey: "special",
    items: [
      {
        id: "firni",
        name: "Kolkata Matka Shahi Firni",
        detail: "Slow-simmered ground basmati pudding with cardamom, pistachios & kewra essence",
        price: 79,
        serves: "Serves 1",
        isVeg: true,
        tag: "Clay Matka",
      },
      {
        id: "lucknowi-subz-biriyani",
        name: "Lucknowi Subz Dum Biriyani",
        detail: "Awadhi-style vegetable dum biriyani with cauliflower, carrot, peas and fresh mint",
        price: 229,
        serves: "Serves 1",
        isVeg: true,
        tag: "Veg Dum",
      },
      {
        id: "mango-lassi",
        name: "Chilled Mango Lassi",
        detail: "Thick, creamy churned yoghurt sweetened with ripe alphonso mango pulp",
        price: 89,
        serves: "Serves 1",
        isVeg: true,
      },
      {
        id: "masala-chaas",
        name: "Spiced Masala Buttermilk",
        detail: "Refreshing spiced buttermilk tempered with roasted cumin, rock salt & fresh mint",
        price: 59,
        serves: "Serves 1",
        isVeg: true,
      },
    ],
  },
];

export function MenuLedger() {
  const { products } = useStore();
  const cart = useCart();
  const [activeCourse, setActiveCourse] = useState<number>(0);

  const handleQuickAdd = (itemId: string) => {
    const storeItem = products.find((p) => p.id === itemId);
    if (storeItem) {
      if (storeItem.isAvailable) {
        cart.add(storeItem);
      } else {
        toast.error(`${storeItem.name} is currently out of stock`);
      }
    } else {
      toast.error("This dish is not available in the active menu");
    }
  };

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28 text-foreground border-y border-border/80">
      <div className="container-page">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold">
            <Utensils className="h-3.5 w-3.5 text-gold" />
            Awadhi Ledger Menu
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            The Babu Course Selection
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            Crafted according to the classical imperial banquets. Dotted lines lead directly to
            handi-fresh portions, complete with tender spiced aloo and aromatic saffron ghee.
          </p>

          {/* Quick Category Tab Switcher */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {COURSES.map((course, idx) => (
              <button
                key={course.title}
                onClick={() => setActiveCourse(idx)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all duration-200",
                  activeCourse === idx
                    ? "bg-charcoal text-gold shadow-gold border border-gold/40"
                    : "bg-card text-muted-foreground border border-border/80 hover:text-foreground hover:border-gold/30",
                )}
              >
                {course.title}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Grid */}
        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:gap-14">
          {COURSES.map((course, cIdx) => (
            <div
              key={course.title}
              className={cn(
                "rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 shadow-card transition-all duration-300 hover:border-gold/40",
                activeCourse === cIdx && "ring-2 ring-gold/40 bg-card shadow-gold-lg",
              )}
            >
              <div className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold tracking-wide text-foreground flex items-center gap-2">
                    <span className="text-gold font-sans text-xs tracking-widest uppercase bg-gold/15 px-2 py-0.5 rounded-md border border-gold/25">
                      0{cIdx + 1}
                    </span>
                    {course.title}
                  </h3>
                  <span className="text-xs text-gold font-medium">Authentic Awadh</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{course.subtitle}</p>
              </div>

              <ul className="mt-6 flex flex-col gap-6">
                {course.items.map((dish) => {
                  const qty = cart.quantityOf(dish.id);
                  return (
                    <li key={dish.id} className="group relative flex flex-col gap-1.5">
                      <div className="flex items-baseline gap-2">
                        <div className="flex items-center gap-2">
                          <VegMark isVeg={dish.isVeg} className="h-3 w-3 shrink-0" />
                          <Link
                            to="/menu/$productId"
                            params={{ productId: dish.id }}
                            className="font-display text-base sm:text-lg font-semibold text-foreground group-hover:text-gold transition-colors hover:underline"
                          >
                            {dish.name}
                          </Link>
                        </div>

                        {dish.tag && (
                          <span className="hidden sm:inline-block rounded-full bg-gold/15 border border-gold/30 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-gold shrink-0">
                            {dish.tag}
                          </span>
                        )}

                        <span
                          aria-hidden="true"
                          className="min-w-4 flex-1 translate-y-[-0.25rem] border-b border-dotted border-border group-hover:border-gold/50 transition-colors"
                        />

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-display text-base sm:text-lg font-bold text-gold tabular-nums">
                            {formatINR(dish.price)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleQuickAdd(dish.id)}
                            className={cn(
                              "cursor-pointer flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-all duration-200",
                              qty > 0
                                ? "bg-gold text-charcoal shadow-sm"
                                : "bg-charcoal text-ivory hover:bg-gold hover:text-charcoal",
                            )}
                            aria-label={`Add ${dish.name} to order`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>{qty > 0 ? `${qty} in cart` : "Add"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pl-5 pr-1">
                        <p className="line-clamp-2 max-w-[85%]">{dish.detail}</p>
                        <span className="text-[0.68rem] font-medium text-foreground/70 shrink-0 bg-secondary/80 px-2 py-0.5 rounded-full">
                          {dish.serves}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Note Footer */}
        <div className="mt-12 rounded-2xl border border-gold/20 bg-charcoal/5 p-4 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> The Kolkata Tradition:
          </span>
          <span>
            Every Kolkata biriyani includes 1 large braised golden potato and 1 boiled farm egg.
            Extra aloo can be added during checkout.
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-lg text-xs font-semibold ml-auto"
          >
            <Link to="/menu" className="flex items-center gap-1.5">
              <span>View Interactive Menu</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
