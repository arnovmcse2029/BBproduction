import type { Product } from "@/types";
import { http, isBackendConnected } from "./api";
import { delay, mockDb } from "./mock-db";

// Planned endpoints: GET /products, POST /products, PUT /products/:id, DELETE /products/:id
export const productsService = {
  async list(): Promise<Product[]> {
    if (isBackendConnected) return http<Product[]>("/products");
    await delay();
    return mockDb.getProducts();
  },
  async create(input: Omit<Product, "id">): Promise<Product> {
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
    if (isBackendConnected)
      return http<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(patch) });
    const all = mockDb.getProducts();
    const next = all.map((p) => (p.id === id ? { ...p, ...patch, id } : p));
    mockDb.setProducts(next);
    return next.find((p) => p.id === id)!;
  },
  async remove(id: string): Promise<void> {
    if (isBackendConnected) {
      await http(`/products/${id}`, { method: "DELETE" });
      return;
    }
    mockDb.setProducts(mockDb.getProducts().filter((p) => p.id !== id));
  },
};
