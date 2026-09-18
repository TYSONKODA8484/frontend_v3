import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

export const siteMetadata: Metadata = {
  title: "ShootPX — AI Product Photoshoots, Product Videos & UGC Ads for E-commerce",
  description:
    "ShootPX turns one product photo into studio-quality photoshoots with simple pay-as-you-go credits. Built for Shopify, Amazon and Etsy sellers, DTC brands and catalog teams. No studio, no shoot day. Product video and UGC ads coming soon.",
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
  alternates: { canonical: `${siteConfig.url}/` },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "ShootPX — AI Product Photoshoots, Videos & UGC Ads",
    description:
      "One product photo becomes studio-quality stills, pay-as-you-go with credits. Motion clips and UGC ads coming soon.",
    url: `${siteConfig.url}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "ShootPX — AI Product Photoshoots, Videos & UGC Ads",
    description:
      "Turn one product photo into studio stills, product videos and UGC-style ads. Built for e-commerce sellers.",
  },
};
