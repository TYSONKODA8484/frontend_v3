import { Check } from "lucide-react";
import { CreditIcon } from "@/components/ui/CreditIcon";
import type { BillingPlan } from "@/lib/types/billing";
import { formatRupees, periodSuffix, type PricingTab } from "./format";

export function PlanCard({ plan, tab }: { plan: BillingPlan; tab: PricingTab }) {
  const featured = !!plan.tag;
  return (
    <div className="w-full max-w-[280px] flex-none">
      <div
        className={`relative flex h-full flex-col gap-3.5 rounded-2xl p-6 ${
          featured ? "border-[1.5px] border-accent bg-surface" : "border border-border bg-surface"
        }`}
      >
        {featured && (
          <span className="absolute -top-2.5 left-6 rounded-full bg-accent px-2.5 py-1 font-mono text-[9.5px] tracking-wide text-accent-ink">
            {plan.tag}
          </span>
        )}
        <span className={`font-mono text-[11px] tracking-wide ${featured ? "text-accent" : "text-dim"}`}>
          {plan.name}
        </span>
        <span className="font-heading text-4xl font-bold leading-none tracking-tight">
          ₹{formatRupees(plan.price)}
          <span className="text-sm font-normal text-dim">{periodSuffix(plan, tab)}</span>
        </span>
        {/* How many credits the plan gives, straight from the API. */}
        <span className="credit-amount text-[15px] font-semibold text-text">
          <CreditIcon size={16} />
          {plan.credits.toLocaleString("en-US")} credits
          {tab === "sub" && plan.periodLabel ? (
            <span className="text-[13px] font-normal text-dim">/{plan.periodLabel}</span>
          ) : null}
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
          {tab === "credits" ? "Buy credits" : "Subscribe"}
        </a>
      </div>
    </div>
  );
}
