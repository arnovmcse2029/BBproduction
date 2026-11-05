import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag, VegMark } from "@/components/site/Badges";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductImage } from "@/components/site/ProductImage";
import { QuantityStepper } from "@/components/site/QuantityStepper";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState, LoadingState } from "@/components/site/States";
import { useCart } from "@/context/cart";
import { useStore } from "@/context/store";
import { categoryLabel, SEED_PRODUCTS } from "@/data/mock";
import { formatINR } from "@/lib/pricing";

export const Route = createFileRoute("/menu/$productId")({
  head: ({ params }) => {
    const p = SEED_PRODUCTS.find((x) => x.id === params.productId);
    const title = p ? `${p.name} — Biriyani Babu` : "Dish — Biriyani Babu";
    const description = p?.description ?? "A dish from the Biriyani Babu menu.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { productId } = Route.useParams();
  const { products, ready } = useStore();
  const cart = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <SiteLayout>
        <div className="container-page py-20">
          {!ready ? (
            <LoadingState />
          ) : (
            <EmptyState
              title="This dish isn't on the menu"
              description="It may have been removed or renamed."
              action={
                <Button asChild>
                  <Link to="/menu">Back to menu</Link>
                </Button>
              }
            />
          )}
        </div>
      </SiteLayout>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <SiteLayout>
      <div className="container-page py-8 md:py-12">
        <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductImage src={product.image} alt={product.name} className="aspect-square rounded-3xl shadow-card" />

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow">{categoryLabel(product.category)}</span>
              {product.isBestseller && <Tag>Bestseller</Tag>}
            </div>
            <h1 className="mt-4 flex items-start gap-3 text-4xl font-semibold leading-tight md:text-5xl">
              <VegMark isVeg={product.isVeg} className="mt-3" />
              {product.name}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {product.longDescription ?? product.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span>{product.isVeg ? "Vegetarian" : "Non-vegetarian"}</span>
              {product.serves && <span className="text-muted-foreground">{product.serves}</span>}
              <span className={product.isAvailable ? "font-medium text-success" : "font-medium text-destructive"}>
                {product.isAvailable ? "● Available now" : "● Currently out of stock"}
              </span>
            </div>

            <p className="mt-8 font-display text-4xl font-semibold">{formatINR(product.price)}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <QuantityStepper value={qty} onChange={setQty} />
              <Button
                size="xl"
                className="flex-1"
                disabled={!product.isAvailable}
                onClick={() => cart.add(product, qty)}
              >
                <ShoppingBag /> Add to Cart · {formatINR(product.price * qty)}
              </Button>
            </div>
            {cart.quantityOf(product.id) > 0 && (
              <button
                onClick={() => navigate({ to: "/cart" })}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-earth hover:underline"
              >
                <Check className="h-4 w-4" /> {cart.quantityOf(product.id)} in your cart — view cart
              </button>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24 pb-16">
            <h2 className="text-3xl font-semibold">You may also like</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
