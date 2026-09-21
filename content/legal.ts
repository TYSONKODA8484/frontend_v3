/** Copy for the two legal pages (/privacy, /terms) — one typed place, nothing hardcoded in components. */

export const LEGAL_LAST_UPDATED = "August 28, 2026";

export type LegalSection = { heading: string; body: string };

export const termsSections: LegalSection[] = [
  {
    heading: "1. Using ShootPX",
    body: "By creating an account or using ShootPX, you agree to these terms. You must be at least 18 years old, or the age of majority in your jurisdiction, to use ShootPX.",
  },
  {
    heading: "2. Credits and billing",
    body: "ShootPX is a credit-based service. One-time credit packs do not expire. Subscription plans renew automatically at the interval selected and grant a fresh credit allowance each cycle; unused subscription credits do not carry over unless stated otherwise at purchase. All sales are final except where required by law.",
  },
  {
    heading: "3. Your content",
    body: "You retain ownership of the product images you upload and the outputs ShootPX generates for you. You must own or have rights to any image you upload. A commercial licence to use generated outputs in your marketing and listings is included with every credit pack and subscription.",
  },
  {
    heading: "4. Acceptable use",
    body: "You may not use ShootPX to generate misleading product claims, infringe on third-party intellectual property, or create content that is illegal, deceptive, or violates the rights of others.",
  },
  {
    heading: "5. Service availability",
    body: 'ShootPX is provided "as is." Some tools described on our site — including Product Motion video, UGC Avatar Ads, and Batch Studio — are in active development and may not yet be available; we will update this notice as they launch.',
  },
  {
    heading: "6. Cancellation and refunds",
    body: "Subscriptions can be cancelled at any time and will remain active through the end of the paid period. Contact us for refund requests on a case-by-case basis.",
  },
  {
    heading: "7. Contact",
    body: "Questions about these terms can be sent to shootpxlabs@gmail.com.",
  },
];

export const privacySections: LegalSection[] = [
  {
    heading: "1. What we collect",
    body: "We collect the account information you give us (email address, sign-in method), the product images and prompts you upload to generate content, billing information processed by our payment provider, and basic usage data such as which tools you use and how many credits you spend.",
  },
  {
    heading: "2. How we use it",
    body: "We use this information to operate the ShootPX generation pipeline, process payments and credit balances, secure your account, respond to support requests, and improve the reliability and quality of our models. We do not sell your product images or personal data to third parties.",
  },
  {
    heading: "3. Uploaded content and generation",
    body: "Images you upload are used to generate the outputs you request and may be temporarily processed by our infrastructure and model providers solely for that purpose. You retain ownership of your uploaded product images and the outputs generated from them.",
  },
  {
    heading: "4. Sharing",
    body: "We share data only with service providers necessary to run ShootPX — cloud hosting, payment processing, and model inference providers bound by confidentiality obligations — and when required by law.",
  },
  {
    heading: "5. Data retention",
    body: "We retain your account data and generated assets for as long as your account is active. You may request deletion of your account and associated content at any time by contacting us.",
  },
  {
    heading: "6. Your choices",
    body: "You can access, update, or delete your account information, and export or delete generated content, from your account settings or by contacting us directly.",
  },
  {
    heading: "7. Contact",
    body: "Questions about this policy can be sent to shootpxlabs@gmail.com.",
  },
];
