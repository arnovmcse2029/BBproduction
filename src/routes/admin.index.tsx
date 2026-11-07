import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });
