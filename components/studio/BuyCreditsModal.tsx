"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { getBilling } from "@/lib/api/billing";
import type { BillingPlan, BillingResponse } from "@/lib/types/billing";
import { useCredits } from "@/lib/studio/CreditsContext";
import { useToast } from "@/lib/studio/ToastContext";

function formatRupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function BuyCreditsModal() {
  const { buyModalOpen, buyModalTab, closeBuyModal, recordCreditPurchase, recordSubscription } =
    useCredits();
  const { say } = useToast();
  const [tab, setTab] = useState<"sub" | "credits">(buyModalTab);
  const [billing, setBilling] = useState<BillingResponse>({ subscriptions: [], credits: [] });
  const [loading, setLoading] = useState(true);

  // Reset the local tab to whichever one the opener asked for, each time the
  // modal transitions from closed to open (adjusting state during render
  // instead of an effect, since this is a pure derivation of a prop change).
  const [wasOpen, setWasOpen] = useState(buyModalOpen);
  if (buyModalOpen !== wasOpen) {
    setWasOpen(buyModalOpen);
    if (buyModalOpen) setTab(buyModalTab);
  }

  useEffect(() => {
    if (!buyModalOpen) return;
    // Fetching plans when the modal opens is exactly what this effect is
    // for; the lint rule flags the loading-flag set that precedes the fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getBilling()
      .then(setBilling)
      .finally(() => setLoading(false));
  }, [buyModalOpen]);

  if (!buyModalOpen) return null;

  const plans = (tab === "sub" ? billing.subscriptions : billing.credits)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  function handleBuy(plan: BillingPlan) {
    const priceLabel = `₹${formatRupees(plan.price)}`;
    if (tab === "sub") {
      recordSubscription({ name: plan.name, periodLabel: plan.periodLabel }, priceLabel);
      say(`Switched to ${plan.name.toLowerCase()} billing`);
    } else {
      recordCreditPurchase(plan.credits, `${plan.name} — ${plan.credits} credits`, priceLabel);
      say(`Added ${plan.credits} credits (${plan.name})`);
    }
    closeBuyModal();
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-auto bg-bg">
      <button
        onClick={closeBuyModal}
        className="fixed right-7 top-6 z-[61] text-dim hover:text-text"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3.5 px-6 py-20">
        <h2 className="text-center font-heading text-[clamp(32px,4.4vw,48px)] font-bold tracking-tight">
          More credits, more shoots.
        </h2>
        <p className="max-w-[52ch] text-center text-[15px] text-muted">
          Buy credits when you need them, or subscribe for a steady supply. Commercial licence
          included on every plan.
        </p>

        <div className="mt-3.5 flex gap-0.5 rounded-full border border-border bg-surface p-1">
          <button
            onClick={() => setTab("sub")}
            className={`rounded-full px-5 py-2.5 text-[13.5px] font-semibold ${
              tab === "sub" ? "bg-accent text-accent-ink" : "text-muted"
            }`}
          >
            Subscription
          </button>
          <button
            onClick={() => setTab("credits")}
            className={`rounded-full px-5 py-2.5 text-[13.5px] font-semibold ${
              tab === "credits" ? "bg-accent text-accent-ink" : "text-muted"
            }`}
          >
            One-time
          </button>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-dim">Loading plans…</p>
        ) : plans.length === 0 ? (
          <p className="mt-10 text-sm text-dim">Couldn&apos;t load plans right now.</p>
        ) : (
          <div className="mt-9 flex w-full flex-wrap justify-center gap-4">
            {plans.map((plan) => {
              const featured = !!plan.tag;
              return (
                <div
                  key={plan.id}
                  className={`flex w-full max-w-[250px] flex-col gap-3.5 rounded-2xl border p-6 ${
                    featured ? "border-accent bg-surface" : "border-border bg-bg"
                  }`}
                >
                  <div>
                    <div className="font-heading text-lg font-semibold">{plan.name}</div>
                    <div className="mt-1 text-xs text-dim">{plan.credits} credits</div>
                  </div>
                  <div>
                    <span className="font-heading text-3xl font-bold tracking-tight text-accent">
                      ₹{formatRupees(plan.price)}
                    </span>
                    <span className="text-xs text-dim"> {tab === "credits" ? "one-time" : plan.periodLabel}</span>
                  </div>
                  <button
                    onClick={() => handleBuy(plan)}
                    className={`rounded-full py-3 text-[13.5px] font-semibold ${
                      featured
                        ? "bg-accent text-accent-ink hover:bg-accent-hover"
                        : "border border-border-strong hover:border-accent"
                    }`}
                  >
                    Get started
                  </button>
                  <div className="flex flex-col gap-2 border-t border-border pt-3.5">
                    <span className="font-mono text-[11px] text-dim">INCLUDES</span>
                    {plan.info.map((f) => (
                      <span key={f} className="flex gap-2 text-[12.5px] text-muted">
                        <Check size={13} className="mt-0.5 flex-none text-accent" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
