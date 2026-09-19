import { SlotImage } from "@/components/ui/SlotImage";
import { steps } from "@/content/how-it-works";

export function HowItWorks() {
  return (
    <section id="how" aria-label="How it works" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-11 text-center">
          <span className="font-mono text-[11px] tracking-widest text-accent-dim">HOW IT WORKS</span>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">
            Phone photo to finished ad, in four moves.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col gap-3.5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
                <SlotImage src={s.image} alt={s.alt} placeholder={s.placeholder} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-sm text-accent">{s.n}</span>
                <h3 className="text-base font-semibold">{s.title}</h3>
              </div>
              <p className="text-[13px] leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
