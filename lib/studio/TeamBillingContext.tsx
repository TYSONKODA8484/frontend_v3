"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useTeam } from "@/lib/studio/TeamContext";
import { getTeamBilling } from "@/lib/api/teams";
import type { TeamBilling } from "@/lib/types/team";

type BuyTab = "sub" | "credits";

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
  const [billing, setBilling] = useState<TeamBilling | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyModalTab, setBuyModalTab] = useState<BuyTab>("credits");

  function load() {
    if (!activeTeamId) {
      // Not "no billing to show" — teams may still be loading and
      // activeTeamId just hasn't arrived yet. Only teamsLoading actually
      // settling to false (with still no team) would mean that.
      setBilling(null);
      setBillingLoading(false);
      return;
    }
    setBillingLoading(true);
    getTeamBilling(activeTeamId)
      .then(setBilling)
      .catch(() => setBilling(null))
      .finally(() => setBillingLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching billing whenever the active team changes
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId]);

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
