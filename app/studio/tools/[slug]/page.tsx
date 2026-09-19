import { getTools } from "@/lib/api/tools";
import { resolveFeatureType } from "@/lib/tools/slug-to-feature-type";
import { ToolGenerateClient } from "@/components/studio/generate/ToolGenerateClient";

export default async function ToolGeneratePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { tools } = await getTools();
  // The URL is the feature_type (see resolveFeatureType), while the catalog
  // keys tools by slug — match through the same resolver used to build the
  // links, so this is the real access gate, not just what the grid hides.
  const tool = tools.find((t) => resolveFeatureType(t.slug) === slug);
  const isLive = tool?.status === "live";

  return <ToolGenerateClient featureType={slug} isLive={isLive} />;
}
