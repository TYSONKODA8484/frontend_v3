"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Purchase = { id: string; label: string; date: string; amount: string };
export type Subscription = { name: string; periodLabel?: string };

type CreditsContextValue = {
  /** No account/billing-balance endpoint exists yet — starts at 0, not a fake live number. */
  credits: number;
  subscription: Subscription | null;
  /** Only ever populated by actions taken this session — never seeded/fake. */
  purchases: Purchase[];
  buyModalOpen: boolean;
  buyModalTab: "sub" | "credits";
  openBuyModal: (tab?: "sub" | "credits") => void;
  closeBuyModal: () => void;
  /** Local-only bookkeeping for a "purchase" completed in the buy modal — no real payment call yet. */
  recordCreditPurchase: (amount: number, label: string, priceLabel: string) => void;
  recordSubscription: (sub: Subscription, priceLabel: string) => void;
  cancelSubscription: () => void;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyModalTab, setBuyModalTab] = useState<"sub" | "credits">("credits");

  function today() {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <CreditsContext.Provider
      value={{
        credits,
        subscription,
        purchases,
        buyModalOpen,
        buyModalTab,
        openBuyModal: (tab = "credits") => {
          setBuyModalTab(tab);
          setBuyModalOpen(true);
        },
        closeBuyModal: () => setBuyModalOpen(false),
        recordCreditPurchase: (amount, label, priceLabel) => {
          setCredits((c) => c + amount);
          setPurchases((p) => [{ id: `p-${Date.now()}`, label, date: today(), amount: priceLabel }, ...p]);
        },
        recordSubscription: (sub, priceLabel) => {
          setSubscription(sub);
          setPurchases((p) => [
            { id: `p-${Date.now()}`, label: `${sub.name} subscription`, date: today(), amount: priceLabel },
            ...p,
          ]);
        },
        cancelSubscription: () => setSubscription(null),
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within a CreditsProvider");
  return ctx;
}
