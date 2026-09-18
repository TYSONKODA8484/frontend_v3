import {
  Camera,
  ImageIcon,
  Shirt,
  UserRound,
  Eraser,
  Brush,
  Sun,
  Maximize,
  Crop,
  LayoutGrid,
  Layers,
  Palette,
  Folder,
  Clapperboard,
  Wand2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Tool } from "@/lib/types/tool";

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
  const haystack = `${tool.name} ${tool.category}`.toLowerCase();
  const match = ICON_BY_KEYWORD.find(([keyword]) => haystack.includes(keyword));
  return match ? match[1] : Sparkles;
}
