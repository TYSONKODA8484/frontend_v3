import { authedJson } from "@/lib/api/authed-fetch";
import type { CancelSubscriptionResponse, CreditPackCheckout, SubscriptionCheckout } from "@/lib/types/checkout";

export function checkoutCreditPack(teamId: string, packId: string) {
  return authedJson<CreditPackCheckout>(
    `/billing/teams/${teamId}/credit-packs/${packId}/checkout`,
    { method: "POST" },
  );
}

export function checkoutSubscription(teamId: string, subscriptionId: string) {
  return authedJson<SubscriptionCheckout>(
    `/billing/teams/${teamId}/subscriptions/${subscriptionId}/checkout`,
    { method: "POST" },
  );
}

export function switchSubscription(teamId: string, newSubscriptionId: string) {
  return authedJson<SubscriptionCheckout>(
    `/billing/teams/${teamId}/subscriptions/${newSubscriptionId}/switch`,
    { method: "POST" },
  );
}

export function cancelSubscription(teamId: string) {
  return authedJson<CancelSubscriptionResponse>(
    `/billing/teams/${teamId}/subscriptions/cancel`,
    { method: "POST" },
  );
}
