import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
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
  alternates: { canonical: "https://shootpx.com/" },
  openGraph: {
    type: "website",
    siteName: "ShootPX",
    title: "ShootPX — AI Product Photoshoots, Videos & UGC Ads",
    description:
      "One product photo becomes studio-quality stills, pay-as-you-go with credits. Motion clips and UGC ads coming soon.",
    url: "https://shootpx.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShootPX — AI Product Photoshoots, Videos & UGC Ads",
    description:
      "Turn one product photo into studio stills, product videos and UGC-style ads. Built for e-commerce sellers.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://shootpx.com/#org",
      name: "ShootPX",
      url: "https://shootpx.com/",
      description:
        "AI product photography, product video and UGC ad generation platform for e-commerce sellers.",
      sameAs: [
        "https://x.com/shootpx",
        "https://instagram.com/shootpx",
        "https://linkedin.com/company/shootpx",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://shootpx.com/#website",
      url: "https://shootpx.com/",
      name: "ShootPX",
      publisher: { "@id": "https://shootpx.com/#org" },
    },
    {
      "@type": "SoftwareApplication",
      name: "ShootPX",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web browser",
      description:
        "Turn one product photo into studio photoshoots, product motion videos and AI UGC ads for Shopify, Amazon and Etsy sellers.",
      offers: [
        { "@type": "Offer", name: "Starter credits", price: "1000", priceCurrency: "INR" },
        { "@type": "Offer", name: "Popular credits", price: "2500", priceCurrency: "INR" },
      ],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "312" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is ShootPX?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ShootPX is an AI product photoshoot and video platform. Upload one product photo and generate studio-quality scenes, product motion clips and AI UGC-style ad videos without booking a studio, camera or creator.",
          },
        },
        {
          "@type": "Question",
          name: "How does ShootPX keep my product looking accurate?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Precise mode locks your product pixel-for-pixel where you place it, preserving logos, labels and details. Creative mode lets the model restage the product for more expressive scenes when accuracy matters less.",
          },
        },
        {
          "@type": "Question",
          name: "Can ShootPX generate product videos?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Product Motion and UGC Avatar Ads are coming soon. Product Motion will turn a still image into a short clip with camera presets like orbit, push-in and pan; UGC Avatar Ads will pair a script with an AI actor for vertical 9:16 ads.",
          },
        },
        {
          "@type": "Question",
          name: "Does ShootPX work for large catalogs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Batch Studio, which will apply one scene preset across up to 250 products per job, is launching soon. Today, products are processed one at a time through the Photoshoot editor.",
          },
        },
        {
          "@type": "Question",
          name: "Which marketplaces are supported for export?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ShootPX exports at marketplace-ready sizes for Shopify, Amazon, Etsy and paid social, including 4K masters on paid plans.",
          },
        },
        {
          "@type": "Question",
          name: "How does ShootPX pricing work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ShootPX runs on credits, not a subscription. Buy a credit pack once and spend credits only on the generations you use, with no recurring charge.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-bg text-text">{children}</body>
    </html>
  );
}
