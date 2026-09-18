"use client";

import { CircleDollarSign } from "lucide-react";
import { useCredits } from "@/lib/studio/CreditsContext";

export function BillingTab() {
  const { credits, subscription, purchases, openBuyModal, cancelSubscription } = useCredits();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-dim">
        Demo billing — no payment provider is connected yet. Actions here only update local state.
      </p>

      <div className="border border-border p-5">
        <div className="font-mono text-[10.5px] tracking-wide text-dim">CURRENT PLAN</div>
        {subscription ? (
          <div className="mt-2.5 flex items-center justify-between">
            <div>
              <div className="font-heading text-[22px] font-bold">{subscription.name}</div>
              {subscription.periodLabel && (
                <div className="mt-1 text-[13px] text-muted">Billed per {subscription.periodLabel}</div>
              )}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => openBuyModal("sub")}
                className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] font-medium hover:border-accent"
              >
                Change plan
              </button>
              <button
                onClick={cancelSubscription}
                className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] text-muted hover:border-[#ff5c4d] hover:text-[#ff8a6b]"
              >
                Cancel subscription
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2.5 flex items-center justify-between">
            <div className="text-[15px] text-muted">No active subscription</div>
            <button
              onClick={() => openBuyModal("sub")}
              className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-accent-ink hover:bg-accent-hover"
            >
              Choose a plan
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border border-border p-5">
        <div>
          <div className="font-mono text-[10.5px] tracking-wide text-dim">CREDIT BALANCE</div>
          <div className="mt-1 flex items-center gap-2 font-heading text-[30px] font-bold">
            <CircleDollarSign size={24} className="flex-none text-accent" />
            {credits} credits
          </div>
        </div>
        <button
          onClick={() => openBuyModal("credits")}
          className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] font-medium hover:border-accent"
        >
          Buy credits
        </button>
      </div>

      <div>
        <span className="font-mono text-[11px] tracking-wide text-dim">BILLING HISTORY</span>
        <div className="mt-3 border border-border">
          {purchases.length === 0 ? (
            <p className="p-5 text-center text-[13px] text-dim">No purchases yet this session.</p>
          ) : (
            purchases.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3.5 border-b border-border px-4 py-3 text-[13px] last:border-b-0"
              >
                <span className="flex-1">{p.label}</span>
                <span className="w-20 text-dim">{p.date}</span>
                <span className="w-20 font-medium">{p.amount}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
