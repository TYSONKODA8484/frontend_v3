export type SocialPlatform = "twitter" | "instagram" | "linkedin" | "youtube";

export const socialLabels: Record<SocialPlatform, string> = {
  twitter: "X (Twitter)",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

/**
 * Add a platform here (with its live profile URL) to make it appear in the
 * footer and in the Organization JSON-LD `sameAs` list. Remove a line to
 * take it down everywhere at once. No other file needs to change.
 */
export const siteConfig = {
  name: "ShootPX",
  url: "https://shootpx.com",
  contactEmail: "hello@shootpx.com",
  supportEmail: "shootpxlabs@gmail.com",
  social: {
    instagram: "https://instagram.com/shootpx",
  } satisfies Partial<Record<SocialPlatform, string>>,
};
