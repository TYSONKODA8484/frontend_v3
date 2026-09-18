import type { BillingPlan } from "@/lib/types/billing";

export type PricingTab = "sub" | "credits";

export function periodSuffix(plan: BillingPlan, tab: PricingTab) {
  if (tab === "credits") return " one-time";
  if (plan.periodLabel) return `/${plan.periodLabel}`;
  if (plan.billingPeriodDays) return `/${plan.billingPeriodDays}d`;
  return "";
}

/** Razorpay amounts are always in paise (1 INR = 100 paise). */
export function formatRupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
