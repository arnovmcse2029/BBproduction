import type { Product } from "@/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { CATEGORIES } from "@/data/mock";
import { http, isBackendConnected } from "./api";
import { delay, mockDb } from "./mock-db";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  long_description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  serves: string | null;
};

function fromProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ...(row.long_description ? { longDescription: row.long_description } : {}),
    price: Number(row.price),
    category: row.category_id as Product["category"],
    ...(row.image_url ? { image: row.image_url } : {}),
    isVeg: row.is_veg,
    isAvailable: row.is_available,
    isBestseller: row.is_bestseller,
    ...(row.serves ? { serves: row.serves } : {}),
  };
}

function toProductRow(product: Omit<Product, "id">) {
  return {
    name: product.name,
    description: product.description,
    long_description: product.longDescription ?? null,
    price: product.price,
    category_id: product.category,
    image_url: product.image ?? null,
    is_veg: product.isVeg,
    is_available: product.isAvailable,
    is_bestseller: product.isBestseller,
    serves: product.serves ?? null,
  };
}

function catalogError(message: string) {
  const setupHint = /PGRST205|schema cache/i.test(message)
    ? " This is the separate database-backed admin catalog; customer menu items are managed in src/data/menu.ts."
    : "";
  return new Error(`${message}${setupHint}`);
}

export const productsService = {
  async list(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase().from("products").select("*").order("name");
      if (error) throw catalogError(error.message);
      return (data as ProductRow[]).map(fromProductRow);
    }
    if (isBackendConnected) return http<Product[]>("/products");
    await delay();
    return mockDb.getProducts();
  },

  async listCategories() {
    if (isSupabaseConfigured()) {
      const { data, error } = await getSupabase()
        .from("categories")
        .select("id, name")
        .order("name");
      if (error) throw catalogError(error.message);
      return (data ?? []).map((row) => ({
        id: row.id as Product["category"],
        label: row.name,
      }));
    }
    return CATEGORIES.filter((category) => category.id !== "all").map((category) => ({
      id: category.id,
      label: category.label,
    }));
  },

  async create(input: Omit<Product, "id">): Promise<Product> {
    if (isSupabaseConfigured()) {
      const base =
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "item";
      const { data, error } = await getSupabase()
        .from("products")
        .insert({ id: base, ...toProductRow(input) })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return fromProductRow(data as ProductRow);
    }
    if (isBackendConnected)
      return http<Product>("/products", { method: "POST", body: JSON.stringify(input) });
    const base =
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "item";
    const all = mockDb.getProducts();
    const id = all.some((p) => p.id === base) ? `${base}-${Date.now().toString(36)}` : base;
    const product = { ...input, id };
    mockDb.setProducts([...all, product]);
    return product;
  },
  async update(id: string, patch: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured()) {
      const update = {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.longDescription !== undefined ? { long_description: patch.longDescription } : {}),
        ...(patch.price !== undefined ? { price: patch.price } : {}),
        ...(patch.category !== undefined ? { category_id: patch.category } : {}),
        ...(patch.image !== undefined ? { image_url: patch.image } : {}),
        ...(patch.isVeg !== undefined ? { is_veg: patch.isVeg } : {}),
        ...(patch.isAvailable !== undefined ? { is_available: patch.isAvailable } : {}),
        ...(patch.isBestseller !== undefined ? { is_bestseller: patch.isBestseller } : {}),
        ...(patch.serves !== undefined ? { serves: patch.serves } : {}),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await getSupabase()
        .from("products")
        .update(update)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return fromProductRow(data as ProductRow);
    }
    if (isBackendConnected)
      return http<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(patch) });
    const all = mockDb.getProducts();
    const next = all.map((p) => (p.id === id ? { ...p, ...patch, id } : p));
    mockDb.setProducts(next);
    return next.find((p) => p.id === id)!;
  },
  async remove(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await getSupabase().from("products").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return;
    }
    if (isBackendConnected) {
      await http(`/products/${id}`, { method: "DELETE" });
      return;
    }
    mockDb.setProducts(mockDb.getProducts().filter((p) => p.id !== id));
  },
};
