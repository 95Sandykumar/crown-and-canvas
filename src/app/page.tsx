import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { buildReviewAggregateJsonLd } from "@/lib/structured-data";
import { TESTIMONIALS } from "@/data/testimonials";
import { HeroSection } from "@/components/home/hero-section";
import { SocialProofBar } from "@/components/home/social-proof-bar";
import { HowItWorks } from "@/components/home/how-it-works";
import { StyleShowcase } from "@/components/home/style-showcase";
import { VideoReels } from "@/components/home/video-reels";
import { GiftBanner } from "@/components/home/gift-banner";
import { Testimonials } from "@/components/home/testimonials";
import { CustomerGallery } from "@/components/home/customer-gallery";
import { TrustBadges } from "@/components/home/trust-badges";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildReviewAggregateJsonLd(TESTIMONIALS)} />
      <HeroSection />
      <SocialProofBar />
      <HowItWorks />
      <StyleShowcase />
      <VideoReels />
      <GiftBanner />
      <Testimonials />
      <CustomerGallery />
      <TrustBadges />
    </>
  );
}
