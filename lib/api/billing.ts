import type { BillingResponse } from "@/lib/types/billing";
import { API_URL } from "@/lib/api/base-url";

export async function getBilling(): Promise<BillingResponse> {
  try {
    const res = await fetch(`${API_URL}/landing/billing`, { cache: "no-store" });
    if (!res.ok) return { subscriptions: [], credits: [] };
    return (await res.json()) as BillingResponse;
  } catch {
    return { subscriptions: [], credits: [] };
  }
}
