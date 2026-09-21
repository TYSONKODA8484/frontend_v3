import type { HomepageSlidesResponse } from "@/lib/types/homepage-slide";
import { API_URL } from "@/lib/api/base-url";

export async function getHomepageSlides(): Promise<HomepageSlidesResponse> {
  try {
    // Public, unauthenticated, schedule-driven — the backend sets its own
    // Cache-Control (s-maxage=60) since a slide can be time-boxed to a
    // promo window. Matching that window here rather than the longer one
    // used for the mostly-static tools/billing catalogs.
    const res = await fetch(`${API_URL}/landing/homepage-slides`, { next: { revalidate: 60 } });
    if (!res.ok) return { slides: [] };
    return (await res.json()) as HomepageSlidesResponse;
  } catch {
    return { slides: [] };
  }
}
