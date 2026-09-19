// Mirrors GET /landing/tools (backed by tool_definitions). featureType is the
// id everywhere — URLs, deeplinks, /tools/{featureType}/schema and /generate.
export type Tool = {
  featureType: string;
  displayName: string;
  description: string | null;
  icon: string | null;
  category: string; // lowercase: shoot | finish | video | scale
  cardSortOrder: number;
  isComingSoon: boolean; // editorial badge only — gate on status
  status: "live" | "soon";
};

export type ToolsResponse = {
  tools: Tool[];
};

// Studio only surfaces tools that actually work.
export const isLive = (t: Tool) => t.status === "live";

export const CATEGORY_ORDER = ["shoot", "finish", "video", "scale"];
export const categoryRank = (c: string) => {
  const i = CATEGORY_ORDER.indexOf(c);
  return i === -1 ? CATEGORY_ORDER.length : i;
};
