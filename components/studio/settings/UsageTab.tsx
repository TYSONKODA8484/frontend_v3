"use client";

import { useState } from "react";
import { useTeam } from "@/lib/studio/TeamContext";

export function UsageTab() {
  const { members } = useTeam();
  const [period, setPeriod] = useState<"This week" | "This month">("This month");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border border-border px-5 py-3.5">
        <div className="flex gap-1.5">
          {(["This week", "This month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] ${
                period === p ? "bg-surface-2 text-text" : "text-muted hover:text-text"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10.5px] tracking-wide text-dim">CREDITS USED</span>
          <span className="font-heading text-xl font-bold">0</span>
        </div>
      </div>

      <div>
        <span className="font-mono text-[11px] tracking-wide text-dim">BY MEMBER</span>
        <div className="mt-3 border border-border">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex justify-between border-b border-border px-4 py-3 text-[13px] last:border-b-0"
            >
              <span>{m.name}</span>
              <span className="font-medium">0 credits</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-dim">
        Usage breakdown by tool will appear here once generations start using credits.
      </p>
    </div>
  );
}
