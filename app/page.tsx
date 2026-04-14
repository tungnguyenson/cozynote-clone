import LandingNav from "./components/landing/LandingNav";
import HeroSection from "./components/landing/HeroSection";
import FeaturesGrid from "./components/landing/FeaturesGrid";
import PricingSection from "./components/landing/PricingSection";
import CTASection from "./components/landing/CTASection";
import LandingFooter from "./components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <PricingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
