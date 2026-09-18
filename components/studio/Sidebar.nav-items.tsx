import { Home, LayoutGrid, FolderKanban, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StudioNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const studioNavItems: StudioNavItem[] = [
  { id: "home", label: "Home", href: "/studio", icon: Home },
  { id: "tools", label: "Tools", href: "/studio/tools", icon: LayoutGrid },
  { id: "library", label: "Library", href: "/studio/library", icon: FolderKanban },
  { id: "settings", label: "Settings", href: "/studio/settings", icon: Settings },
];
