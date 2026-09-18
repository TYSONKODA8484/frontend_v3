"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SettingsRowOption = { value: string; label: string; badge?: string };

export function SettingsRow({
  label,
  currentLabel,
  currentBadge,
  options,
  onSelect,
}: {
  label: string;
  currentLabel: string;
  currentBadge?: string;
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
          {currentBadge && (
            <span className="rounded-[5px] border border-border-strong bg-surface-2 px-1.5 py-0.5 text-[11px] text-text">
              {currentBadge}
            </span>
          )}
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
                opt.value === currentLabel || opt.label === currentLabel ? "text-accent" : "text-text"
              }`}
            >
              {opt.label}
              {opt.badge && (
                <span className="rounded-[5px] border border-border-strong bg-surface-2 px-1.5 py-0.5 text-[11px]">
                  {opt.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
