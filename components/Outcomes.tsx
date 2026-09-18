const OUTCOMES = [
  { value: "18s", label: "Median time from upload to first finished image" },
  { value: "99%", label: "Lower cost per image than a booked studio shoot" },
  { value: "250", label: "Products per batch job with one consistent preset" },
  { value: "312", label: "Scene, motion and ad templates ready to use" },
];

export function Outcomes() {
  return (
    <section aria-label="Outcomes" className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {OUTCOMES.map((o) => (
          <div key={o.label} className="flex flex-col gap-2 border-l-2 border-accent pl-4">
            <span className="font-heading text-4xl font-bold leading-none tracking-tight">
              {o.value}
            </span>
            <span className="text-sm leading-relaxed text-muted">{o.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
