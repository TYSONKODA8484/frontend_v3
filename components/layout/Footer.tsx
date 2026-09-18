import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { siteConfig, socialLabels, type SocialPlatform } from "@/lib/config/site";
import { footerCols, seoTags } from "./Footer.content";
import { socialIcons } from "./Footer.social-icons";

const activeSocials = Object.entries(siteConfig.social) as [SocialPlatform, string][];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-alt">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-14">
        <div className="grid grid-cols-1 gap-8 pb-11 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link href="#top">
              <Logo size={26} textClassName="text-[17px]" />
            </Link>
            <p className="max-w-[34ch] text-[13px] leading-relaxed text-dim">
              AI product photoshoots, product videos and UGC ads for e-commerce. One upload, every
              asset your listing needs.
            </p>
            <div className="flex gap-2.5">
              {activeSocials.map(([platform, href]) => {
                const Icon = socialIcons[platform];
                return (
                  <a
                    key={platform}
                    href={href}
                    aria-label={socialLabels[platform]}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted hover:border-accent hover:text-accent"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>
          {footerCols.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <span className="font-mono text-[10.5px] tracking-widest text-dim">{col.title}</span>
              {col.links.map((l) => (
                <Link key={l.name} href={l.href} className="text-[13px] text-muted">
                  {l.name}
                </Link>
              ))}
              {col.title === "COMPANY" && (
                <a href={`mailto:${siteConfig.contactEmail}`} className="text-[13px] text-muted">
                  Contact
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <div className="flex flex-wrap gap-2.5">
            {seoTags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-3 py-1 text-[11.5px] text-dim"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3.5">
            <span className="font-mono text-[11px] text-dim">© 2026 {siteConfig.name.toUpperCase()} · ALL RIGHTS RESERVED</span>
            <div className="flex flex-wrap gap-5">
              <Link href="/privacy" className="text-xs text-dim">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-dim">
                Terms
              </Link>
              <a href={`mailto:${siteConfig.supportEmail}`} className="text-xs text-dim">
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
