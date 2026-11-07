import { createFileRoute } from "@tanstack/react-router";
import {
  AboutBlock,
  FeastCtaBanner,
  RoyalCraftSection,
  Testimonials,
  WhyChooseUs,
} from "@/components/site/HomeSections";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story & Heritage — Biriyani Babu" },
      {
        name: "description",
        content:
          "The story of Biriyani Babu: slow-cooked Kolkata biriyani and Bengali Chicken Chaap made the traditional Awadhi way.",
      },
      { property: "og:title", content: "About Us — Biriyani Babu" },
      {
        property: "og:description",
        content: "Slow-cooked Kolkata biriyani and Bengali Chicken Chaap made the traditional way.",
      },
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
        eyebrow="Our Heritage"
        title="Patience, Tradition & Royal Flavours"
        description="Inspired by the Awadhi royal court and crafted for modern Kolkata. Real saffron, slow charcoal dum, and unforgettable memories."
      />
      <AboutBlock withLink={false} />
      <RoyalCraftSection />
      <WhyChooseUs />
      <Testimonials />
      <FeastCtaBanner />
    </SiteLayout>
  );
}
