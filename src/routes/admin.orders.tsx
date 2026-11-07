import { createFileRoute } from "@tanstack/react-router";
import { AdminOrders } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });
