import Link from "next/link";
import { FaXTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa6";

const SOCIALS = [
  { name: "X (Twitter)", href: "#", Icon: FaXTwitter },
  { name: "Instagram", href: "#", Icon: FaInstagram },
  { name: "LinkedIn", href: "#", Icon: FaLinkedinIn },
  { name: "YouTube", href: "#", Icon: FaYoutube },
];

const FOOTER_COLS = [
  {
    title: "PLATFORM",
    links: [
      { name: "AI Photoshoot", href: "#platform" },
      { name: "Product Motion", href: "#platform" },
      { name: "UGC Avatar Ads", href: "#platform" },
      { name: "Batch Studio", href: "#tools" },
      { name: "Brand Kit", href: "#tools" },
    ],
  },
  {
    title: "TOOLS",
    links: [
      { name: "Background Swap", href: "#tools" },
      { name: "Mockup Studio", href: "#tools" },
      { name: "On-Model Shots", href: "#tools" },
      { name: "Upscale 4K", href: "#tools" },
      { name: "Magic Erase", href: "#tools" },
    ],
  },
  {
    title: "USE CASES",
    links: [
      { name: "Shopify sellers", href: "#usecases" },
      { name: "Amazon listings", href: "#usecases" },
      { name: "Etsy shops", href: "#usecases" },
      { name: "DTC brands", href: "#usecases" },
      { name: "Catalog teams", href: "#usecases" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { name: "Pricing", href: "#pricing" },
      { name: "How it works", href: "#how" },
      { name: "FAQ", href: "#faq" },
      { name: "Book a demo", href: "#start" },
      { name: "Contact", href: "mailto:hello@shootpx.com" },
    ],
  },
];

const SEO_TAGS = [
  "AI product photography",
  "product photoshoot generator",
  "AI UGC ads",
  "product video generator",
  "background remover",
  "Shopify product photos",
  "Amazon listing images",
  "AI mockup generator",
  "batch image editing",
  "ecommerce content automation",
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-alt">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-14">
        <div className="grid grid-cols-1 gap-8 pb-11 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link href="#top" className="flex items-center gap-2">
              <svg width="26" height="26" viewBox="0 0 28 28">
                <rect width="28" height="28" rx="7" fill="var(--color-accent)" />
                <circle cx="14" cy="14" r="6.4" fill="none" stroke="var(--color-accent-ink)" strokeWidth="2.6" />
                <circle cx="14" cy="14" r="1.8" fill="var(--color-accent-ink)" />
              </svg>
              <span className="font-heading text-[17px] font-bold tracking-tight">ShootPX</span>
            </Link>
            <p className="max-w-[34ch] text-[13px] leading-relaxed text-dim">
              AI product photoshoots, product videos and UGC ads for e-commerce. One upload, every
              asset your listing needs.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted hover:border-accent hover:text-accent"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <span className="font-mono text-[10.5px] tracking-widest text-dim">{col.title}</span>
              {col.links.map((l) => (
                <Link key={l.name} href={l.href} className="text-[13px] text-muted">
                  {l.name}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <div className="flex flex-wrap gap-2.5">
            {SEO_TAGS.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-3 py-1 text-[11.5px] text-dim"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3.5">
            <span className="font-mono text-[11px] text-dim">© 2026 SHOOTPX · ALL RIGHTS RESERVED</span>
            <div className="flex flex-wrap gap-5">
              <Link href="/privacy" className="text-xs text-dim">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-dim">
                Terms
              </Link>
              <a href="mailto:shootpxlabs@gmail.com" className="text-xs text-dim">
                shootpxlabs@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
