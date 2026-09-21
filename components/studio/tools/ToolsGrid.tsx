import Link from "next/link";
import type { Tool } from "@/lib/types/tool";
import { iconForTool } from "@/lib/tools/icon-map";
import { groupToolsByCategory, titleCase } from "@/lib/tools/group-by-category";
import { categoryBlurbs } from "@/content/tools-grid";

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
    <div className="flex flex-col gap-[34px] px-10 pb-[60px] pt-[34px]">
      {[...groups.entries()].map(([category, groupTools]) => (
        <div key={category} className="flex flex-col gap-6 md:flex-row md:items-start md:gap-[34px]">
          <div className="w-full flex-none md:w-[200px]">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {titleCase(category)}
            </h2>
            {categoryBlurbs[titleCase(category)] && (
              <p className="mt-1.5 text-[13px] text-dim">{categoryBlurbs[titleCase(category)]}</p>
            )}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {groupTools.map((t) => {
              const Icon = iconForTool(t);
              const soon = t.status !== "live";
              const content = (
                <>
                  <div className="flex items-center gap-2">
                    <Icon size={19} className="text-text/85" />
                    {soon && (
                      <span className="ml-auto font-mono text-[9.5px] tracking-wide text-accent">
                        SOON
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] font-medium">{t.displayName}</span>
                  <span className="text-[12.5px] leading-snug text-muted">{t.description}</span>
                </>
              );
              return soon ? (
                <div
                  key={t.featureType}
                  className="flex min-h-[118px] flex-col gap-[9px] bg-bg p-[18px] opacity-[0.55]"
                >
                  {content}
                </div>
              ) : (
                <Link
                  key={t.featureType}
                  href={`/studio/tools/${t.featureType}`}
                  className="flex min-h-[118px] flex-col gap-[9px] bg-bg p-[18px] hover:bg-surface"
                >
                  {content}
                </Link>
              );
            })}
            {/* Pad the last row with empty cells — otherwise the grid's border
                colour shows through the gap as a solid grey block. */}
            {Array.from({ length: (3 - (groupTools.length % 3)) % 3 }, (_, i) => (
              <div key={`pad-${i}`} className="hidden bg-bg lg:block" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
