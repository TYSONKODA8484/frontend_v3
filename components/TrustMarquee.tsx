const MARQUEE_ITEMS = [
  "BACKGROUND REMOVAL",
  "AI SCENE GENERATION",
  "PRODUCT MOTION",
  "UGC AVATAR ADS",
  "MOCKUP STUDIO",
  "ON-MODEL SHOTS",
  "BATCH OF 250",
  "UPSCALE 4K",
  "BRAND KIT",
];

export function TrustMarquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <section
      aria-label="Trusted by"
      className="mt-14 overflow-hidden border-y border-border bg-bg-alt py-4"
    >
      <div className="flex w-max animate-marquee gap-11">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex gap-11">
            {items.map((m, i) => (
              <span
                key={`${rep}-${i}`}
                className="whitespace-nowrap font-mono text-xs tracking-wide text-dim"
              >
                {m} ·
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
