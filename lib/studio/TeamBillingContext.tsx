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
  const { activeTeamId } = useTeam();
  const [billing, setBilling] = useState<TeamBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyModalTab, setBuyModalTab] = useState<BuyTab>("credits");

  function load() {
    if (!activeTeamId) {
      setBilling(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getTeamBilling(activeTeamId)
      .then(setBilling)
      .catch(() => setBilling(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching billing whenever the active team changes
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeamId]);

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
