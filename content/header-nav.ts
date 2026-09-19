export type NavSubItem = {
  name: string;
  desc: string;
  href: string;
  badge?: string | null;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  items: NavSubItem[] | null;
};

export const navItems: NavItem[] = [
  {
    id: "platform",
    label: "Platform",
    href: "#platform",
    items: [
      { name: "AI Photoshoot", desc: "Stage products on a canvas and generate scenes", href: "#platform" },
      { name: "Product Motion", desc: "Still to video clip", href: "#platform", badge: "SOON" },
      { name: "UGC Avatar Ads", desc: "Script plus AI actor", href: "#platform", badge: "SOON" },
      { name: "Batch Studio", desc: "One preset across 250 products", href: "#tools", badge: "SOON" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    href: "#tools",
    items: [
      { name: "Background Swap", desc: "One-click cutout and scene replacement", href: "#tools" },
      { name: "Mockup Studio", desc: "Apparel, packaging and device mockups", href: "#tools" },
      { name: "On-Model Shots", desc: "AI models and ghost mannequin renders", href: "#tools" },
      { name: "Finishing suite", desc: "Erase, relight, upscale 4K, outpaint", href: "#tools" },
    ],
  },
  {
    id: "usecases",
    label: "Use cases",
    href: "#usecases",
    items: [
      { name: "Solo sellers", desc: "Marketplace-ready photos in minutes", href: "#usecases" },
      { name: "DTC brands", desc: "On-brand lifestyle imagery and paid social ads", href: "#usecases" },
      { name: "Catalog teams", desc: "Consistent output across hundreds of SKUs", href: "#usecases" },
    ],
  },
  { id: "pricing", label: "Pricing", href: "#pricing", items: null },
  {
    id: "resources",
    label: "Resources",
    href: "#faq",
    items: [
      { name: "FAQ", desc: "Common questions about output and licensing", href: "#faq" },
      { name: "How it works", desc: "The four-step production flow", href: "#how" },
      { name: "Template library", desc: "312 scene, motion and ad presets", href: "#tools" },
    ],
  },
];
