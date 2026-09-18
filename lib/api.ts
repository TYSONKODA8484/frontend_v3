import type { BillingResponse, ToolsResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function getTools(): Promise<ToolsResponse> {
  try {
    const res = await fetch(`${API_URL}/landing/tools`, { cache: "no-store" });
    if (!res.ok) return { tools: [] };
    return (await res.json()) as ToolsResponse;
  } catch {
    return { tools: [] };
  }
}

export async function getBilling(): Promise<BillingResponse> {
  try {
    const res = await fetch(`${API_URL}/landing/billing`, { cache: "no-store" });
    if (!res.ok) return { subscriptions: [], credits: [] };
    return (await res.json()) as BillingResponse;
  } catch {
    return { subscriptions: [], credits: [] };
  }
}
