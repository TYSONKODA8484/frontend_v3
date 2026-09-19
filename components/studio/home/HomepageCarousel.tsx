"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageSlide } from "@/lib/types/homepage-slide";

const CARD_W = 516;
const CARD_H = 290;
const CARD_RADIUS = 18;
// Same motion as the design file: 0.5s, standard material ease.
const DURATION = 500;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const STEP_X = 220; // horizontal offset per slot away from centre
const DRAG_START_PX = 5; // below this a press is still a click
const DRAG_COMMIT_PX = 70; // release past this distance and the carousel moves on
const FLICK_VELOCITY = 0.45; // px/ms — a quick flick commits even over a short distance
const WHEEL_STEP_PX = 60; // accumulated horizontal scroll needed to move one slide
const WHEEL_LOCK_MS = 380;

function slideHref(slide: HomepageSlide): string | null {
  // Only "type": "tool" exists today, but deeplink.type is a discriminator
  // for future types (e.g. "page", "url") — an unrecognized type falls
  // back to no link rather than guessing at a route.
  if (slide.deeplink.type === "tool" && "feature_type" in slide.deeplink) {
    return `/studio/tools/${slide.deeplink.feature_type}`;
  }
  return null;
}

export function HomepageCarousel({ slides }: { slides: HomepageSlide[] }) {
  const sorted = [...slides].sort((a, b) => a.sortOrder - b.sortOrder);
  const n = sorted.length;
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(false);
  const wheelAccum = useRef(0);
  const wheelIdle = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Live finger/mouse offset while dragging: cards follow the pointer 1:1.
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragged = useRef(false);
  const router = useRouter();
  // The index before the latest change, to tell a normal one-step slide from a
  // card wrapping round to the far side (which must not fly across). Adjusted
  // during render — a pure derivation of `index` changing.
  const [trackedIndex, setTrackedIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(0);
  if (index !== trackedIndex) {
    setLastIndex(trackedIndex);
    setTrackedIndex(index);
  }

  const step = (delta: number) => setIndex((i) => (i + delta + n) % n);

  // Trackpad horizontal swipe. Needs a native non-passive listener so
  // preventDefault can stop the browser's back/forward swipe navigation. The
  // scroll is accumulated, so a smooth two-finger swipe moves one slide at a
  // time instead of needing one big jump to register.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || n <= 1) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (wheelLock.current) return;
      wheelAccum.current += e.deltaX;
      clearTimeout(wheelIdle.current);
      wheelIdle.current = setTimeout(() => (wheelAccum.current = 0), 160);
      if (Math.abs(wheelAccum.current) < WHEEL_STEP_PX) return;
      setIndex((i) => (i + (wheelAccum.current > 0 ? 1 : n - 1)) % n);
      wheelAccum.current = 0;
      wheelLock.current = true;
      setTimeout(() => (wheelLock.current = false), WHEEL_LOCK_MS);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [n]);

  // Valid, expected state — no slides currently scheduled/active. Hide the
  // section entirely rather than rendering a broken empty slider.
  if (n === 0) return null;

  // Pointer drag (mouse, touch and pen): the cards track the pointer, and on
  // release either commit to the next/previous slide or spring back.
  function onPointerDown(e: React.PointerEvent) {
    if (n <= 1 || (e.pointerType === "mouse" && e.button !== 0)) return;
    const x0 = e.clientX;
    const t0 = performance.now();
    dragged.current = false;
    let last = { x: x0, t: t0 };
    let velocity = 0;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      if (!dragged.current && Math.abs(dx) < DRAG_START_PX) return;
      if (!dragged.current) {
        dragged.current = true;
        setDragging(true);
      }
      const now = performance.now();
      if (now > last.t) velocity = (ev.clientX - last.x) / (now - last.t);
      last = { x: ev.clientX, t: now };
      // Resist beyond one slot so the row never runs off the screen.
      setDragX(Math.max(-STEP_X, Math.min(STEP_X, dx)));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (dragged.current) {
        const dx = ev.clientX - x0;
        if (dx <= -DRAG_COMMIT_PX || velocity <= -FLICK_VELOCITY) step(1);
        else if (dx >= DRAG_COMMIT_PX || velocity >= FLICK_VELOCITY) step(-1);
        setDragX(0);
        setDragging(false);
        // The click that follows a drag must not activate a card.
        setTimeout(() => (dragged.current = false), 0);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      style={{ touchAction: "pan-y", cursor: dragging ? "grabbing" : undefined }}
      className="relative select-none overflow-hidden pb-[30px] pt-[34px]"
    >
      <div className="relative" style={{ height: CARD_H, perspective: 1400 }}>
        {sorted.map((slide, idx) => {
          const offsetFor = (at: number) => {
            let o = idx - at;
            if (o > n / 2) o -= n;
            if (o < -n / 2) o += n;
            return o;
          };
          const off = offsetFor(index);
          const current = off === 0;
          // Only the centre and its two neighbours are visible; the rest
          // wait invisibly at the edge so they can slide in.
          const visible = Math.abs(off) <= 1;
          const wrapped = Math.abs(off - offsetFor(lastIndex)) > 2;
          const href = slideHref(slide);

          const card = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- backend-supplied CDN URL, not on next.config's allowed image hosts */}
              <img src={slide.imageUrl} alt={slide.title} draggable={false} className="h-full w-full object-cover" style={{ borderRadius: CARD_RADIUS }} />
              <div
                className="pointer-events-none absolute inset-0 transition-[background] duration-500 ease-in-out"
                style={{ borderRadius: CARD_RADIUS, background: `rgba(6,8,5,${current ? 0 : 0.45})` }}
              />
              {current && href && (
                <div className="absolute bottom-[22px] right-[22px] rounded-full bg-white px-[22px] py-2.5 text-[13.5px] font-semibold text-[#0b0f04] hover:bg-accent">
                  {slide.ctaLabel || "Try"}
                </div>
              )}
            </>
          );

          const style: React.CSSProperties = {
            width: CARD_W,
            height: CARD_H,
            marginLeft: -CARD_W / 2,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            zIndex: 5 - Math.abs(off),
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? "auto" : "none",
            transform: `translateX(${Math.max(-2, Math.min(2, off)) * STEP_X + dragX}px) scale(${current ? 1 : 0.84})`,
            // A card wrapping to the far side (already invisible there) snaps;
            // every other move — including sliding out of view — animates.
            // While dragging, follow the pointer with no easing at all.
            transition: wrapped || dragging
              ? "none"
              : `transform ${DURATION}ms ${EASE}, opacity ${DURATION}ms ${EASE}, box-shadow ${DURATION}ms ${EASE}`,
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            boxShadow: current ? "0 26px 60px rgba(0,0,0,0.6)" : "0 10px 26px rgba(0,0,0,0.4)",
          };
          const cls = "absolute left-1/2 top-0 block cursor-pointer";

          // One stable element type per card: swapping div <-> Link when a card
          // became current remounted it and killed its transition, which is what
          // made the change look abrupt. Only the centred card navigates.
          return (
            <div
              key={slide.id}
              role="button"
              tabIndex={visible ? 0 : -1}
              aria-label={current && href ? `${slide.title} — ${slide.ctaLabel || "Try"}` : slide.title}
              className={cls}
              style={style}
              onClick={() => {
                if (dragged.current) return;
                if (current && href) router.push(href);
                else if (!current) setIndex(idx);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                if (current && href) router.push(href);
                else if (!current) setIndex(idx);
              }}
            >
              {card}
            </div>
          );
        })}

        {n > 1 && (
          <>
            <button
              onClick={() => step(-1)}
              aria-label="Previous slide"
              className="absolute left-[34px] top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.14] bg-black/50 text-base leading-none text-white hover:bg-black/80"
            >
              ‹
            </button>
            <button
              onClick={() => step(1)}
              aria-label="Next slide"
              className="absolute right-[34px] top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.14] bg-black/50 text-base leading-none text-white hover:bg-black/80"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
