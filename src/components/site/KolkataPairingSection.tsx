import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Flame, Heart, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
import { images } from "@/data/images";
import { formatINR } from "@/lib/pricing";

export function KolkataPairingSection() {
  const { products } = useStore();
  const cart = useCart();
  const [addedCombo, setAddedCombo] = useState(false);

  const biriyani = products.find((p) => p.id === "kolkata-chicken-biriyani") ?? products[0];
  const chaap = products.find((p) => p.id === "chicken-chaap") ?? products[1];

  const handleAddDuo = () => {
    if (biriyani) cart.add(biriyani);
    if (chaap) cart.add(chaap);
    setAddedCombo(true);
    setTimeout(() => setAddedCombo(false), 2500);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1512] via-charcoal to-[#14110f] py-20 md:py-28 text-ivory border-y border-gold/20">
      <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-red-900/20 blur-3xl" />

      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Visual Duo Plates */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg">
              {/* Biriyani Plate */}
              <div className="relative z-10 overflow-hidden rounded-3xl border-2 border-gold/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
                <img
                  src={images.chickenBiriyani}
                  alt="Kolkata Chicken Biriyani with golden aloo and boiled egg"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-charcoal/90 px-3 py-1 font-semibold text-gold border border-gold/30">
                    Kolkata Chicken Biriyani
                  </span>
                  <span className="font-display text-base font-bold text-gold">₹249</span>
                </div>
              </div>

              {/* Floating Chaap Plate Overlap */}
              <div className="absolute -bottom-10 -right-4 sm:-right-8 z-20 w-3/5 overflow-hidden rounded-2xl border-2 border-gold/50 shadow-gold-lg backdrop-blur-md">
                <img
                  src={images.handiBiriyani}
                  alt="Kolkata Chicken Chaap slow fried in pure desi ghee"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-charcoal/90 px-2.5 py-0.5 font-semibold text-gold border border-gold/25 truncate max-w-[70%]">
                    Chicken Chaap
                  </span>
                  <span className="font-display text-sm font-bold text-gold">₹199</span>
                </div>
              </div>

              {/* Plus Badge in center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-charcoal font-bold text-xl shadow-gold border-2 border-charcoal">
                +
              </div>
            </div>
          </div>

          {/* Right: Narrative & Direct 1-Click Order */}
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold mb-3 shadow-gold">
              <Heart className="h-3.5 w-3.5 text-gold fill-gold" /> The Kolkata Love Affair
            </span>

            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl text-ivory">
              Because biriyani without chaap is simply incomplete.
            </h2>

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-ivory-muted/90">
              In the historic food alleys of Kolkata, true connoisseurs never order just biriyani.
              The dry, fragrant, saffron-scented basmati rice finds its soulmate in the
              slow-simmered, nutty, ghee-fried{" "}
              <strong className="text-ivory">Kolkata Chicken Chaap</strong> made with poppy seeds
              and rich cashew paste.
            </p>

            <ul className="mt-6 space-y-3 text-xs sm:text-sm text-ivory-muted">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold border border-gold/40">
                  <Check className="h-3 w-3" />
                </span>
                <span>Includes 1 large braised golden potato & 1 boiled farm egg</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold border border-gold/40">
                  <Check className="h-3 w-3" />
                </span>
                <span>Velvety cashew & poppy gravy cooked in slow cow ghee</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-gold border border-gold/40">
                  <Check className="h-3 w-3" />
                </span>
                <span>Double-sealed insulated packing ensures handis stay piping hot</span>
              </li>
            </ul>

            {/* Special Duo Price & Quick Action */}
            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-gold/30 bg-charcoal-soft/80 p-5 shadow-gold">
              <div>
                <span className="text-[0.68rem] uppercase tracking-wider text-ivory-muted/80 block font-medium">
                  The Royal Pair (Biriyani + Chaap)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-gold">₹448</span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    Free Accompaniment Raita
                  </span>
                </div>
              </div>

              <div className="ml-auto">
                <Button
                  onClick={handleAddDuo}
                  variant="gold"
                  size="xl"
                  className="rounded-xl px-7 font-semibold shadow-gold hover:shadow-gold-lg"
                >
                  {addedCombo ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Added to Your Feast!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add Royal Duo to Order
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
