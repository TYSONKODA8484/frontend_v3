import type { IconType } from "react-icons";
import { FaXTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa6";
import type { SocialPlatform } from "@/lib/config/site";

export const socialIcons: Record<SocialPlatform, IconType> = {
  twitter: FaXTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
};
