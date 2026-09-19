"use client";

import { useEffect, useRef, useState } from "react";
import { hexToHsv, hsvToHex, isHex } from "@/lib/tools/color";

const POPOVER_W = 340;
const POPOVER_H = 420;

/** Swatch row that opens the design's colour palette: saturation square, hue slider, hex input, preview. */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const rowRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  // Hue is kept separately: at zero saturation/brightness the hex has no hue,
  // and dragging the square would otherwise snap the hue slider back to red.
  const [hue, setHue] = useState(() => hexToHsv(value).h);
  const [draft, setDraft] = useState(value);

  const valid = isHex(value);
  const hex = valid ? (value.startsWith("#") ? value : `#${value}`).toUpperCase() : "#C8FF00";
  const hsv = hexToHsv(hex);

  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !rowRef.current?.contains(t)) setPos(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pos]);

  function open() {
    if (pos) return setPos(null);
    const r = rowRef.current!.getBoundingClientRect();
    setPos({
      top: Math.max(12, Math.min(r.top, window.innerHeight - POPOVER_H)),
      left: Math.max(12, Math.min(r.right + 14, window.innerWidth - POPOVER_W - 16)),
    });
    setDraft(hex);
  }

  // Drag helper: reports 0–1 positions inside `el` while the mouse is held.
  function drag(el: HTMLElement, e: React.MouseEvent, apply: (x: number, y: number) => void) {
    const update = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      apply(
        Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
        Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
      );
    };
    update(e.clientX, e.clientY);
    const move = (ev: MouseEvent) => update(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  function commit(next: string) {
    setDraft(next);
    onChange(next);
  }

  return (
    <div className="relative">
      <button
        ref={rowRef}
        onClick={open}
        className="flex w-full items-center gap-3.5 border border-border bg-surface p-3.5 text-left hover:border-accent"
      >
        <span className="h-11 w-11 flex-none rounded-lg" style={{ background: hex }} />
        <span>
          <span className="block text-[13px] font-medium">{label}</span>
          <span className="block font-mono text-[12.5px] text-muted">{hex}</span>
        </span>
      </button>

      {pos && (
        <div
          ref={popRef}
          style={{ top: pos.top, left: pos.left, width: POPOVER_W }}
          className="fixed z-30 flex flex-col gap-3.5 border border-border-strong bg-surface p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          <div
            onMouseDown={(e) =>
              drag(e.currentTarget, e, (x, y) => commit(hsvToHex({ h: hue, s: x * 100, v: (1 - y) * 100 })))
            }
            className="relative h-[180px] cursor-crosshair rounded-md"
            style={{
              backgroundColor: `hsl(${hue},100%,50%)`,
              backgroundImage: "linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,transparent)",
            }}
          >
            <span
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
            />
          </div>

          <div
            onMouseDown={(e) =>
              drag(e.currentTarget, e, (x) => {
                const h = x * 360;
                setHue(h);
                commit(hsvToHex({ h, s: hsv.s, v: hsv.v }));
              })
            }
            className="relative h-3.5 cursor-pointer rounded-[7px]"
            style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
          >
            <span
              className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
              style={{ left: `${(hue / 360) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="border border-border bg-bg px-2.5 py-[7px] text-[12.5px] text-muted">Hex</span>
            <input
              value={draft}
              onChange={(e) => {
                const v = e.target.value;
                setDraft(v);
                if (isHex(v)) {
                  const withHash = v.startsWith("#") ? v : `#${v}`;
                  setHue(hexToHsv(withHash).h);
                  onChange(withHash.toUpperCase());
                }
              }}
              className="min-w-0 flex-1 border border-border bg-bg px-2.5 py-[7px] font-mono text-[13px] text-text outline-none focus:border-accent"
            />
          </div>
          <div className="h-14 rounded-md border border-border-strong" style={{ background: hex }} />
        </div>
      )}
    </div>
  );
}
