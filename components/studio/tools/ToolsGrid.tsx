import Link from "next/link";
import type { Tool } from "@/lib/types/tool";
import { iconForTool } from "@/lib/tools/icon-map";
import { groupToolsByCategory, titleCase } from "@/lib/tools/group-by-category";
import { resolveFeatureType } from "@/lib/tools/slug-to-feature-type";
import { categoryBlurbs } from "./ToolsGrid.content";

export function ToolsGrid({ tools }: { tools: Tool[] }) {
  const groups = groupToolsByCategory(tools);

  if (groups.size === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-11 text-center text-sm text-dim">
        Couldn&apos;t load tools right now.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-9 px-10 py-8">
      {[...groups.entries()].map(([category, groupTools]) => (
        <div key={category} className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="w-full flex-none md:w-[200px]">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {titleCase(category)}
            </h2>
            {categoryBlurbs[category] && (
              <p className="mt-1.5 text-[13px] text-dim">{categoryBlurbs[category]}</p>
            )}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {groupTools.map((t) => {
              const Icon = iconForTool(t);
              const soon = t.status !== "live";
              const content = (
                <>
                  <div className="flex items-center gap-2">
                    <Icon size={19} className="text-muted" />
                    {soon && (
                      <span className="ml-auto font-mono text-[9.5px] tracking-wide text-accent">
                        SOON
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] font-medium">{t.name}</span>
                  <span className="text-[12.5px] leading-snug text-muted">{t.description}</span>
                </>
              );
              return soon ? (
                <div
                  key={t.id}
                  className="flex min-h-[118px] flex-col gap-2.5 bg-bg px-4 py-4 opacity-[0.55]"
                >
                  {content}
                </div>
              ) : (
                <Link
                  key={t.id}
                  href={`/studio/tools/${resolveFeatureType(t.slug)}`}
                  className="flex min-h-[118px] flex-col gap-2.5 bg-bg px-4 py-4 hover:bg-surface"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
