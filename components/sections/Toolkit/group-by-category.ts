import type { Tool } from "@/lib/types/tool";

export function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function groupToolsByCategory(tools: Tool[]): Map<string, Tool[]> {
  const groups = new Map<string, Tool[]>();
  for (const tool of tools) {
    const key = tool.category || "More";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tool);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return groups;
}
