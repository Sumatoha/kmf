import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DashboardShowcase } from "@/components/landing/dashboard-showcase";
import { BotPreview } from "@/components/landing/bot-preview";
import { Stats } from "@/components/landing/stats";
import { CaseStudy } from "@/components/landing/case-study";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DashboardShowcase />
        <BotPreview />
        <Stats />
        <CaseStudy />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
