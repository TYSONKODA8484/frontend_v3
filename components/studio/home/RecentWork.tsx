"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTeam } from "@/lib/studio/TeamContext";
import { getTeamGenerations } from "@/lib/api/teams";
import { readCache, writeCache } from "@/lib/studio/session-cache";
import { dedupeByJobId } from "@/lib/tools/dedupe-generations";
import type { Generation } from "@/lib/types/generation";

const RECENT_LIMIT = 8;

function recentCacheKey(teamId: string) {
  return `recent:${teamId}`;
}

function titleCaseSlug(slug: string) {
  return slug
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function RecentWork() {
  const { activeTeamId, loading: teamsLoading } = useTeam();
  // Hydrate from last session's cache so a reload shows the previous
  // thumbnails immediately instead of a loading state.
  const [items, setItems] = useState<Generation[]>(() =>
    dedupeByJobId((activeTeamId && readCache<Generation[]>(recentCacheKey(activeTeamId))) || []),
  );
  const [itemsLoading, setItemsLoading] = useState(
    () => !(activeTeamId && readCache<Generation[]>(recentCacheKey(activeTeamId))),
  );

  function load() {
    if (!activeTeamId) {
      // Teams may still be loading and activeTeamId just hasn't arrived
      // yet — not "no projects". Folded into `loading` below.
      setItems([]);
      setItemsLoading(false);
      return;
    }
    const cached = readCache<Generation[]>(recentCacheKey(activeTeamId));
    if (cached) setItems(dedupeByJobId(cached));
    else setItemsLoading(true);
    getTeamGenerations(activeTeamId, { limit: RECENT_LIMIT })
      .then((r) => {
        setItems(dedupeByJobId(r.generations));
        writeCache(recentCacheKey(activeTeamId), r.generations);
      })
      .catch(() => {
        // Keep whatever we already have rather than blanking the grid out.
      })
      .finally(() => setItemsLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching recent generations when the active team changes
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId]);

  const loading = teamsLoading || itemsLoading;

  return (
    <div className="flex flex-col gap-2.5 px-11 py-7">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] tracking-widest text-dim">RECENT WORK</span>
        <Link href="/studio/library" className="text-[13px] text-muted hover:text-accent">
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-20 items-center justify-center text-sm text-dim">Loading…</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-border py-16 text-dim">
          <span className="text-3xl opacity-50">▢</span>
          <span className="text-[15px] font-semibold text-muted">No projects yet</span>
          <span className="text-[13px]">Run a tool to generate your first shoot.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {items.map((g) => (
            <div key={g.jobId} className="relative aspect-square overflow-hidden border border-border bg-surface">
              {g.status === "completed" && g.outputUrl ? (
                <Image src={g.outputUrl} alt={g.title} fill sizes="12vw" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-2 text-center text-[11px] text-dim">
                  {g.status === "failed" ? "Failed" : "Processing"}
                </div>
              )}
              <span className="absolute inset-x-1 bottom-1 truncate bg-bg/80 px-1.5 py-0.5 text-[10px] text-muted">
                {titleCaseSlug(g.featureType)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
