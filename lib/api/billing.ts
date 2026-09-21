import type { BillingResponse } from "@/lib/types/billing";
import { API_URL } from "@/lib/api/base-url";

// This is called both server-side (marketing/Studio home pages) and
// client-side (BuyCreditsModal, every time it opens). `next.revalidate`
// only affects the server-side calls, so this module-level cache covers the
// client-side case too — public, non-personalized plan data, safe to share
// across opens/users for a few minutes instead of re-fetching every time.
let cached: { data: BillingResponse; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getBilling(): Promise<BillingResponse> {
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  try {
    const res = await fetch(`${API_URL}/landing/billing`, { next: { revalidate: 120 } });
    if (!res.ok) return { subscriptions: [], credits: [] };
    const data = (await res.json()) as BillingResponse;
    cached = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  } catch {
    return { subscriptions: [], credits: [] };
  }
}
