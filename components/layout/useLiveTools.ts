"use client";

import { useEffect, useState } from "react";
import { getTools } from "@/lib/api/tools";
import { isLive, type Tool } from "@/lib/types/tool";

// One request shared by every Header on the page.
let cached: Promise<Tool[]> | null = null;

function loadLiveTools(): Promise<Tool[]> {
  cached ??= getTools().then((r) =>
    r.tools.filter(isLive).sort((a, b) => a.cardSortOrder - b.cardSortOrder),
  );
  return cached;
}

/** The tools that actually work, from the catalog — null until loaded (or if it failed). */
export function useLiveTools(): Tool[] | null {
  const [tools, setTools] = useState<Tool[] | null>(null);
  useEffect(() => {
    loadLiveTools()
      .then(setTools)
      .catch(() => {
        cached = null; // let a later mount retry
      });
  }, []);
  return tools && tools.length > 0 ? tools : null;
}
