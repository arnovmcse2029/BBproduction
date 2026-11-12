import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Biriyani Babu" },
      { name: "description", content: "Reset your Biriyani Babu password by email." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await requestPasswordReset(values.email);
      setMessage(response);
      setSent(true);
      toast.success("Reset link requested.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to process your request.";
      toast.error(text);
    }
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Account"
        title="Forgot password"
        description="We will email you a link to choose a new password."
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          {!sent ? (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  className={errors.email ? "border-destructive" : ""}
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
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
                    Processing...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm text-foreground">
              <p className="font-medium text-gold">Check your email</p>
              <p>{message}</p>
              <div className="flex gap-3">
                <Button asChild variant="gold" size="xl" className="rounded-xl">
                  <Link to="/login" search={{ redirect: undefined }}>
                    Back to login
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl" className="rounded-xl">
                  <Link to="/">Continue browsing</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
