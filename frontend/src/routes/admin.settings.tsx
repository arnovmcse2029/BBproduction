import { createFileRoute } from "@tanstack/react-router";
import { AdminSettings } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });
