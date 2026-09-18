import { getTools } from "@/lib/api/tools";
import { HomeTools } from "@/components/studio/home/HomeTools";
import { RecentWork } from "@/components/studio/home/RecentWork";

export default async function StudioHome() {
  const { tools } = await getTools();

  return (
    <div className="flex flex-col">
      <HomeTools tools={tools} />
      <RecentWork />
    </div>
  );
}
