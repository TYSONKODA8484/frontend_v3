import { siteConfig } from "@/lib/config/site";
import { faqs } from "@/content/faq";

export function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#org`,
        name: siteConfig.name,
        url: `${siteConfig.url}/`,
        description:
          "AI product photography, product video and UGC ad generation platform for e-commerce sellers.",
        sameAs: Object.values(siteConfig.social),
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: `${siteConfig.url}/`,
        name: siteConfig.name,
        publisher: { "@id": `${siteConfig.url}/#org` },
      },
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web browser",
        description:
          "Turn one product photo into studio photoshoots, product motion videos and AI UGC ads for Shopify, Amazon and Etsy sellers.",
        offers: [
          { "@type": "Offer", name: "Starter credits", price: "1000", priceCurrency: "INR" },
          { "@type": "Offer", name: "Popular credits", price: "2500", priceCurrency: "INR" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
