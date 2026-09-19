"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTeam } from "@/lib/studio/TeamContext";
import { getTeamBilling } from "@/lib/api/teams";
import { readCache, writeCache } from "@/lib/studio/session-cache";
import type { TeamBilling } from "@/lib/types/team";

type BuyTab = "sub" | "credits";

function billingCacheKey(teamId: string) {
  return `billing:${teamId}`;
}

type TeamBillingContextValue = {
  billing: TeamBilling | null;
  loading: boolean;
  refetch: () => void;
  buyModalOpen: boolean;
  buyModalTab: BuyTab;
  openBuyModal: (tab?: BuyTab) => void;
  closeBuyModal: () => void;
};

const TeamBillingContext = createContext<TeamBillingContextValue | null>(null);

export function TeamBillingProvider({ children }: { children: ReactNode }) {
  const { activeTeamId, loading: teamsLoading } = useTeam();
  // Hydrate from last session's cached billing for whichever team is active
  // on first render, so the credits pill shows a real number immediately on
  // reload instead of a loading state — the fetch below silently
  // revalidates it right after.
  const [billing, setBilling] = useState<TeamBilling | null>(() =>
    activeTeamId ? readCache<TeamBilling>(billingCacheKey(activeTeamId)) : null,
  );
  const [billingLoading, setBillingLoading] = useState(
    () => !(activeTeamId && readCache<TeamBilling>(billingCacheKey(activeTeamId))),
  );
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyModalTab, setBuyModalTab] = useState<BuyTab>("credits");

  // Memoized so consumers (the purchase-success poll, GenerationRun's
  // completion refetch) can safely depend on it without that dependency
  // forcing their effects to re-run on every unrelated render.
  const load = useCallback(() => {
    if (!activeTeamId) {
      // Not "no billing to show" — teams may still be loading and
      // activeTeamId just hasn't arrived yet. Only teamsLoading actually
      // settling to false (with still no team) would mean that.
      setBilling(null);
      setBillingLoading(false);
      return;
    }
    // Covers switching teams: show that team's own cached billing right
    // away (if any) rather than the previous team's numbers lingering.
    const cached = readCache<TeamBilling>(billingCacheKey(activeTeamId));
    if (cached) setBilling(cached);
    else setBillingLoading(true);
    getTeamBilling(activeTeamId)
      .then((res) => {
        setBilling(res);
        writeCache(billingCacheKey(activeTeamId), res);
      })
      .catch(() => {
        // Keep whatever we already have (cache or previous state) rather
        // than zeroing out the credits pill just because a refresh failed.
      })
      .finally(() => setBillingLoading(false));
  }, [activeTeamId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching billing whenever the active team changes
    load();
  }, [load]);

  useEffect(() => {
    // No push channel from the backend, so this is how another teammate's
    // spending or a purchase made in a different tab eventually shows up
    // here without a manual reload. This can't be truly instant without the
    // backend pushing an event on balance change (WebSocket/SSE) — polling
    // always has a delay window — but 15s while the tab is actually visible
    // is a reasonable "feels live" cadence without hammering the backend
    // from every idle tab. load() itself already avoids flashing a loading
    // state, so this never visibly interrupts anything.
    if (!activeTeamId) return;

    function tick() {
      if (document.visibilityState === "visible") load();
    }

    const interval = setInterval(tick, 15_000);
    // Also refetch the moment someone tabs back in — covers "was away for a
    // while, teammate spent credits in the meantime" without waiting out
    // the rest of the interval.
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [activeTeamId, load]);

  // On reload, activeTeamId starts null until GET /teams resolves — during
  // that window billingLoading alone would read false (nothing to fetch
  // yet), which rendered as "0 credits" instead of a loading state. Folding
  // in teamsLoading closes that gap.
  const loading = teamsLoading || billingLoading;

  return (
    <TeamBillingContext.Provider
      value={{
        billing,
        loading,
        refetch: load,
        buyModalOpen,
        buyModalTab,
        openBuyModal: (tab: BuyTab = "credits") => {
          setBuyModalTab(tab);
          setBuyModalOpen(true);
        },
        closeBuyModal: () => setBuyModalOpen(false),
      }}
    >
      {children}
    </TeamBillingContext.Provider>
  );
}

export function useTeamBilling() {
  const ctx = useContext(TeamBillingContext);
  if (!ctx) throw new Error("useTeamBilling must be used within a TeamBillingProvider");
  return ctx;
}
