import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Sparkles, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VegMark } from "@/components/site/Badges";
import { useCart } from "@/context/cart";
import { CATEGORIES, MENU_ITEMS } from "@/data/menu";
import { formatINR } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function MenuLedger() {
  const cart = useCart();
  const [activeCourse, setActiveCourse] = useState<number>(0);
  const courses = CATEGORIES.filter((category) => category.id !== "all")
    .map((category) => ({
      ...category,
      items: MENU_ITEMS.filter((item) => item.category === category.id),
    }))
    .filter((course) => course.items.length > 0);

  const handleQuickAdd = (item: (typeof MENU_ITEMS)[number]) => {
    if (item.isAvailable) {
      cart.add(item);
    } else {
      toast.error(`${item.name} is currently out of stock`);
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
            {courses.map((course, idx) => (
              <button
                key={course.id}
                onClick={() => setActiveCourse(idx)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all duration-200",
                  activeCourse === idx
                    ? "bg-charcoal text-gold shadow-gold border border-gold/40"
                    : "bg-card text-muted-foreground border border-border/80 hover:text-foreground hover:border-gold/30",
                )}
              >
                {course.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Grid */}
        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:gap-14">
          {courses.map((course, cIdx) => (
            <div
              key={course.id}
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
                    {course.label}
                  </h3>
                  <span className="text-xs text-gold font-medium">Authentic Awadh</span>
                </div>
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

                        {dish.isBestseller && (
                          <span className="hidden sm:inline-block rounded-full bg-gold/15 border border-gold/30 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-gold shrink-0">
                            Bestseller
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
                            onClick={() => handleQuickAdd(dish)}
                            disabled={!dish.isAvailable}
                            className={cn(
                              "cursor-pointer flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-all duration-200",
                              qty > 0
                                ? "bg-gold text-charcoal shadow-sm"
                                : "bg-charcoal text-ivory hover:bg-gold hover:text-charcoal",
                            )}
                            aria-label={`Add ${dish.name} to order`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>
                              {!dish.isAvailable
                                ? "Unavailable"
                                : qty > 0
                                  ? `${qty} in cart`
                                  : "Add"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pl-5 pr-1">
                        <p className="line-clamp-2 max-w-[85%]">{dish.description}</p>
                        {dish.serves && (
                          <span className="text-[0.68rem] font-medium text-foreground/70 shrink-0 bg-secondary/80 px-2 py-0.5 rounded-full">
                            {dish.serves}
                          </span>
                        )}
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
