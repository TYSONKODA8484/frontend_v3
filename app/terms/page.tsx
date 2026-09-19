import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/config/site";
import { termsSections } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using ShootPX: credits, billing, your content, acceptable use and refunds.",
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return <LegalPage title="Terms of Service" sections={termsSections} />;
}
