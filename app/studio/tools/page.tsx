import { getTools } from "@/lib/api/tools";
import { isLive } from "@/lib/types/tool";
import { ToolsGrid } from "@/components/studio/tools/ToolsGrid";

export default async function StudioTools() {
  const { tools } = await getTools();
  // "Coming soon" tools are marketing: they belong on the landing page only.
  // The studio lists just the tools that actually work.
  return <ToolsGrid tools={tools.filter(isLive)} />;
}
