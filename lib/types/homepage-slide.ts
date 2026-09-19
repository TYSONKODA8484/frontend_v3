// deeplink.feature_type is deliberately snake_case, matching the backend's
// exact response shape — not run through any camelCase transform, unlike
// the slide's own top-level fields.
export type HomepageSlideDeeplink =
  | { type: "tool"; feature_type: string }
  | { type: string; [key: string]: unknown };

export type HomepageSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  ctaLabel: string;
  deeplink: HomepageSlideDeeplink;
  sortOrder: number;
};

export type HomepageSlidesResponse = {
  slides: HomepageSlide[];
};
