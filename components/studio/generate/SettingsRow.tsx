"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CreditIcon } from "@/components/ui/CreditIcon";

export type SettingsRowOption = {
  value: string;
  label: string;
  badge?: string;
  /** A price, drawn with the credit icon. Prefer this over `badge` for costs. */
  credits?: number;
  /** Relative price, e.g. 2 = "2x" the base — shown with the credit icon. */
  multiplier?: number;
};

const fmtMultiplier = (m: number) => `${Number.isInteger(m) ? m : m.toFixed(1)}x`;

function CostTag({ credits, badge, multiplier }: { credits?: number; badge?: string; multiplier?: number }) {
  if (multiplier != null) {
    return (
      <span className="credit-tag">
        <CreditIcon size={11} />
        {fmtMultiplier(multiplier)}
      </span>
    );
  }
  if (credits != null) {
    return (
      <span className="credit-tag">
        <CreditIcon size={11} />
        {credits}
      </span>
    );
  }
  return badge ? <span className="credit-tag">{badge}</span> : null;
}

export function SettingsRow({
  label,
  currentValue,
  currentLabel,
  currentBadge,
  currentCredits,
  currentMultiplier,
  options,
  onSelect,
}: {
  label: string;
  currentValue: string;
  currentLabel: string;
  currentBadge?: string;
  currentCredits?: number;
  currentMultiplier?: number;
  options: SettingsRowOption[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border border-border bg-surface px-3.5 py-3.5 hover:border-accent"
      >
        <span className="text-[13px] font-medium">{label}</span>
        <span className="flex items-center gap-2 text-[13px] text-muted">
          {currentLabel}
          <CostTag credits={currentCredits} badge={currentBadge} multiplier={currentMultiplier} />
          <ChevronDown size={13} className="text-dim" />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-full border border-border-strong bg-surface shadow-2xl shadow-black/50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] hover:bg-surface-2 ${
                opt.value === currentValue ? "text-accent" : "text-text"
              }`}
            >
              {opt.label}
              <CostTag credits={opt.credits} badge={opt.badge} multiplier={opt.multiplier} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
