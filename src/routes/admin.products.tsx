import { createFileRoute } from "@tanstack/react-router";
import { AdminProducts } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });
