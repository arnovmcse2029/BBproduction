import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type ResetValues = z.infer<typeof resetSchema>;

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Biriyani Babu" },
      { name: "description", content: "Choose a new password for your Biriyani Babu account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updatePassword(values.password);
      toast.success("Password updated. You can continue with this account.");
      navigate({ to: "/", replace: true });
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to update your password.";
      toast.error(text);
    }
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Account"
        title="Choose a new password"
        description="Open the link from your email, then set a new password here."
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Checking your reset link…</p>
          ) : !isAuthenticated ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>This page needs the link from your password reset email.</p>
              <Button asChild variant="gold" size="xl" className="rounded-xl">
                <Link to="/forgot-password">Request a new link</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className={errors.password ? "border-destructive" : ""}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button
                type="submit"
                variant="gold"
                size="xl"
                className="w-full rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
