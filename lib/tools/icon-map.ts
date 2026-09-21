import {
  Camera,
  ImageIcon,
  Shirt,
  UserRound,
  Eraser,
  Pencil,
  Brush,
  Sun,
  Maximize,
  Expand,
  Crop,
  LayoutGrid,
  Layers,
  Palette,
  Folder,
  Clapperboard,
  Wand2,
  Sparkles,
  SwatchBook,
  type LucideIcon,
} from "lucide-react";
import type { Tool } from "@/lib/types/tool";

// Backend-provided icon slugs (GET /landing/tools .icon), confirmed for the
// finish-category tools — preferred over the keyword guess below whenever present.
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  camera: Camera,
  image: ImageIcon,
  shirt: Shirt,
  user: UserRound,
  eraser: Eraser,
  pencil: Pencil,
  brush: Brush,
  sun: Sun,
  crop: Crop,
  expand: Expand,
  grid: LayoutGrid,
  layers: Layers,
  palette: Palette,
  swatch: SwatchBook,
  folder: Folder,
  clapperboard: Clapperboard,
  wand: Wand2,
  sparkles: Sparkles,
};

const ICON_BY_KEYWORD: [string, LucideIcon][] = [
  ["photoshoot", Camera],
  ["background", ImageIcon],
  ["mockup", Shirt],
  ["model", UserRound],
  ["erase", Eraser],
  ["inpaint", Brush],
  ["relight", Sun],
  ["upscale", Maximize],
  ["resize", Crop],
  ["outpaint", Crop],
  ["angle", LayoutGrid],
  ["flat lay", LayoutGrid],
  ["motion", Clapperboard],
  ["effect", Wand2],
  ["ugc", Clapperboard],
  ["avatar", UserRound],
  ["batch", Layers],
  ["brand", Palette],
  ["library", Folder],
];

export function iconForTool(tool: Tool): LucideIcon {
  if (tool.icon && ICON_BY_SLUG[tool.icon]) return ICON_BY_SLUG[tool.icon];
  const haystack = `${tool.displayName} ${tool.category}`.toLowerCase();
  const match = ICON_BY_KEYWORD.find(([keyword]) => haystack.includes(keyword));
  return match ? match[1] : Sparkles;
}
