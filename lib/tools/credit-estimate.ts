import type { ToolSchema } from "@/lib/types/generate";
import { optionCreditCost, optionValue } from "@/lib/types/generate";

// creative_photoshoot's cost isn't in its schema — it's this fixed multiplier
// table, confirmed directly by the backend team (app/tools/creative_photoshoot.py).
const CREATIVE_PHOTOSHOOT_QUALITY_MULTIPLIER: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 5,
  xhigh: 9,
  max: 16,
};
const CREATIVE_PHOTOSHOOT_RESOLUTION_MULTIPLIER: Record<string, number> = {
  "1k": 2,
  "2k": 4,
  "4k": 6,
};

/** Returns credits-per-image for the current field values, or null if it can't be determined. */
export function estimateCreditsPerImage(
  featureType: string,
  schema: ToolSchema,
  values: Record<string, string>,
): number | null {
  if (featureType === "creative_photoshoot") {
    const quality = CREATIVE_PHOTOSHOOT_QUALITY_MULTIPLIER[values.quality];
    const resolution = CREATIVE_PHOTOSHOOT_RESOLUTION_MULTIPLIER[values.resolution];
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
