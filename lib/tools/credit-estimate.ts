import type { ToolSchema } from "@/lib/types/generate";
import { optionCreditCost, optionValue } from "@/lib/types/generate";

// creative_photoshoot and listing_photoshoot share this fixed multiplier
// table — neither has it in their schema, confirmed directly by the backend
// team. listing_photoshoot applies it per-shot, then the caller multiplies
// by output_count for the batch total (e.g. max × 4k × 8 shots = 768).
const QUALITY_RESOLUTION_MULTIPLIER_TOOLS = new Set(["creative_photoshoot", "listing_photoshoot"]);
const QUALITY_MULTIPLIER: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 5,
  xhigh: 9,
  max: 16,
};
const RESOLUTION_MULTIPLIER: Record<string, number> = {
  "1k": 2,
  "2k": 4,
  "4k": 6,
};

/** True for tools whose per-image price is quality × resolution multipliers. */
export const usesQualityPricing = (featureType: string) => QUALITY_RESOLUTION_MULTIPLIER_TOOLS.has(featureType);

/** Credits per image for one quality at a resolution, or null if either is unknown. */
export function creditsForQuality(quality: string, resolution: string): number | null {
  const q = QUALITY_MULTIPLIER[quality];
  const r = RESOLUTION_MULTIPLIER[resolution];
  return q && r ? q * r : null;
}

/** How much a resolution costs relative to the cheapest one offered (1K = 1x). */
export function resolutionMultipliers(values: string[]): Record<string, number> {
  const known = values.map((v) => RESOLUTION_MULTIPLIER[v]).filter((m): m is number => m != null);
  const base = Math.min(...known);
  const out: Record<string, number> = {};
  for (const v of values) if (RESOLUTION_MULTIPLIER[v] != null) out[v] = RESOLUTION_MULTIPLIER[v] / base;
  return out;
}

/** Returns credits-per-image for the current field values, or null if it can't be determined. */
export function estimateCreditsPerImage(
  featureType: string,
  schema: ToolSchema,
  values: Record<string, string>,
): number | null {
  if (QUALITY_RESOLUTION_MULTIPLIER_TOOLS.has(featureType)) {
    const quality = QUALITY_MULTIPLIER[values.quality];
    const resolution = RESOLUTION_MULTIPLIER[values.resolution];
    return quality && resolution ? quality * resolution : null;
  }

  // Generic path: a select field whose chosen option carries a credit_cost
  // (e.g. recolor's resolution field).
  for (const field of schema.paramSchema) {
    if (field.type !== "select" || !field.options) continue;
    const chosen = values[field.name];
    if (chosen == null) continue;
    for (const opt of field.options) {
      if (optionValue(opt) === chosen) {
        const cost = optionCreditCost(opt);
        if (typeof cost === "number") return cost;
      }
    }
  }
  return null;
}

/** True if this tool has no field that could ever change its per-image cost
 * (e.g. model_shoot_generate_model, which is hardcoded low-quality server-side) —
 * lets the UI show "fixed cost, shown after generation" instead of implying
 * there's a selection above that affects price. */
export function hasNoCostVaryingFields(featureType: string, schema: ToolSchema): boolean {
  if (QUALITY_RESOLUTION_MULTIPLIER_TOOLS.has(featureType)) return false;
  return !schema.paramSchema.some(
    (f) => f.type === "select" && f.options?.some((o) => optionCreditCost(o) != null),
  );
}
