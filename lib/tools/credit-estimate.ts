import type { ToolSchema } from "@/lib/types/generate";
import { optionCreditCost, optionValue } from "@/lib/types/generate";

// creative_photoshoot and listing_photoshoot share this fixed multiplier
// table — neither has it in their schema, confirmed directly by the backend
// team (app/tools/creative_photoshoot.py; listing_photoshoot uses the same
// tables per-shot before multiplying by output_count).
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
