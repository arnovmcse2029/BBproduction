import { createFileRoute } from "@tanstack/react-router";
import { AdminOffers } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/offers")({ component: AdminOffers });
