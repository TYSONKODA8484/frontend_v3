"use client";

import { useEffect, useState } from "react";
import { useTeam } from "@/lib/studio/TeamContext";
import { getTeamUsage } from "@/lib/api/teams";
import { readCache, writeCache } from "@/lib/studio/session-cache";
import type { TeamUsage, TeamUsagePeriod } from "@/lib/types/team";

const PERIODS: { value: TeamUsagePeriod; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

const DEFAULT_PERIOD: TeamUsagePeriod = "week";

function usageCacheKey(teamId: string, period: TeamUsagePeriod) {
  return `usage:${teamId}:${period}`;
}

export function UsageTab() {
  const { activeTeamId, loading: teamsLoading } = useTeam();
  const [period, setPeriod] = useState<TeamUsagePeriod>(DEFAULT_PERIOD);
  // Hydrate from last session's cache for the default period so switching to
  // this tab shows real numbers immediately instead of a loading state.
  const [usage, setUsage] = useState<TeamUsage | null>(() =>
    activeTeamId ? readCache<TeamUsage>(usageCacheKey(activeTeamId, DEFAULT_PERIOD)) : null,
  );
  const [usageLoading, setUsageLoading] = useState(
    () => !(activeTeamId && readCache<TeamUsage>(usageCacheKey(activeTeamId, DEFAULT_PERIOD))),
  );

  function load() {
    if (!activeTeamId) {
      // Teams may still be loading and activeTeamId just hasn't arrived
      // yet — not "nothing to show". Folded into `loading` below.
      setUsage(null);
      setUsageLoading(false);
      return;
    }
    const cached = readCache<TeamUsage>(usageCacheKey(activeTeamId, period));
    if (cached) setUsage(cached);
    else setUsageLoading(true);
    getTeamUsage(activeTeamId, { period })
      .then((res) => {
        setUsage(res);
        writeCache(usageCacheKey(activeTeamId, period), res);
      })
      .catch(() => {
        // Keep whatever we already have rather than showing "couldn't load".
      })
      .finally(() => setUsageLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching usage when the team or period changes
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId, period]);

  const loading = teamsLoading || usageLoading;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] tracking-wide text-dim">PERIOD</span>
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

      {loading ? (
        <p className="text-sm text-dim">Loading usage…</p>
      ) : !usage ? (
        <p className="text-sm text-dim">Couldn&apos;t load usage right now.</p>
      ) : (
        <>
          <div className="flex items-center justify-between border border-border px-5 py-3.5">
            <span className="font-mono text-[10.5px] tracking-wide text-dim">CREDITS USED</span>
            <span className="font-heading text-xl font-bold">{usage.creditsUsed}</span>
          </div>

          <div>
            <span className="font-mono text-[10.5px] tracking-wide text-dim">BY TEAMMATE</span>
            <div className="mt-2.5 border border-border">
              {usage.byMember.length === 0 ? (
                <p className="p-4 text-center text-[13px] text-dim">No usage yet.</p>
              ) : (
                usage.byMember.map((m) => (
                  <div
                    key={m.userId}
                    className="flex items-center justify-between border-b border-border px-4 py-2.5 text-[13px] last:border-b-0"
                  >
                    <span>{m.name}</span>
                    <span className="font-mono text-dim">{m.credits} cr</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <span className="font-mono text-[10.5px] tracking-wide text-dim">BY TOOL</span>
            <div className="mt-2.5 border border-border">
              {usage.byTool.length === 0 ? (
                <p className="p-4 text-center text-[13px] text-dim">No usage yet.</p>
              ) : (
                usage.byTool.map((t) => (
                  <div
                    key={t.featureType}
                    className="flex items-center justify-between border-b border-border px-4 py-2.5 text-[13px] last:border-b-0"
                  >
                    <span>{t.displayName}</span>
                    <span className="font-mono text-dim">{t.credits} cr</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
