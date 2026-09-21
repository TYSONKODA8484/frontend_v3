import { SlotImage } from "@/components/ui/SlotImage";
import { SIGNUP_CREDITS, SIGNUP_CREDITS_NOTE } from "@/lib/config/site";

export function Hero() {
  return (
    <section aria-label="Hero" id="top" className="relative overflow-hidden px-5 pt-20">
      <div className="animate-glow pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(200,255,0,0.16),transparent)]" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6">
        <h1 className="max-w-[17ch] text-center font-heading text-[clamp(42px,7.4vw,92px)] font-bold leading-[0.97] tracking-[-0.035em]">
          Product content that <span className="text-accent">actually sells.</span>
        </h1>

        <p className="max-w-[58ch] text-center text-lg leading-relaxed text-muted">
          ShootPX turns one product photo into studio quality photoshoots. No studio, no camera crew,
          no shoot day — upload a single photo and generate studio-style product images.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="/auth"
            className="rounded-full bg-accent px-8 py-4 text-[15.5px] font-semibold text-accent-ink hover:bg-accent-hover"
          >
            Get started
          </a>
          <a
            href="#start"
            className="rounded-full border border-border-strong bg-surface px-7 py-4 text-[15.5px] font-medium hover:border-text"
          >
            Book a demo
          </a>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[11px] tracking-wide text-muted">
            {SIGNUP_CREDITS} FREE CREDITS ON SIGNUP*
          </span>
          <span className="text-[11px] text-dim">*{SIGNUP_CREDITS_NOTE}</span>
        </div>

        <div className="relative mt-3.5 aspect-video w-full overflow-hidden rounded-2xl border border-border-strong bg-surface">
          <SlotImage
            src="/home/home.webp"
            alt="The ShootPX editor turning a product photo into finished studio shots"
            placeholder="ShootPX editor screenshot — 16:9"
            sizes="(min-width: 1280px) 1200px, 100vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
