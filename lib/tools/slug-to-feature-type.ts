/**
 * GET /landing/tools returns a `slug` per tool (e.g. "creative_shots"), but
 * GET /tools/{feature_type}/schema and POST /generate expect a different
 * string (e.g. "creative_photoshoot") — confirmed mismatched for at least
 * 3 of the 4 live tools by comparing the catalog against the documented
 * feature types. This mapping is inferred from name/description overlap,
 * NOT confirmed by backend — ask them to add a `featureType` field to
 * GET /landing/tools and delete this file once they do.
 */
export const SLUG_TO_FEATURE_TYPE: Record<string, string> = {
  catalog_shots: "listing_photoshoot",
  creative_shots: "creative_photoshoot",
  on_model_shots: "model_shoot",
};

export function resolveFeatureType(slug: string): string {
  return SLUG_TO_FEATURE_TYPE[slug] ?? slug;
}
