import { BrandMark } from "@/lib/config/brand-mark";
import { siteConfig } from "@/lib/config/site";

/** The ShootPX aperture mark — the same artwork as app/icon.svg. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <span className="flex flex-none">
      <BrandMark size={size} />
    </span>
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
