import { getTools } from "@/lib/api/tools";
import { getBilling } from "@/lib/api/billing";
import { HomeAuthRedirect } from "@/components/HomeAuthRedirect";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { Outcomes } from "@/components/sections/Outcomes";
import { Platform } from "@/components/sections/Platform";
import { Toolkit } from "@/components/sections/Toolkit/Toolkit";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { UseCases } from "@/components/sections/UseCases";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing/Pricing";
import { Faq } from "@/components/sections/Faq";
import { CtaSignup } from "@/components/sections/CtaSignup";

export default async function Home() {
  const [tools, billing] = await Promise.all([getTools(), getBilling()]);

  return (
    <>
      <HomeAuthRedirect />
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
