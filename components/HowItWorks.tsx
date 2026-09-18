import { PlaceholderSlot } from "./PlaceholderSlot";

const STEPS = [
  {
    n: "01",
    title: "Upload or paste a URL",
    desc: "Drop a product photo or paste your listing link — we pull the images and remove the background automatically.",
    placeholder: "Upload screen",
  },
  {
    n: "02",
    title: "Pick a scene or actor",
    desc: "Choose a template, describe a scene in plain words, or select an AI actor for a UGC-style ad.",
    placeholder: "Template picker",
  },
  {
    n: "03",
    title: "Generate",
    desc: "Four variations in seconds. Precise keeps your product locked; Creative lets the model restage it.",
    placeholder: "Results grid",
  },
  {
    n: "04",
    title: "Refine and export",
    desc: "Erase, relight, upscale to 4K, then export at marketplace ready sizes for every channel.",
    placeholder: "Export sheet",
  },
];

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
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3.5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
                <PlaceholderSlot label={s.placeholder} />
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
