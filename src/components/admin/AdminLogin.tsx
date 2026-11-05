import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { images } from "@/data/images";
import { adminService, DEMO_ADMIN } from "@/services/admin.service";

export function AdminLogin({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address";
    if (password.length < 4) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const res = await adminService.login(email, password);
      onSuccess(res.email);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-charcoal p-4">
      <img src={images.restaurantInterior} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="relative w-full max-w-md rounded-2xl border border-gold/20 bg-card p-8 shadow-gold">
        <div className="mx-auto -mt-20 mb-4 flex h-28 w-28 items-center justify-center rounded-full border border-gold/30 bg-charcoal p-2">
          <img src={images.logo} alt="Biriyani Babu" className="h-full w-full object-contain" />
        </div>
        <h1 className="text-center text-2xl font-semibold">Restaurant admin</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Sign in to manage orders and the menu.</p>

        <div className="mt-6 flex gap-2 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-earth" />
          <div>
            <p className="font-semibold">Demo login — not secure authentication.</p>
            <p className="mt-0.5 text-muted-foreground">
              Use <span className="font-mono">{DEMO_ADMIN.email}</span> / <span className="font-mono">{DEMO_ADMIN.password}</span>.
              Real sign-in arrives with the restaurant backend.
            </p>
          </div>
        </div>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <div>
            <Label htmlFor="admin-email" className="mb-1.5 block">Email</Label>
            <Input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" aria-invalid={!!errors.email} />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="admin-password" className="mb-1.5 block">Password</Label>
            <div className="relative">
              <Input id="admin-password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pr-11" aria-invalid={!!errors.password} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
          </div>
          {errors.form && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{errors.form}</p>}
          <Button type="submit" size="xl" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
