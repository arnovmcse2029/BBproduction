import { createFileRoute } from "@tanstack/react-router";
import { Flame, Leaf, Search, UtensilsCrossed, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VegMark } from "@/components/site/Badges";
import { ProductCard } from "@/components/site/ProductCard";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState, ErrorState } from "@/components/site/States";
import { useStore } from "@/context/store";
import { CATEGORIES } from "@/data/mock";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

type Sort = "featured" | "price-asc" | "price-desc";
type DietFilter = "all" | "veg" | "non-veg";

export const Route = createFileRoute("/menu/")({
  validateSearch: (s: Record<string, unknown>): { category?: string } =>
    typeof s["category"] === "string" ? { category: s["category"] } : {},
  head: () => ({
    meta: [
      { title: "Our Royal Menu — Biriyani Babu" },
      {
        name: "description",
        content:
          "Browse Biriyani Babu's authentic menu: Kolkata chicken & mutton biriyani, Chicken Chaap, combo meals, and beverages.",
      },
      { property: "og:title", content: "Our Royal Menu — Biriyani Babu" },
      {
        property: "og:description",
        content: "Kolkata chicken & mutton biriyani, Chicken Chaap, combo meals, and beverages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { products, error, reload } = useStore();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const category = (search.category ?? "all") as ProductCategory | "all";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [diet, setDiet] = useState<DietFilter>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (diet === "all" || (diet === "veg" ? p.isVeg : !p.isVeg)) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
    return list;
  }, [products, category, query, sort, diet]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    products.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [products]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="The Royal Menu"
        title="Slow-Cooked on Dum, Served Boiling Hot"
        description="Every biriyani handi is sealed with fresh dough and simmered slowly over charcoal embers. Pick your favourites for express delivery across Kolkata."
      />

      {/* Sticky Filter & Search Toolbar */}
      <section className="sticky top-20 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container-page flex flex-col gap-3.5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search biriyani, chaap, feast combos, drinks…"
                aria-label="Search the menu"
                className="h-11 bg-card pl-10 pr-9 rounded-xl border-border/80 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Diet Filter Buttons */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card p-1 shrink-0">
              <button
                type="button"
                onClick={() => setDiet("all")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  diet === "all"
                    ? "bg-charcoal text-ivory shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDiet("non-veg")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  diet === "non-veg"
                    ? "bg-charcoal text-ivory shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <VegMark isVeg={false} className="h-3 w-3" /> Non-Veg
              </button>
              <button
                type="button"
                onClick={() => setDiet("veg")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  diet === "veg"
                    ? "bg-charcoal text-ivory shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <VegMark isVeg={true} className="h-3 w-3" /> Veg Only
              </button>
            </div>

            {/* Sort Select */}
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger
                className="h-11 bg-card sm:w-48 rounded-xl border-border/80"
                aria-label="Sort"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="featured">Sort: Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories Pill Tabs */}
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none"
            role="tablist"
            aria-label="Categories"
          >
            {CATEGORIES.filter((c) => c.id === "all" || counts[c.id]).map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={category === c.id}
                onClick={() =>
                  navigate({ search: c.id === "all" ? {} : { category: c.id }, replace: true })
                }
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                  category === c.id
                    ? "border-gold bg-charcoal text-gold shadow-gold"
                    : "border-border/70 bg-card text-foreground/80 hover:border-gold/50 hover:text-foreground",
                )}
              >
                <span>{c.label}</span>
                <span
                  className={cn(
                    "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.68rem] font-bold",
                    category === c.id ? "bg-gold text-charcoal" : "bg-muted text-muted-foreground",
                  )}
                >
                  {counts[c.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Products Grid */}
      <section className="container-page py-10 pb-28 md:pb-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
          <p className="text-sm font-medium text-muted-foreground">
            Showing <strong className="text-foreground">{visible.length}</strong> delicious dish
            {visible.length === 1 ? "" : "es"}
          </p>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Leaf className="h-3.5 w-3.5 text-veg" /> Pure ghee & authentic recipes
          </span>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="h-8 w-8 text-gold" />}
            title="No dishes found"
            description="Try clearing your search query or switching diet / category filters."
          />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <div key={p.id} className="relative">
                {p.isBestseller && (
                  <div className="absolute -top-3 left-4 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-gold via-gold-soft to-gold px-3 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-charcoal shadow-sm">
                    <Flame className="h-3 w-3 fill-charcoal" /> Bestseller
                  </div>
                )}
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
