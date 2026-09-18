import { outcomes } from "./Outcomes.content";

export function Outcomes() {
  return (
    <section aria-label="Outcomes" className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {outcomes.map((o) => (
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
