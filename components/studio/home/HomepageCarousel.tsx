"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageSlide } from "@/lib/types/homepage-slide";

const AUTO_ADVANCE_MS = 6000;

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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (sorted.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % sorted.length), AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [sorted.length]);

  // Valid, expected state — no slides currently scheduled/active. Hide the
  // section entirely rather than rendering a broken empty slider.
  if (sorted.length === 0) return null;

  const slide = sorted[index % sorted.length];
  const href = slideHref(slide);

  function go(delta: number) {
    setIndex((i) => (i + delta + sorted.length) % sorted.length);
  }

  const card = (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- backend-supplied CDN URL, not on next.config's allowed image hosts */}
      <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
          {slide.subtitle && <p className="mt-1 text-sm text-white/80">{slide.subtitle}</p>}
        </div>
        {href && (
          <span className="flex-none rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
            {slide.ctaLabel}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-11 pt-7">
      <div className="relative">
        {href ? <Link href={href}>{card}</Link> : card}

        {sorted.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
