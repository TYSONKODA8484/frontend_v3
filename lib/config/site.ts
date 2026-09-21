export type SocialPlatform = "twitter" | "instagram" | "linkedin" | "youtube";

export const socialLabels: Record<SocialPlatform, string> = {
  twitter: "X (Twitter)",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

/**
 * Social profiles — edit the URLs here. A platform with a URL appears in the
 * footer and in the Organization JSON-LD `sameAs` list; leave it "" to hide it
 * everywhere. No other file needs to change.
 */
const socialUrls: Record<SocialPlatform, string> = {
  twitter: "",
  instagram: "https://www.instagram.com/shootpx_labs",
  linkedin: "",
  youtube: "",
};

const activeSocial = Object.fromEntries(
  Object.entries(socialUrls).filter(([, url]) => url.trim() !== ""),
) as Partial<Record<SocialPlatform, string>>;

/** New-account welcome credits. A temporary launch offer — change it here only. */
export const SIGNUP_CREDITS = 5;
export const SIGNUP_CREDITS_NOTE = "Launch offer. May change or end without notice.";

export const siteConfig = {
  name: "ShootPX",
  url: "https://shootpx.com",
  supportEmail: "shootpxlabs@gmail.com",
  social: activeSocial,
};
