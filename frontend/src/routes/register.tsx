import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Biriyani Babu" },
      {
        name: "description",
        content: "Create your customer account and save your delivery address.",
      },
      { property: "og:title", content: "Create account — Biriyani Babu" },
      { property: "og:description", content: "Register for faster checkout and saved addresses." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="New customer"
        title="Create your account"
        description="Set up your profile and default address for faster checkout next time."
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Biriyani Babu
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Join us</h2>
          </div>
          <RegisterForm />
        </div>
      </div>
    </SiteLayout>
  );
}
