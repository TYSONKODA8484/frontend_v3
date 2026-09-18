import { siteConfig } from "@/lib/config/site";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className="flex-none">
      <rect width="28" height="28" rx="7" fill="var(--color-accent)" />
      <circle cx="14" cy="14" r="6.4" fill="none" stroke="var(--color-accent-ink)" strokeWidth="2.6" />
      <circle cx="14" cy="14" r="1.8" fill="var(--color-accent-ink)" />
    </svg>
  );
}

export function Logo({
  size = 28,
  textClassName = "text-lg",
}: {
  size?: number;
  textClassName?: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={size} />
      <span className={`whitespace-nowrap font-heading font-bold tracking-tight ${textClassName}`}>
        {siteConfig.name}
      </span>
    </span>
  );
}
