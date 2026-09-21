"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { parseRatio, ratioShape } from "@/lib/tools/ratio";

const POPOVER_W = 440;
const TILE = 74;

export type SizeOption = { value: string; label: string };

/** "Size" row whose menu is a grid of aspect-ratio tiles drawn at true proportions (1:1 is a real square). */
export function SizeField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: SizeOption[];
  onChange: (value: string) => void;
}) {
  const rowRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !rowRef.current?.contains(t)) setPos(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pos]);

  function toggle() {
    if (pos) return setPos(null);
    const r = rowRef.current!.getBoundingClientRect();
    setPos({
      top: Math.max(12, Math.min(r.top, window.innerHeight - 560)),
      left: Math.max(12, Math.min(r.right + 14, window.innerWidth - POPOVER_W - 16)),
    });
  }

  return (
    <div className="relative">
      <button
        ref={rowRef}
        onClick={toggle}
        className="flex w-full items-center justify-between border border-border bg-surface p-3.5 hover:border-accent"
      >
        <span className="text-[13px] font-medium">{label}</span>
        <span className="text-[13px] text-muted">{current?.label ?? "None"}</span>
      </button>

      {pos && (
        <div
          ref={popRef}
          style={{ top: pos.top, left: pos.left, width: POPOVER_W }}
          className="fixed z-30 box-border grid max-h-[calc(100vh-24px)] grid-cols-3 gap-3.5 overflow-y-auto border border-border-strong bg-surface p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          {options.map((o) => {
            const on = o.value === value;
            const { width, height } = ratioShape(parseRatio(`${o.label} ${o.value}`), TILE);
            return (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setPos(null);
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="relative flex aspect-square w-full items-center justify-center">
                  <div
                    className={`rounded bg-surface-2 border-2 ${on ? "border-accent" : "border-border-strong"}`}
                    style={{ width, height }}
                  />
                  {on && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-ink">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <span className="text-center text-[10.5px] text-muted">{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
