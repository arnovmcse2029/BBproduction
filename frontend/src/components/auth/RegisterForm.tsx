import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import {
  EmailConfirmationRequired,
  isValidIndianPhone,
  isValidPinCode,
  sanitizeRedirectPath,
} from "@/services/auth.service";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().email("Please enter a valid email address."),
    mobile: z
      .string()
      .trim()
      .refine((value) => isValidIndianPhone(value), {
        message: "Enter a valid 10-digit Indian mobile number.",
      }),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    house: z.string().trim().min(1, "House / flat number is required."),
    street: z.string().trim().min(1, "Street / road is required."),
    locality: z.string().trim().min(1, "Area or locality is required."),
    landmark: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required."),
    state: z.string().trim().min(1, "State is required."),
    pincode: z
      .string()
      .trim()
      .refine((value) => isValidPinCode(value), {
        message: "PIN code must be a valid 6-digit Indian PIN code.",
      }),
    addressType: z.enum(["Home", "Work", "Other"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerAccount, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      house: "",
      street: "",
      locality: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      addressType: "Home",
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
      await registerAccount({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
        rememberMe: true,
        address: {
          house: values.house,
          street: values.street,
          locality: values.locality,
          ...(values.landmark ? { landmark: values.landmark } : {}),
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          addressType: values.addressType,
        },
      });
      toast.success("Account created. You are signed in.");
      navigate({ to: redirectTarget, replace: true });
    } catch (error) {
      if (error instanceof EmailConfirmationRequired) {
        toast.success(error.message);
        navigate({ to: "/login", search: { redirect: redirectTarget }, replace: true });
        return;
      }
      const message = error instanceof Error ? error.message : "Unable to create your account.";
      toast.error(message);
    }
  });

  function fieldError(name: keyof RegisterFormValues) {
    return errors[name]?.message;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            className={fieldError("firstName") ? "border-destructive" : ""}
          />
          {fieldError("firstName") && (
            <p className="text-sm text-destructive">{fieldError("firstName")}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            className={fieldError("lastName") ? "border-destructive" : ""}
          />
          {fieldError("lastName") && (
            <p className="text-sm text-destructive">{fieldError("lastName")}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className={fieldError("email") ? "border-destructive" : ""}
          />
          {fieldError("email") && <p className="text-sm text-destructive">{fieldError("email")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile number</Label>
          <Input
            id="mobile"
            type="tel"
            {...register("mobile")}
            className={fieldError("mobile") ? "border-destructive" : ""}
          />
          {fieldError("mobile") && (
            <p className="text-sm text-destructive">{fieldError("mobile")}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={fieldError("password") ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldError("password") && (
            <p className="text-sm text-destructive">{fieldError("password")}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={fieldError("confirmPassword") ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-3 text-muted-foreground"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldError("confirmPassword") && (
            <p className="text-sm text-destructive">{fieldError("confirmPassword")}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <h3 className="mb-4 text-base font-semibold">Default delivery address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="house">House / flat / building number</Label>
            <Input
              id="house"
              {...register("house")}
              className={fieldError("house") ? "border-destructive" : ""}
            />
            {fieldError("house") && (
              <p className="text-sm text-destructive">{fieldError("house")}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="street">Street / road</Label>
            <Input
              id="street"
              {...register("street")}
              className={fieldError("street") ? "border-destructive" : ""}
            />
            {fieldError("street") && (
              <p className="text-sm text-destructive">{fieldError("street")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="locality">Locality / area</Label>
            <Input
              id="locality"
              {...register("locality")}
              className={fieldError("locality") ? "border-destructive" : ""}
            />
            {fieldError("locality") && (
              <p className="text-sm text-destructive">{fieldError("locality")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark (optional)</Label>
            <Input id="landmark" {...register("landmark")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register("city")}
              className={fieldError("city") ? "border-destructive" : ""}
            />
            {fieldError("city") && <p className="text-sm text-destructive">{fieldError("city")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              {...register("state")}
              className={fieldError("state") ? "border-destructive" : ""}
            />
            {fieldError("state") && (
              <p className="text-sm text-destructive">{fieldError("state")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">PIN code</Label>
            <Input
              id="pincode"
              {...register("pincode")}
              className={fieldError("pincode") ? "border-destructive" : ""}
            />
            {fieldError("pincode") && (
              <p className="text-sm text-destructive">{fieldError("pincode")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressType">Address type</Label>
            <select
              id="addressType"
              {...register("addressType")}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
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
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleAuthButton redirectTo={redirectTarget} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          search={{ redirect: undefined }}
          className="font-semibold text-gold hover:underline"
        >
          Login instead
        </Link>
      </p>
    </form>
  );
}
