import type { ToolsResponse } from "@/lib/types/tool";
import { API_URL } from "@/lib/api/base-url";

export async function getTools(): Promise<ToolsResponse> {
  try {
    const res = await fetch(`${API_URL}/landing/tools`, { cache: "no-store" });
    if (!res.ok) return { tools: [] };
    return (await res.json()) as ToolsResponse;
  } catch {
    return { tools: [] };
  }
}
