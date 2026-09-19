"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTools } from "@/lib/api/tools";
import { setPendingInputs } from "@/lib/studio/send-to-store";
import { useToast } from "@/lib/studio/ToastContext";
import type { Tool } from "@/lib/types/tool";

// The catalog barely changes — share one fetch across every menu instance.
let toolsPromise: Promise<Tool[]> | null = null;
function loadLiveTools(): Promise<Tool[]> {
  toolsPromise ??= getTools().then((r) =>
    r.tools.filter((t) => t.status === "live").sort((a, b) => a.cardSortOrder - b.cardSortOrder),
  );
  return toolsPromise;
}

/** "Send to…" — feeds this batch's images into another tool as its inputs. */
export function SendToMenu({
  currentFeatureType,
  urls,
  small,
}: {
  currentFeatureType: string;
  urls: string[];
  small?: boolean;
}) {
  const router = useRouter();
  const { say } = useToast();
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    loadLiveTools()
      .then(setTools)
      .catch(() => {});
  }, []);

  const targets = tools.filter((t) => t.featureType !== currentFeatureType);
  if (targets.length === 0 || urls.length === 0) return null;

  function send(t: Tool) {
    setPendingInputs(t.featureType, urls);
    setOpen(false);
    say(`Sent ${urls.length} ${urls.length === 1 ? "image" : "images"} to ${t.displayName}`);
    router.push(`/studio/tools/${t.featureType}`);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`rounded-full border border-border-strong text-muted hover:text-text ${
          small ? "px-[15px] py-2 text-[12.5px]" : "px-4 py-[9px] text-[13px]"
        }`}
      >
        Send to…
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] z-20 min-w-[170px] border border-border-strong bg-surface shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
            {targets.map((t) => (
              <button
                key={t.featureType}
                onClick={() => send(t)}
                className="block w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-surface-2"
              >
                {t.displayName}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
