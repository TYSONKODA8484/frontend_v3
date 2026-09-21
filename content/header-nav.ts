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
    href: "/#platform",
    items: [
      { name: "AI Photoshoot", desc: "Stage products on a canvas and generate scenes", href: "/#platform" },
      { name: "Product Motion", desc: "Still to video clip", href: "/#platform", badge: "SOON" },
      { name: "UGC Avatar Ads", desc: "Script plus AI actor", href: "/#platform", badge: "SOON" },
      { name: "Batch Studio", desc: "One preset across many products", href: "/#tools", badge: "SOON" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    href: "/#tools",
    items: [
      { name: "Product Listing", desc: "Create professional product listing images", href: "/#tools" },
      { name: "Creative", desc: "Turn product photos into creative visuals", href: "/#tools" },
      { name: "Recolor", desc: "Create product color variants", href: "/#tools" },
      { name: "Model Shoot", desc: "Show products on AI-generated models", href: "/#tools" },
    ],
  },
  {
    id: "usecases",
    label: "Use cases",
    href: "/#usecases",
    items: [
      { name: "Solo sellers", desc: "Listing-style photos from a phone photo", href: "/#usecases" },
      { name: "DTC brands", desc: "On-brand lifestyle imagery for paid social and your store", href: "/#usecases" },
      { name: "Catalog teams", desc: "Consistent product imagery across your catalog", href: "/#usecases" },
    ],
  },
  { id: "pricing", label: "Pricing", href: "/#pricing", items: null },
  {
    id: "resources",
    label: "Resources",
    href: "/#faq",
    items: [
      { name: "FAQ", desc: "Common questions about output and licensing", href: "/#faq" },
      { name: "How it works", desc: "The four-step production flow", href: "/#how" },
    ],
  },
];
