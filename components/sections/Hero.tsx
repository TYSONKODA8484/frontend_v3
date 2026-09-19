import { SlotImage } from "@/components/ui/SlotImage";

export function Hero() {
  return (
    <section aria-label="Hero" id="top" className="relative overflow-hidden px-5 pt-20">
      <div className="animate-glow pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(200,255,0,0.16),transparent)]" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className="flex items-center gap-2 rounded-full border border-border-strong px-4 py-1.5">
          <span className="animate-blink h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[11px] tracking-widest text-muted">
            TRUSTED BY 3,200+ E-COMMERCE SELLERS
          </span>
        </div>

        <h1 className="max-w-[17ch] text-center font-heading text-[clamp(42px,7.4vw,92px)] font-bold leading-[0.97] tracking-[-0.035em]">
          Product content that <span className="text-accent">actually sells.</span>
        </h1>

        <p className="max-w-[58ch] text-center text-lg leading-relaxed text-muted">
          ShootPX turns one product photo into studio quality photoshoots, scroll-stopping product
          videos and AI UGC ads. No studio, no camera crew, no shoot day — from a single upload to
          marketplace ready in minutes.
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

        <span className="font-mono text-[11px] tracking-wide text-dim">PAY AS YOU GO</span>

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
