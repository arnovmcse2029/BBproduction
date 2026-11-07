import { Link } from "@tanstack/react-router";
import { Plus, ShoppingBag, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";
import { formatINR } from "@/lib/pricing";
import type { Product } from "@/types";
import { Tag, VegMark } from "./Badges";
import { ProductImage } from "./ProductImage";
import { QuantityStepper } from "./QuantityStepper";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const qty = cart.quantityOf(product.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-[0_18px_36px_-12px_rgba(198,155,80,0.22)] transition-shadow">
      <Link
        to="/menu/$productId"
        params={{ productId: product.id }}
        className="relative block overflow-hidden"
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/3]"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-108 group-hover:brightness-110"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2 z-10">
          {product.isBestseller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold via-gold-soft to-gold px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-charcoal shadow-sm">
              <Sparkles className="h-3 w-3 fill-charcoal" /> Bestseller
            </span>
          )}
          {!product.isAvailable && <Tag tone="danger">Out of stock</Tag>}
        </div>

        {product.serves && (
          <div className="absolute right-3 bottom-3 z-10 rounded-full bg-charcoal/80 backdrop-blur-md px-2.5 py-1 text-[0.7rem] font-medium text-ivory flex items-center gap-1 border border-gold/20">
            <Users className="h-3 w-3 text-gold" />
            <span>{product.serves}</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-2.5">
          <VegMark isVeg={product.isVeg} className="mt-1" />
          <Link to="/menu/$productId" params={{ productId: product.id }} className="flex-1">
            <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-gold-foreground hover:text-gold">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6 border-t border-border/60">
          <div>
            <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground block font-medium">
              Price
            </span>
            <p className="font-display text-2xl font-bold text-foreground">
              {formatINR(product.price)}
            </p>
          </div>

          {!product.isAvailable ? (
            <Button
              variant="secondary"
              disabled
              className="h-10 px-4 rounded-xl text-xs font-semibold"
            >
              Unavailable
            </Button>
          ) : qty > 0 ? (
            <div className="bg-charcoal/5 rounded-xl p-0.5 border border-gold/30">
              <QuantityStepper
                size="sm"
                value={qty}
                min={0}
                onChange={(v) => cart.setQuantity(product.id, v)}
              />
            </div>
          ) : (
            <Button
              onClick={() => cart.add(product)}
              variant="gold"
              className="h-10 rounded-xl px-4 font-semibold shadow-gold hover:shadow-gold-lg transition-all duration-300"
            >
              <Plus className="h-4 w-4" /> Add to Handi
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
