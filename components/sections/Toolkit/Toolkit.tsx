import type { Tool } from "@/lib/types/tool";
import { iconForTool } from "./icon-map";
import { groupToolsByCategory, titleCase } from "./group-by-category";

export function Toolkit({ tools }: { tools: Tool[] }) {
  const groups = groupToolsByCategory(tools);

  return (
    <section id="tools" aria-label="All tools" className="border-t border-border bg-bg-alt">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="mx-auto mb-10 max-w-[58ch] text-center">
          <span className="font-mono text-[11px] tracking-widest text-accent-dim">TOOLKIT</span>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">
            Every tool, one workflow.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Grouped the way you actually work. Tools marked{" "}
            <span className="font-semibold text-accent">SOON</span> are in active development.
          </p>
        </div>

        {groups.size === 0 ? (
          <p className="text-center text-sm text-dim">Couldn&apos;t load live tool data right now.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {[...groups.entries()].map(([category, groupTools]) => (
              <div key={category} className="grid grid-cols-1 items-start gap-8 md:grid-cols-[200px_1fr]">
                <div>
                  <h3 className="font-heading text-xl font-semibold tracking-tight">
                    {titleCase(category)}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {groupTools.map((t) => {
                    const Icon = iconForTool(t);
                    const soon = t.status !== "live";
                    return (
                      <div
                        key={t.id}
                        className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent-dim"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-accent/15">
                            <Icon size={15} className="text-accent" />
                          </span>
                          {soon && (
                            <span className="ml-auto font-mono text-[9px] tracking-wide text-accent">
                              SOON
                            </span>
                          )}
                        </div>
                        <span className="text-[13.5px] font-semibold">{t.name}</span>
                        <span className="text-xs leading-snug text-dim">{t.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
