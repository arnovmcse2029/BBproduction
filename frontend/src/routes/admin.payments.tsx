import { createFileRoute } from "@tanstack/react-router";
import { AdminPayments } from "@/components/admin/AdminPages";

export const Route = createFileRoute("/admin/payments")({ component: AdminPayments });
