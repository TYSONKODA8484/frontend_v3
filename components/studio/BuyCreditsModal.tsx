"use client";

import { useEffect, useState } from "react";
import { X, Check, Lock } from "lucide-react";
import { CreditIcon } from "@/components/ui/CreditIcon";
import { getBilling } from "@/lib/api/billing";
import { apiErrorDetail } from "@/lib/api/authed-fetch";
import { checkoutCreditPack, checkoutSubscription, switchSubscription } from "@/lib/api/checkout";
import { loadRazorpayCheckout, openRazorpayCheckout } from "@/lib/razorpay/checkout";
import type { BillingPlan, BillingResponse } from "@/lib/types/billing";
import { useTeam } from "@/lib/studio/TeamContext";
import { useTeamBilling } from "@/lib/studio/TeamBillingContext";
import { useToast } from "@/lib/studio/ToastContext";

function formatRupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function BuyCreditsModal() {
  const { activeTeamId, activeTeam } = useTeam();
  const { billing: teamBilling, buyModalOpen, buyModalTab, closeBuyModal, refetch } = useTeamBilling();
  const { say } = useToast();
  const [tab, setTab] = useState<"sub" | "credits">(buyModalTab);
  const [billing, setBilling] = useState<BillingResponse>({ subscriptions: [], credits: [] });
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  // After a successful payment, the backend credits the account via a
  // webhook that isn't instant — a single delayed refetch left the pill
  // showing the old total for up to a minute with no feedback. This polls
  // until the total actually changes (or gives up after a minute, at which
  // point TeamBillingContext's own background refresh will pick it up).
  const [awaitingCredit, setAwaitingCredit] = useState<{ prevCredits: number; startedAt: number } | null>(
    null,
  );

  const isOwner = activeTeam?.role === "owner";

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

  useEffect(() => {
    if (!awaitingCredit) return;
    if (teamBilling && teamBilling.totalCredits !== awaitingCredit.prevCredits) {
      say(`Credits added — you now have ${teamBilling.totalCredits}.`);
      // Reacting to teamBilling (an external value from context) changing —
      // exactly the "subscribe to an external system" case the rule allows.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAwaitingCredit(null);
      return;
    }
    if (Date.now() - awaitingCredit.startedAt > 60_000) {
      setAwaitingCredit(null);
      return;
    }
    const t = setTimeout(refetch, 2000);
    return () => clearTimeout(t);
  }, [awaitingCredit, teamBilling, refetch, say]);

  if (!buyModalOpen) return null;

  const currentKey = teamBilling?.plan?.toLowerCase();
  const matchesTeamPlan = (p: BillingPlan) =>
    tab === "sub" && !!currentKey && (p.slug.toLowerCase() === currentKey || p.name.toLowerCase() === currentKey);
  // A subscription that was started but never paid (checkout closed) has a
  // plan on the team but is not "active" — it must not look like a plan they own.
  const subActive = teamBilling?.subscriptionStatus?.toLowerCase() === "active";
  const isCurrentPlan = (p: BillingPlan) => matchesTeamPlan(p) && subActive;
  const isPendingPlan = (p: BillingPlan) => matchesTeamPlan(p) && !subActive;

  const plans = (tab === "sub" ? billing.subscriptions : billing.credits)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Once a team is subscribed, "best value" styling is dropped: the only card
  // that should stand out is the one they already own, and it must read as
  // "already yours", not as the recommended thing to click.
  const ownsPlan = plans.some(isCurrentPlan);
  const renews = teamBilling?.currentPeriodEnd
    ? new Date(teamBilling.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  async function handleBuy(plan: BillingPlan) {
    if (!activeTeamId || !isOwner || buyingId) return;
    setBuyingId(plan.id);
    try {
      await loadRazorpayCheckout();
      if (tab === "credits") {
        const checkout = await checkoutCreditPack(activeTeamId, plan.id);
        openRazorpayCheckout({
          key: checkout.key_id,
          amount: checkout.amount,
          currency: checkout.currency,
          order_id: checkout.order_id,
          name: "ShootPX",
          description: `${plan.name} — ${plan.credits} credits`,
          theme: { color: "#c8ff00" },
          handler: () => {
            closeBuyModal();
            say("Payment submitted — crediting your account…");
            setAwaitingCredit({ prevCredits: teamBilling?.totalCredits ?? 0, startedAt: Date.now() });
          },
          modal: { ondismiss: () => say("Checkout cancelled") },
        });
      } else {
        // Changing plans on an active subscription goes through /switch; the
        // plain checkout is only for teams without one.
        const checkout = subActive
          ? await switchSubscription(activeTeamId, plan.id)
          : await checkoutSubscription(activeTeamId, plan.id);
        openRazorpayCheckout({
          key: checkout.key_id,
          subscription_id: checkout.razorpay_subscription_id,
          name: "ShootPX",
          description: `${plan.name} subscription`,
          theme: { color: "#c8ff00" },
          handler: () => {
            closeBuyModal();
            say("Payment submitted — activating your subscription…");
            setAwaitingCredit({ prevCredits: teamBilling?.totalCredits ?? 0, startedAt: Date.now() });
          },
          modal: { ondismiss: () => say("Checkout cancelled") },
        });
      }
    } catch (err) {
      say(apiErrorDetail(err, "Couldn't start checkout. Please try again."));
    } finally {
      setBuyingId(null);
    }
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

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3.5 px-6 py-20">
        <h2 className="text-center font-heading text-[clamp(32px,4.4vw,48px)] font-bold tracking-tight">
          More credits, more shoots.
        </h2>
        <p className="max-w-[52ch] text-center text-[15px] text-muted">
          Buy credits when you need them, or subscribe for a steady supply. Commercial licence
          included on every plan.
        </p>
        {!isOwner && (
          <p className="text-center text-[13px] text-accent">
            Only the team owner can buy credits or manage subscriptions.
          </p>
        )}

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
            Credits
          </button>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-dim">Loading plans…</p>
        ) : plans.length === 0 ? (
          <p className="mt-10 text-sm text-dim">Couldn&apos;t load plans right now.</p>
        ) : (
          // One horizontal row for any number of plans — scrolls sideways once
          // there are more than fit, and centres while they do fit.
          <div className="mt-9 w-full overflow-x-auto pb-4 pt-1">
            <div className="mx-auto flex w-max gap-4">
              {plans.map((plan) => {
                const current = isCurrentPlan(plan);
                const pending = isPendingPlan(plan);
                const featured = !!plan.tag && !ownsPlan;
                const isBuying = buyingId === plan.id;
                return (
                  <div
                    key={plan.id}
                    aria-disabled={!isOwner}
                    className={`relative flex w-[250px] flex-none flex-col gap-3.5 rounded-2xl border p-6 ${
                      current
                        ? "border-border-strong bg-surface-2"
                        : featured
                          ? "border-accent bg-surface"
                          : "border-border bg-bg"
                    } ${!isOwner ? "cursor-not-allowed opacity-60 grayscale-[40%]" : ""}`}
                  >
                    {current && (
                      <span className="flex w-fit items-center gap-1.5 rounded-full border border-border-strong bg-bg px-2.5 py-1 font-mono text-[10px] tracking-wide text-text">
                        <Check size={11} /> YOUR PLAN
                      </span>
                    )}
                    {pending && (
                      <span className="flex w-fit items-center gap-1.5 rounded-full border border-[#ff8a6b]/60 bg-bg px-2.5 py-1 font-mono text-[10px] tracking-wide text-[#ff8a6b]">
                        PAYMENT PENDING
                      </span>
                    )}
                    <div>
                      <div className="font-heading text-lg font-semibold">{plan.name}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-dim">
                        <CreditIcon size={12} />
                        {plan.credits} credits
                      </div>
                    </div>
                    <div>
                      <span className="font-heading text-3xl font-bold tracking-tight text-accent">
                        ₹{formatRupees(plan.price)}
                      </span>
                      <span className="text-xs text-dim"> {tab === "credits" ? "one-time" : plan.periodLabel}</span>
                    </div>
                    <button
                      onClick={() => handleBuy(plan)}
                      disabled={!isOwner || current || buyingId !== null}
                      title={!isOwner ? "Only the team owner can buy" : current ? "This is your current plan" : undefined}
                      className={`flex items-center justify-center gap-1.5 rounded-full py-3 text-[13.5px] font-semibold disabled:cursor-not-allowed ${
                        current
                          ? "border border-border-strong bg-bg/40 text-muted"
                          : !isOwner
                            ? "border border-border text-dim"
                            : featured
                              ? "bg-accent text-accent-ink hover:bg-accent-hover disabled:opacity-50"
                              : "border border-border-strong hover:border-accent disabled:opacity-50"
                      }`}
                    >
                      {current ? (
                        <>
                          <Check size={14} /> Current plan
                        </>
                      ) : !isOwner ? (
                        <>
                          <Lock size={13} /> Owner only
                        </>
                      ) : isBuying ? (
                        "Opening checkout…"
                      ) : pending ? (
                        "Retry payment"
                      ) : (
                        ownsPlan && tab === "sub" ? "Switch to this plan" : "Get started"
                      )}
                    </button>
                    {current && (
                      <p className="-mt-1.5 text-center text-[11.5px] text-dim">
                        Active{renews ? ` · renews ${renews}` : ""}
                      </p>
                    )}
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
          </div>
        )}
      </div>
    </div>
  );
}
