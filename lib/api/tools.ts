import type { ToolsResponse } from "@/lib/types/tool";
import { API_URL } from "@/lib/api/base-url";

export async function getTools(): Promise<ToolsResponse> {
  try {
    // Public catalog data that barely changes — letting Next's data cache
    // serve repeat requests within the window avoids hitting the backend on
    // every single navigation to Home/Tools (each is a separate page load).
    const res = await fetch(`${API_URL}/landing/tools`, { next: { revalidate: 120 } });
    if (!res.ok) return { tools: [] };
    return (await res.json()) as ToolsResponse;
  } catch {
    return { tools: [] };
  }
}
