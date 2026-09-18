"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/types/tool";
import { iconForTool } from "@/lib/tools/icon-map";

export function HomeTools({ tools }: { tools: Tool[] }) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const t of tools) if (!seen.includes(t.category)) seen.push(t.category);
    return seen;
  }, [tools]);

  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? tools : tools.filter((t) => t.category === filter);
  const live = filtered.filter((t) => t.status === "live").sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-4 border-b border-border px-11 py-7">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("All")}
          className={`border-b-2 px-3.5 py-2 text-[13px] ${
            filter === "All" ? "border-accent text-text" : "border-transparent text-dim"
          }`}
        >
          All tools
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`border-b-2 px-3.5 py-2 text-[13px] ${
              filter === c ? "border-accent text-text" : "border-transparent text-dim"
            }`}
          >
            {c}
          </button>
        ))}
        <Link href="/studio/tools" className="ml-auto text-[13px] text-muted hover:text-accent">
          See all →
        </Link>
      </div>

      {tools.length === 0 ? (
        <p className="text-center text-sm text-dim">Couldn&apos;t load live tool data right now.</p>
      ) : live.length === 0 ? (
        <div className="flex min-h-20 items-center justify-center border border-border text-[13.5px] text-dim">
          This section is currently being built.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {live.map((t) => {
            const Icon = iconForTool(t);
            return (
              <Link
                key={t.id}
                href="/studio/tools"
                className="flex flex-col gap-1.5 bg-bg px-4 py-3.5 hover:bg-surface"
              >
                <Icon size={18} className="text-muted" />
                <span className="text-[13.5px] font-semibold">{t.name}</span>
                <span className="text-[11.5px] leading-snug text-muted">{t.description}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
