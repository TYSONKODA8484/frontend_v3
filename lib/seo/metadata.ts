import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

const description =
  "ShootPX turns one product photo into studio-quality photoshoots with simple pay-as-you-go credits. Built for Shopify, Amazon and Etsy sellers, DTC brands and catalog teams. No studio, no shoot day. Product video and UGC ads coming soon.";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  // The tab is just the brand; inner pages become "Page · ShootPX".
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description,
  applicationName: siteConfig.name,
  keywords: [
    "AI product photography",
    "product photoshoot generator",
    "AI UGC ads",
    "product video generator",
    "ecommerce product images",
    "Shopify product photos",
    "background remover",
    "AI mockups",
  ],
  robots: "index, follow, max-image-preview:large",
  // No root-level canonical: it would be inherited by every page. Public pages
  // set their own (see app/page.tsx).
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description:
      "One product photo becomes studio-quality stills, pay-as-you-go with credits. Motion clips and UGC ads coming soon.",
    url: `${siteConfig.url}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description:
      "Turn one product photo into studio stills, product videos and UGC-style ads. Built for e-commerce sellers.",
  },
  // Search Console / Bing verification tokens — set in the environment.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};
