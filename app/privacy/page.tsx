import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/config/site";
import { privacySections } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ShootPX collects, uses and protects your account data and uploaded images.",
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" sections={privacySections} />;
}
