import { PlaceholderSlot } from "@/components/ui/PlaceholderSlot";
import { quotes } from "./Testimonials.content";

export function Testimonials() {
  return (
    <section aria-label="Customer results" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-10 text-center">
          <span className="font-mono text-[11px] tracking-widest text-accent-dim">RESULTS</span>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">
            Sellers shipping faster.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quotes.map((q) => (
            <div
              key={q.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
            >
              <span className="font-heading text-3xl font-bold tracking-tight text-accent">
                {q.metric}
              </span>
              <p className="text-[14.5px] leading-relaxed">&ldquo;{q.text}&rdquo;</p>
              <div className="mt-auto flex items-center gap-2.5">
                <div className="relative h-9 w-9 flex-none overflow-hidden rounded-full">
                  <PlaceholderSlot label="Photo" />
                </div>
                <span>
                  <span className="block text-[13px] font-semibold">{q.name}</span>
                  <span className="block font-mono text-[10.5px] text-dim">{q.role}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
