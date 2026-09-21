import type { Generation } from "@/lib/types/generation";

// Guards against duplicate React keys from any source — a fast double-click
// on "Load more" re-requesting the same offset before state updates, React
// StrictMode's dev-only double-invoked effects, or the backend itself
// returning an overlapping page.
export function dedupeByJobId(list: Generation[]): Generation[] {
  const seen = new Set<string>();
  const result: Generation[] = [];
  for (const g of list) {
    if (seen.has(g.jobId)) continue;
    seen.add(g.jobId);
    result.push(g);
  }
  return result;
}
