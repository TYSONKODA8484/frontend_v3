import { getTools } from "@/lib/api/tools";
import { ToolGenerateClient } from "@/components/studio/generate/ToolGenerateClient";

export default async function ToolGeneratePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { tools } = await getTools();
  // The URL is the featureType — the real access gate, not just what the grid hides.
  const tool = tools.find((t) => t.featureType === slug);
  const isLive = tool?.status === "live";

  return <ToolGenerateClient featureType={slug} isLive={isLive} />;
}
