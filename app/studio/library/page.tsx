"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTeam } from "@/lib/studio/TeamContext";
import { getTeamGenerations } from "@/lib/api/teams";
import { readCache, writeCache } from "@/lib/studio/session-cache";
import { dedupeByJobId } from "@/lib/tools/dedupe-generations";
import type { Generation, GenerationsPeriod } from "@/lib/types/generation";

const PAGE_SIZE = 24;
const DEFAULT_PERIOD: GenerationsPeriod = "all_time";

const PERIODS: { value: GenerationsPeriod; label: string }[] = [
  { value: "all_time", label: "All time" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
];

// Only the first page per period is worth caching — pagination beyond that
// is a deliberate user action, not something a reload should short-circuit.
function libraryCacheKey(teamId: string, period: GenerationsPeriod) {
  return `library:${teamId}:${period}`;
}

function titleCaseSlug(slug: string) {
  return slug
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StudioLibrary() {
  const { activeTeamId, loading: teamsLoading } = useTeam();
  const [period, setPeriod] = useState<GenerationsPeriod>(DEFAULT_PERIOD);
  // Hydrate the first page from last session's cache so landing on Library
  // shows real thumbnails immediately instead of a loading state.
  const [items, setItems] = useState<Generation[]>(() =>
    dedupeByJobId((activeTeamId && readCache<Generation[]>(libraryCacheKey(activeTeamId, DEFAULT_PERIOD))) || []),
  );
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(
    () => !(activeTeamId && readCache<Generation[]>(libraryCacheKey(activeTeamId, DEFAULT_PERIOD))),
  );

  function load(nextOffset: number, replace: boolean) {
    if (!activeTeamId) {
      // Teams may still be loading and activeTeamId just hasn't arrived
      // yet — not "no projects". Folded into `loading` below.
      setItems([]);
      setItemsLoading(false);
      return;
    }
    if (replace) {
      const cached = readCache<Generation[]>(libraryCacheKey(activeTeamId, period));
      if (cached) setItems(dedupeByJobId(cached));
      else setItemsLoading(true);
    } else {
      setItemsLoading(true);
    }
    getTeamGenerations(activeTeamId, { limit: PAGE_SIZE, offset: nextOffset, period })
      .then((r) => {
        setItems((prev) => dedupeByJobId(replace ? r.generations : [...prev, ...r.generations]));
        setHasMore(r.generations.length === PAGE_SIZE);
        setOffset(nextOffset);
        if (replace) writeCache(libraryCacheKey(activeTeamId, period), r.generations);
      })
      .catch(() => {
        // Keep whatever we already have rather than blanking the grid out.
      })
      .finally(() => setItemsLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetching from the top when the team or period filter changes
    load(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId, period]);

  const loading = teamsLoading || itemsLoading;

  return (
    <div className="flex flex-col gap-5 px-11 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Library</h1>
        <div className="flex gap-0.5 rounded-full border border-border bg-surface p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] ${
                period === p.value ? "bg-accent font-semibold text-accent-ink" : "text-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && items.length === 0 ? (
        <p className="py-16 text-center text-sm text-dim">Loading…</p>
      ) : items.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center text-dim">
          <span className="text-3xl opacity-50">▢</span>
          <span className="text-[15px] font-semibold text-muted">No projects yet</span>
          <span className="text-[13px]">Run a tool to generate your first shoot.</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((g) => (
              <div key={g.jobId} className="flex flex-col gap-1.5">
                <div className="relative aspect-square overflow-hidden border border-border bg-surface">
                  {g.status === "completed" && g.outputUrl ? (
                    <Image src={g.outputUrl} alt={g.title} fill sizes="16vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-[11px] text-dim">
                      {g.status === "failed" ? "Failed" : "Processing"}
                    </div>
                  )}
                </div>
                <span className="truncate text-[12px] font-medium">{titleCaseSlug(g.featureType)}</span>
                <span className="text-[11px] text-dim">{formatDate(g.createdAt)}</span>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => load(offset + PAGE_SIZE, false)}
              disabled={loading}
              className="mx-auto rounded-full border border-border-strong px-6 py-2.5 text-[13px] font-medium hover:border-accent disabled:opacity-60"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
