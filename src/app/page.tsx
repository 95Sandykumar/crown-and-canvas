import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { StyleShowcase } from "@/components/home/style-showcase";
import { Testimonials } from "@/components/home/testimonials";
import { GiftBanner } from "@/components/home/gift-banner";
import { TrustBadges } from "@/components/home/trust-badges";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <StyleShowcase />
      <GiftBanner />
      <Testimonials />
      <TrustBadges />
    </>
  );
}
