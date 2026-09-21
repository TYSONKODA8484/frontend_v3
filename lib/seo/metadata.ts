import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

const description =
  "ShootPX turns one product photo into studio-style images with AI. Listing photoshoots, creative scenes, recolor and model shoots for e-commerce sellers, paid with credits.";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  // The tab is just the brand; inner pages become "Page · ShootPX".
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description,
  applicationName: siteConfig.name,
  keywords: [
    "AI product photography",
    "product photoshoot generator",
    "ecommerce product images",
    "Shopify product photos",
    "product recolor",
    "AI model shoot",
  ],
  robots: "index, follow, max-image-preview:large",
  // No root-level canonical: it would be inherited by every page. Public pages
  // set their own (see app/page.tsx).
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description:
      "Turn one product photo into studio-style images: listing photoshoots, creative scenes, recolor and model shoots.",
    url: `${siteConfig.url}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description:
      "Turn one product photo into studio-style images: listing photoshoots, creative scenes, recolor and model shoots.",
  },
  // Search Console / Bing verification tokens — set in the environment.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};
