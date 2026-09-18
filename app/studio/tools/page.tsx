import { getTools } from "@/lib/api/tools";
import { ToolsGrid } from "@/components/studio/tools/ToolsGrid";

export default async function StudioTools() {
  const { tools } = await getTools();
  return <ToolsGrid tools={tools} />;
}
