"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Generation } from "@/lib/types/generation";

type Props = {
  item: Generation;
  toolLabel: string;
  memberName: string | null;
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
  canStep: boolean;
  onDownload: () => void;
};

const MAX_ZOOM = 4;

export function DetailPanel({ item, toolLabel, memberName, onClose, onStep, canStep, onDownload }: Props) {
  const [hover, setHover] = useState(false);
  const [full, setFull] = useState(false);
  const [zoom, setZoom] = useState(1);
  const fullRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (full) setFull(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, onClose]);

  // Scroll-to-zoom needs a non-passive listener to stop the page scrolling behind.
  useEffect(() => {
    const el = fullRef.current;
    if (!full || !el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(1, z - e.deltaY * 0.0015)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [full]);

  const date = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const rows: [string, string][] = [["Tool", toolLabel]];
  if (memberName) rows.push(["Member", memberName]);
  rows.push(["Date", date]);

  const step = (dir: -1 | 1) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onStep(dir);
  };

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/55" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-[56] flex h-screen w-[380px] max-w-full flex-col overflow-hidden border-l border-border-strong bg-bg">
        <div className="flex flex-none items-center justify-between border-b border-border px-5 py-4">
          <button onClick={onClose} aria-label="Close" className="text-dim hover:text-text">
            <X size={18} />
          </button>
          <button
            onClick={onDownload}
            className="rounded-full bg-accent px-[18px] py-2 text-[13px] font-semibold text-accent-ink hover:bg-accent-hover"
          >
            Download
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto overflow-x-hidden p-5">
          <div
            className="relative aspect-square w-full flex-none"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <button
              onClick={() => {
                setZoom(1);
                setFull(true);
              }}
              aria-label="View full image"
              className="relative block h-full w-full cursor-pointer overflow-hidden border border-border bg-surface"
            >
              {item.outputUrl && (
                <Image src={item.outputUrl} alt={item.title || toolLabel} fill sizes="380px" className="object-cover" />
              )}
            </button>
            {hover && canStep && (
              <>
                <button
                  onClick={step(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={step(1)}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          <div>
            <div className="text-[15px] font-semibold">{item.title || toolLabel}</div>
            <div className="mt-3.5 flex flex-col gap-[9px]">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between text-[12.5px]">
                  <span className="text-dim">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {full && item.outputUrl && (
        <div
          ref={fullRef}
          onClick={() => setFull(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/90 p-10"
        >
          <button
            onClick={() => setFull(false)}
            aria-label="Close full image"
            className="fixed right-[30px] top-[26px] z-[91] text-dim hover:text-white"
          >
            <X size={22} />
          </button>
          <span className="fixed bottom-[26px] left-1/2 z-[91] -translate-x-1/2 text-xs text-dim">
            {Math.round(zoom * 100)}% · scroll to zoom
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution view, sized by CSS transform */}
          <img
            src={item.outputUrl}
            alt={item.title || toolLabel}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
            className="h-[80vh] w-[80vw] object-contain transition-transform duration-75 ease-linear"
            style={{ transform: `scale(${zoom})`, cursor: zoom > 1 ? "zoom-out" : "zoom-in" }}
          />
        </div>
      )}
    </>
  );
}
