"use client";

import { useEffect, useState } from "react";
import { CreditIcon } from "@/components/ui/CreditIcon";
import { useTeam } from "@/lib/studio/TeamContext";
import { useTeamBilling } from "@/lib/studio/TeamBillingContext";
import { useToast } from "@/lib/studio/ToastContext";
import { apiErrorDetail } from "@/lib/api/authed-fetch";
import { cancelSubscription } from "@/lib/api/checkout";
import { getBilling } from "@/lib/api/billing";
import type { BillingPlan } from "@/lib/types/billing";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function BillingTab() {
  const { activeTeamId, activeTeam } = useTeam();
  const { billing, loading, refetch, openBuyModal } = useTeamBilling();
  const { say } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [plans, setPlans] = useState<BillingPlan[]>([]);

  // The team's billing only carries the plan's name; the plan catalog has
  // what it includes (credits per period).
  useEffect(() => {
    getBilling().then((r) => setPlans(r.subscriptions));
  }, []);
  const subActive = billing?.subscriptionStatus?.toLowerCase() === "active";
  const planKey = billing?.plan?.toLowerCase();
  const currentPlan = planKey
    ? plans.find((p) => p.slug.toLowerCase() === planKey || p.name.toLowerCase() === planKey)
    : undefined;

  const isOwner = activeTeam?.role === "owner";

  async function handleCancel() {
    if (!activeTeamId) return;
    setCancelling(true);
    try {
      await cancelSubscription(activeTeamId);
      say("Subscription canceled");
      setConfirmCancel(false);
      refetch();
    } catch (err) {
      say(apiErrorDetail(err, "Couldn't cancel the subscription"));
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-dim">Loading billing…</p>;
  }

  if (!billing) {
    return <p className="text-sm text-dim">Couldn&apos;t load billing right now.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {!isOwner && (
        <p className="text-xs text-accent">
          You can view billing, but only the team owner can buy credits or manage the subscription.
        </p>
      )}

      <div className="border border-border p-5">
        <div className="font-mono text-[10.5px] tracking-wide text-dim">CURRENT PLAN</div>
        {billing.plan ? (
          <div className="mt-2.5 flex items-center justify-between">
            <div>
              <div className="font-heading text-[22px] font-bold">{billing.plan}</div>
              {currentPlan && (
                <div className="mt-1 text-[13px] text-muted">
                  {currentPlan.credits.toLocaleString()} credits/{currentPlan.periodLabel}
                </div>
              )}
              {subActive ? (
                <div className="mt-0.5 text-[12.5px] text-dim capitalize">Status: {billing.subscriptionStatus}</div>
              ) : (
                <div className="mt-1.5 max-w-[46ch] text-[12.5px] leading-relaxed text-[#ff8a6b]">
                  Payment not completed. This subscription isn&apos;t active yet — finish paying, or pick a plan again.
                </div>
              )}
              {subActive && billing.currentPeriodEnd && (
                <div className="mt-0.5 text-[12.5px] text-dim">
                  Renews {formatDate(billing.currentPeriodEnd)}
                </div>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-2.5">
                <button
                  onClick={() => openBuyModal("sub")}
                  className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] font-medium hover:border-accent"
                >
                  {subActive ? "Manage subscription" : "Complete payment"}
                </button>
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] text-muted hover:border-[#ff5c4d] hover:text-[#ff8a6b] disabled:opacity-60"
                >
                  Cancel subscription
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2.5 flex items-center justify-between">
            <div className="text-[15px] text-muted">No active subscription</div>
            {isOwner && (
              <button
                onClick={() => openBuyModal("sub")}
                className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-accent-ink hover:bg-accent-hover"
              >
                Choose a plan
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border border-border p-5">
        <div>
          <div className="font-mono text-[10.5px] tracking-wide text-dim">CREDIT BALANCE</div>
          <div className="mt-1 flex items-center gap-2 font-heading text-[30px] font-bold">
            <CreditIcon size={26} />
            {billing.totalCredits} credits
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => openBuyModal("credits")}
            className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] font-medium hover:border-accent"
          >
            Buy credits
          </button>
        )}
      </div>

      <div>
        <span className="font-mono text-[11px] tracking-widest text-dim">BILLING HISTORY</span>
        <div className="mt-3 overflow-hidden border border-border">
          <div className="flex items-center gap-3.5 border-b border-border px-4 py-2.5 font-mono text-[10.5px] tracking-wide text-dim">
            <span className="flex-1">TRANSACTION</span>
            <span className="w-[70px]">DATE</span>
            <span className="w-[70px]">AMOUNT</span>
            <span className="w-[60px]">STATUS</span>
            <span className="w-[110px] text-right">INVOICE</span>
          </div>
          <p className="p-4 text-center text-[13px] text-dim">Billing history isn&apos;t available yet.</p>
        </div>
      </div>

      {confirmCancel && (
        <div
          onClick={() => !cancelling && setConfirmCancel(false)}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[400px] flex-col gap-3.5 border border-border-strong bg-bg p-7"
          >
            <div className="font-heading text-[17px] font-semibold">Cancel your subscription?</div>
            <p className="text-[13.5px] leading-relaxed text-muted">
              {billing.currentPeriodEnd
                ? `Your subscription will remain active until ${formatDate(billing.currentPeriodEnd)}. It will not renew after that date. `
                : ""}
              Your remaining credits will remain available.
            </p>
            <div className="mt-1.5 flex gap-2.5">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={cancelling}
                className="flex-1 rounded-full border border-border-strong py-2.5 text-[13.5px] font-medium hover:border-accent"
              >
                Keep subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-full border border-[#ff5c4d] py-2.5 text-[13.5px] text-[#ff8a6b] hover:bg-[#ff5c4d]/10 disabled:opacity-60"
              >
                {cancelling ? "Cancelling…" : "Cancel subscription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
