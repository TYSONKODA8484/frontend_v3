import type { Tool } from "@/lib/types/tool";

/**
 * Tools shown with a SOON badge on the landing page while they aren't in the
 * backend catalog yet (GET /landing/tools only returns rows that exist).
 * When a tool with the same featureType appears in the API, the API's version
 * wins and this entry is ignored — so add real tools in the database and they
 * take over automatically. The studio never shows these; it lists live tools
 * only. Edit this list to change what the landing page teases.
 */
const soon = (
  featureType: string,
  displayName: string,
  description: string,
  icon: string,
  category: string,
  cardSortOrder: number,
): Tool => ({
  featureType,
  displayName,
  description,
  icon,
  category,
  cardSortOrder,
  isComingSoon: true,
  status: "soon",
});

export const comingSoonTools: Tool[] = [
  soon("magic_erase", "Magic Erase", "Remove anything cleanly", "eraser", "finish", 1),
  soon("inpaint", "Inpaint", "Paint an area, describe the fix", "brush", "finish", 2),
  soon("relight_shadows", "Relight & Shadows", "Match light, add contact shadow", "sun", "finish", 3),
  soon("upscale_4k", "Upscale 4K", "Detail restore for print", "expand", "finish", 4),
  soon("resize_outpaint", "Resize & Outpaint", "Extend scenes to any ratio", "crop", "finish", 5),
  soon("flat_lay_angles", "Flat Lay / Angles", "Consistent multi-angle sets", "grid", "finish", 6),
  soon("product_motion", "Product Motion", "Still to clip, camera presets", "clapperboard", "video", 1),
  soon("effect_templates", "Effect Templates", "Pour, unbox, reveal, hold", "wand", "video", 2),
  soon("ugc_avatar_ads", "UGC Avatar Ads", "Script, actor, voice, captions", "user", "video", 3),
  soon("batch_studio", "Batch Studio", "One preset across 250 assets", "layers", "scale", 1),
  soon("brand_kit", "Brand Kit", "Marks, palette, type, scenes", "palette", "scale", 2),
  soon("library", "Library", "Projects, folders, version history", "folder", "scale", 3),
];

/** Live catalog from the API, plus the teased tools it doesn't have yet. */
export function withComingSoon(apiTools: Tool[]): Tool[] {
  const have = new Set(apiTools.map((t) => t.featureType));
  return [...apiTools, ...comingSoonTools.filter((t) => !have.has(t.featureType))];
}
