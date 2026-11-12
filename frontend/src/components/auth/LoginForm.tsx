import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { sanitizeRedirectPath } from "@/services/auth.service";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const requestedRedirect = (location.search as Record<string, unknown> | undefined)?.["redirect"];
  const redirectTarget = sanitizeRedirectPath(requestedRedirect);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: redirectTarget, replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTarget]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      toast.success("Welcome back! Redirecting you to your destination.");
      navigate({ to: redirectTarget, replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to log in right now.";
      toast.error(message);
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email address</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          className={errors.email ? "border-destructive" : ""}
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 text-muted-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={watch("rememberMe")}
            onCheckedChange={(checked) =>
              setValue("rememberMe", !!checked, { shouldValidate: true })
            }
          />
          <Label htmlFor="rememberMe" className="!mb-0 cursor-pointer text-muted-foreground">
            Remember me
          </Label>
        </div>
        <Link to="/forgot-password" className="font-medium text-gold hover:underline">
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="gold"
        size="xl"
        className="w-full rounded-xl"
        disabled={isSubmitting || isLoading || isAuthenticated}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Login"
        )}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleAuthButton redirectTo={redirectTarget} />

      <p className="text-center text-sm text-muted-foreground">
        New to Biriyani Babu?{" "}
        <Link to="/register" className="font-semibold text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
