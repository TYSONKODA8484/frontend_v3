"use client";

import { useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { useTeam } from "@/lib/studio/TeamContext";
import { useTeamBilling } from "@/lib/studio/TeamBillingContext";
import { useToast } from "@/lib/studio/ToastContext";
import { cancelSubscription } from "@/lib/api/checkout";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function BillingTab() {
  const { activeTeamId, activeTeam } = useTeam();
  const { billing, loading, refetch, openBuyModal } = useTeamBilling();
  const { say } = useToast();
  const [cancelling, setCancelling] = useState(false);

  const isOwner = activeTeam?.role === "owner";

  async function handleCancel() {
    if (!activeTeamId) return;
    setCancelling(true);
    try {
      await cancelSubscription(activeTeamId);
      say("Subscription cancelled");
      refetch();
    } catch (err) {
      say(err instanceof Error ? err.message : "Couldn't cancel the subscription");
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
              <div className="mt-1 text-[13px] text-muted">Status: {billing.subscriptionStatus}</div>
              {billing.currentPeriodEnd && (
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
                  Change plan
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="whitespace-nowrap rounded-full border border-border-strong px-5 py-2.5 text-[13.5px] text-muted hover:border-[#ff5c4d] hover:text-[#ff8a6b] disabled:opacity-60"
                >
                  {cancelling ? "Cancelling…" : "Cancel subscription"}
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
            <CircleDollarSign size={24} className="flex-none text-accent" />
            {billing.totalCredits} credits
          </div>
          <div className="mt-1 text-[12px] text-dim">
            {billing.subscriptionCredits} from subscription · {billing.topupCredits} top-up
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

      <p className="text-xs text-dim">Billing history isn&apos;t available yet.</p>
    </div>
  );
}
