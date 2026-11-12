import { createFileRoute } from "@tanstack/react-router";
import { ContactBlock } from "@/components/site/HomeSections";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Biriyani Babu" },
      { name: "description", content: "Contact Biriyani Babu: phone, address and opening hours." },
      { property: "og:title", content: "Contact — Biriyani Babu" },
      {
        property: "og:description",
        content: "Phone, address and opening hours for Biriyani Babu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="We'd love to feed you"
        description="Order online for home delivery, or reach us using the details below."
      />
      <ContactBlock />
    </SiteLayout>
  );
}
