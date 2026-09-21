"use client";

import { useState } from "react";
import type { BillingResponse } from "@/lib/types/billing";
import { PlanCard } from "./PlanCard";
import type { PricingTab } from "./format";
import { SIGNUP_CREDITS, SIGNUP_CREDITS_NOTE } from "@/lib/config/site";

export function Pricing({ billing }: { billing: BillingResponse }) {
  const [tab, setTab] = useState<PricingTab>("sub");
  const plans = (tab === "sub" ? billing.subscriptions : billing.credits)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section id="pricing" aria-label="Pricing" className="border-t border-border bg-bg-alt">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="mx-auto mb-10 max-w-[54ch] text-center">
          <span className="font-mono text-[11px] tracking-widest text-accent-dim">PRICING</span>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">
            Simple, credit-based pricing.
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            Buy credits when you need them, or subscribe for a steady monthly supply. Commercial
            licence included on every plan.
          </p>
          <p className="mt-3 font-mono text-[11px] tracking-wide text-muted">
            {SIGNUP_CREDITS} FREE CREDITS ON SIGNUP*
          </p>
          <p className="mt-1 text-[11px] text-dim">*{SIGNUP_CREDITS_NOTE}</p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="flex gap-0.5 rounded-full border border-border bg-surface p-1">
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
              Credits
            </button>
          </div>
        </div>

        {plans.length === 0 ? (
          <p className="text-center text-sm text-dim">Couldn&apos;t load live pricing right now.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} tab={tab} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
