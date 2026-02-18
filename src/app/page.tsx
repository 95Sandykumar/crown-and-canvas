import { HeroSection } from "@/components/home/hero-section";
import { SocialProofBar } from "@/components/home/social-proof-bar";
import { HowItWorks } from "@/components/home/how-it-works";
import { StyleShowcase } from "@/components/home/style-showcase";
import { VideoReels } from "@/components/home/video-reels";
import { GiftBanner } from "@/components/home/gift-banner";
import { Testimonials } from "@/components/home/testimonials";
import { TrustBadges } from "@/components/home/trust-badges";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProofBar />
      <HowItWorks />
      <StyleShowcase />
      <VideoReels />
      <GiftBanner />
      <Testimonials />
      <TrustBadges />
    </>
  );
}
