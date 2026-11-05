import { createFileRoute } from "@tanstack/react-router";
import { Search, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/site/ProductCard";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState, ErrorState } from "@/components/site/States";
import { useStore } from "@/context/store";
import { CATEGORIES } from "@/data/mock";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

type Sort = "featured" | "price-asc" | "price-desc";

export const Route = createFileRoute("/menu/")({
  validateSearch: (s: Record<string, unknown>): { category?: string } =>
    typeof s.category === "string" ? { category: s.category } : {},
  head: () => ({
    meta: [
      { title: "Our Menu — Biriyani Babu" },
      { name: "description", content: "Browse Biriyani Babu's menu: chicken and mutton biriyani, Chicken Chaap, combos, specials and beverages." },
      { property: "og:title", content: "Our Menu — Biriyani Babu" },
      { property: "og:description", content: "Chicken and mutton biriyani, Chicken Chaap, combos, specials and beverages." },
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
    return list;
  }, [products, category, query, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    products.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [products]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Our Menu"
        title="Slow-cooked, served hot"
        description="Every biriyani is cooked fresh on dum. Pick your favourites and we'll bring them to your door."
      />

      <section className="sticky top-20 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container-page flex flex-col gap-3 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search biriyani, chaap, drinks…"
                aria-label="Search the menu"
                className="h-11 bg-card pl-9"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="h-11 bg-card sm:w-52" aria-label="Sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Sort: Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to high</SelectItem>
                <SelectItem value="price-desc">Price: High to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Categories">
            {CATEGORIES.filter((c) => c.id === "all" || counts[c.id]).map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={category === c.id}
                onClick={() => navigate({ search: c.id === "all" ? {} : { category: c.id }, replace: true })}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  category === c.id
                    ? "border-charcoal bg-charcoal text-gold"
                    : "bg-card text-foreground hover:border-gold",
                )}
              >
                {c.label}
                <span className="ml-1.5 text-xs opacity-60">{counts[c.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 pb-28 md:pb-16">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="h-8 w-8" />}
            title="No dishes found"
            description="Try a different search or category."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
