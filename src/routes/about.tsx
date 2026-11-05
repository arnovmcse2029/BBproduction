import { createFileRoute } from "@tanstack/react-router";
import { AboutBlock, Testimonials, WhyChooseUs } from "@/components/site/HomeSections";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Biriyani Babu" },
      { name: "description", content: "The story of Biriyani Babu: slow-cooked Kolkata biriyani and Bengali Chicken Chaap made the traditional way." },
      { property: "og:title", content: "About Us — Biriyani Babu" },
      { property: "og:description", content: "Slow-cooked Kolkata biriyani and Bengali Chicken Chaap made the traditional way." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About Us"
        title="Our food philosophy"
        description="Patience, real ingredients and recipes handed down through generations."
      />
      <AboutBlock withLink={false} />
      <WhyChooseUs />
      <Testimonials />
    </SiteLayout>
  );
}
