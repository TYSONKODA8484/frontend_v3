import { Check } from "lucide-react";
import { audiences } from "@/content/use-cases";

export function UseCases() {
  return (
    <section id="usecases" aria-label="Use cases" className="border-t border-border bg-bg-alt">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-10 max-w-[58ch]">
          <span className="font-mono text-[11px] tracking-widest text-accent-dim">WHO IT&apos;S FOR</span>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">
            Built for every catalog size.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-7"
            >
              <h3 className="text-lg font-semibold tracking-tight">{a.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-muted">{a.desc}</p>
              <div className="mt-auto flex flex-col gap-2 pt-2">
                {a.wins.map((w) => (
                  <span key={w} className="flex gap-2 text-[12.5px] text-dim">
                    <Check size={14} className="mt-0.5 flex-none text-accent" />
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
