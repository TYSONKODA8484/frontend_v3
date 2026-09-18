import { PlaceholderSlot } from "./PlaceholderSlot";

const PILLARS = [
  {
    tag: "IMAGES",
    title: "Studio photoshoots without the studio",
    desc: "Drop a phone photo, pick a scene, and get four finished variations. Precise mode keeps your product pixel-locked so logos and labels stay exactly right.",
    bullets: [
      "Background removal and scene generation in one pass",
      "Precise and Creative modes for control versus expression",
      "Marketplace export presets for Shopify, Amazon and Etsy",
    ],
    placeholder: "Photoshoot editor / result grid",
    imageFirst: false,
  },
  {
    tag: "VIDEO · COMING SOON",
    title: "Motion that stops the scroll",
    desc: "Turn any still into a short product clip with camera presets — orbit, push-in, pan, pour, unbox — then trim, caption and export vertical. In development, launching soon.",
    bullets: [
      "Up to four reference angles keep product identity locked",
      "Camera and effect presets, or write your own motion notes",
      "9:16, 1:1 and 16:9 exports with burned-in captions",
    ],
    placeholder: "Product motion clip still",
    imageFirst: true,
  },
  {
    tag: "UGC ADS · COMING SOON",
    title: "Creator-style ads, no creator sourcing",
    desc: "Paste a product URL, pick an AI actor, drop in a script — or let ShootPX write one. Generate one ad or five variants for creative testing. In development, launching soon.",
    bullets: [
      "1,200+ AI actors with gender, age and style filters",
      "Voice and language selection with lip-synced delivery",
      "One script across five actors for fast A/B testing",
    ],
    placeholder: "UGC ad preview 9:16",
    imageFirst: false,
  },
];

export function Platform() {
  return (
    <section id="platform" aria-label="Platform" className="mx-auto max-w-7xl px-5 py-16">
      <div className="mb-11 max-w-[62ch]">
        <span className="font-mono text-[11px] tracking-widest text-accent-dim">THE PLATFORM</span>
        <h2 className="mt-3 font-heading text-[clamp(30px,3.6vw,46px)] font-semibold leading-tight tracking-tight">
          One upload. Every asset your listing needs.
        </h2>
        <p className="mt-3.5 text-[15.5px] leading-relaxed text-muted">
          Stills, on-model shots and mockups are live today, sharing one product library and brand
          kit. Motion clips and creator-style ads are on the way.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {PILLARS.map((p) => (
          <div
            key={p.tag}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface md:flex-row"
          >
            {p.imageFirst && (
              <div className="relative min-h-[280px] flex-1 border-b border-border md:border-b-0 md:border-r">
                <PlaceholderSlot label={p.placeholder} />
              </div>
            )}
            <div className="flex flex-1 flex-col justify-center gap-4 px-8 py-9">
              <span className="font-mono text-[10.5px] tracking-widest text-accent-dim">{p.tag}</span>
              <h3 className="font-heading text-2xl font-semibold leading-snug tracking-tight">
                {p.title}
              </h3>
              <p className="max-w-[46ch] text-[14.5px] leading-relaxed text-muted">{p.desc}</p>
              <div className="mt-1 flex flex-col gap-2">
                {p.bullets.map((b) => (
                  <span key={b} className="flex items-start gap-2.5 text-[13.5px]">
                    <span className="flex-none text-accent">→</span>
                    <span className="text-muted">{b}</span>
                  </span>
                ))}
              </div>
            </div>
            {!p.imageFirst && (
              <div className="relative min-h-[280px] flex-1 border-t border-border md:border-l md:border-t-0">
                <PlaceholderSlot label={p.placeholder} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
