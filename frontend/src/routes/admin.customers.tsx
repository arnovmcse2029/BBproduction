import { createFileRoute } from "@tanstack/react-router";
import { AdminCustomers } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/customers")({ component: AdminCustomers });
