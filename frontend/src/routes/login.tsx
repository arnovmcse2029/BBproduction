import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login — Biriyani Babu" },
      { name: "description", content: "Log in to manage your Biriyani Babu account." },
      { property: "og:title", content: "Login — Biriyani Babu" },
      { property: "og:description", content: "Access your profile, addresses and orders." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Welcome back"
        title="Login to your account"
        description="Continue your Biriyani Babu order or manage your saved details."
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Biriyani Babu
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Welcome back</h2>
          </div>
          <LoginForm />
        </div>
      </div>
    </SiteLayout>
  );
}
