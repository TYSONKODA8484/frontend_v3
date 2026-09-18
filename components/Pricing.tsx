"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { BillingPlan, BillingResponse } from "@/lib/types";

function periodSuffix(plan: BillingPlan, kind: "sub" | "credits") {
  if (kind === "credits") return " one-time";
  if (plan.periodLabel) return `/${plan.periodLabel}`;
  if (plan.billingPeriodDays) return `/${plan.billingPeriodDays}d`;
  return "";
}

// Razorpay amounts are always in paise (1 INR = 100 paise).
function formatRupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function PlanCard({ plan, kind }: { plan: BillingPlan; kind: "sub" | "credits" }) {
  const featured = !!plan.tag;
  return (
    <div className="w-full max-w-[280px] flex-none">
      <div
        className={`relative flex h-full flex-col gap-3.5 rounded-2xl p-6 ${
          featured
            ? "border-[1.5px] border-accent bg-surface"
            : "border border-border bg-surface"
        }`}
      >
        {featured && (
          <span className="absolute -top-2.5 left-6 rounded-full bg-accent px-2.5 py-1 font-mono text-[9.5px] tracking-wide text-accent-ink">
            {plan.tag}
          </span>
        )}
        <span
          className={`font-mono text-[11px] tracking-wide ${featured ? "text-accent" : "text-dim"}`}
        >
          {plan.name}
        </span>
        <span className="font-heading text-4xl font-bold leading-none tracking-tight">
          ₹{formatRupees(plan.price)}
          <span className="text-sm font-normal text-dim">{periodSuffix(plan, kind)}</span>
        </span>
        <div className="flex flex-col gap-2">
          {plan.info.map((f) => (
            <span key={f} className="flex gap-2 text-[13px] text-muted">
              <Check size={14} className={`mt-0.5 flex-none ${featured ? "text-accent" : "text-accent-dim"}`} />
              {f}
            </span>
          ))}
        </div>
        <a
          href="/auth"
          className={`mt-auto rounded-full py-3 text-center text-[13.5px] font-semibold ${
            featured
              ? "bg-accent text-accent-ink hover:bg-accent-hover"
              : "border border-border-strong font-medium hover:border-text"
          }`}
        >
          {kind === "credits" ? "Buy credits" : "Subscribe"}
        </a>
      </div>
    </div>
  );
}

export function Pricing({ billing }: { billing: BillingResponse }) {
  const [tab, setTab] = useState<"sub" | "credits">("sub");
  const plans = (tab === "sub" ? billing.subscriptions : billing.credits)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section id="pricing" aria-label="Pricing" className="border-t border-border bg-bg-alt">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="mx-auto mb-10 max-w-[54ch] text-center">
          <span className="font-mono text-[11px] tracking-widest text-accent-dim">PRICING</span>
          <h2 className="mt-3 font-heading text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">
            Simple, pay-as-you-go credits.
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            Buy credits when you need them, or subscribe for a steady monthly supply. Commercial
            licence included on every plan.
          </p>
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
              <PlanCard key={plan.id} plan={plan} kind={tab} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
