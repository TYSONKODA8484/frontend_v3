import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SlotImage } from "@/components/ui/SlotImage";
import { showcase } from "@/content/auth-showcase";

export function AuthShowcase() {
  return (
    <div className="relative hidden min-w-0 flex-[1.05] overflow-hidden border-r border-border lg:block">
      <SlotImage
        src={showcase.image}
        alt={showcase.title}
        placeholder="Full-bleed generated product shot — portrait or landscape"
        sizes="55vw"
        position={showcase.imagePosition}
        priority
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.1)_45%,rgba(0,0,0,0.35)_100%)]" />

      <Link href="/" className="absolute left-8 top-7">
        <Logo size={30} textClassName="text-[19px] text-white" />
      </Link>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-7">
        <p className="max-w-[26ch] font-heading text-[30px] font-semibold leading-tight tracking-tight text-white">
          {showcase.quote}
        </p>
        <div className="flex w-max max-w-full items-center gap-3.5 rounded-2xl border border-white/15 bg-black/70 p-3 pr-4 backdrop-blur-md">
          <div className="relative h-10 w-10 flex-none overflow-hidden rounded-full">
            <SlotImage src={showcase.thumb} alt="" placeholder="Thumb" sizes="40px" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{showcase.title}</div>
            <div className="text-xs text-white/60">{showcase.category}</div>
            <div className="mt-0.5 font-mono text-[10.5px] tracking-wide text-accent">
              {showcase.credit}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
