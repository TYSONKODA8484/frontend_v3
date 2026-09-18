import { getBilling, getTools } from "@/lib/api";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustMarquee } from "@/components/TrustMarquee";
import { Outcomes } from "@/components/Outcomes";
import { Platform } from "@/components/Platform";
import { Toolkit } from "@/components/Toolkit";
import { HowItWorks } from "@/components/HowItWorks";
import { UseCases } from "@/components/UseCases";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { Faq } from "@/components/Faq";
import { CtaSignup } from "@/components/CtaSignup";
import { Footer } from "@/components/Footer";

export default async function Home() {
  const [tools, billing] = await Promise.all([getTools(), getBilling()]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustMarquee />
        <Outcomes />
        <Platform />
        <Toolkit tools={tools.tools} />
        <HowItWorks />
        <UseCases />
        <Testimonials />
        <Pricing billing={billing} />
        <Faq />
        <CtaSignup />
      </main>
      <Footer />
    </>
  );
}
