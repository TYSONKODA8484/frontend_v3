import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { withComingSoon } from "@/content/coming-soon-tools";
import { getTools } from "@/lib/api/tools";
import { getBilling } from "@/lib/api/billing";
import { HomeAuthRedirect } from "@/components/HomeAuthRedirect";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustMarquee } from "@/components/sections/TrustMarquee";
import { Platform } from "@/components/sections/Platform";
import { Toolkit } from "@/components/sections/Toolkit/Toolkit";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { UseCases } from "@/components/sections/UseCases";
import { Pricing } from "@/components/sections/Pricing/Pricing";
import { Faq } from "@/components/sections/Faq";
import { CtaSignup } from "@/components/sections/CtaSignup";

// The landing page is the canonical "/"; other pages set their own.
export const metadata: Metadata = { alternates: { canonical: `${siteConfig.url}/` } };

export default async function Home() {
  const [tools, billing] = await Promise.all([getTools(), getBilling()]);

  return (
    <>
      <HomeAuthRedirect />
      <Header />
      <main>
        <Hero />
        <TrustMarquee />
        <Platform />
        {/* Landing shows live tools plus the SOON teasers; the studio lists live only. */}
        <Toolkit tools={withComingSoon(tools.tools)} />
        <HowItWorks />
        <UseCases />
        <Pricing billing={billing} />
        <Faq />
        <CtaSignup />
      </main>
      <Footer />
    </>
  );
}
