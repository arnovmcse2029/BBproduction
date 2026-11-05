import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
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
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-transform duration-300 hover:-translate-y-1">
      <Link to="/menu/$productId" params={{ productId: product.id }} className="relative block">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/3]"
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.isBestseller && <Tag>Bestseller</Tag>}
          {!product.isAvailable && <Tag tone="danger">Out of stock</Tag>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-2">
          <VegMark isVeg={product.isVeg} className="mt-1.5" />
          <Link to="/menu/$productId" params={{ productId: product.id }}>
            <h3 className="text-xl font-semibold leading-snug transition-colors hover:text-earth">{product.name}</h3>
          </Link>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div>
            <p className="font-display text-2xl font-semibold">{formatINR(product.price)}</p>
            {product.serves && <p className="text-xs text-muted-foreground">{product.serves}</p>}
          </div>
          {!product.isAvailable ? (
            <Button variant="secondary" disabled>
              Unavailable
            </Button>
          ) : qty > 0 ? (
            <QuantityStepper size="sm" value={qty} min={0} onChange={(v) => cart.setQuantity(product.id, v)} />
          ) : (
            <Button onClick={() => cart.add(product)} className="h-10">
              <ShoppingBag /> Add
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
