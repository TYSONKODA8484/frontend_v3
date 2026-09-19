import { getTools } from "@/lib/api/tools";
import { getHomepageSlides } from "@/lib/api/homepage-slides";
import { HomepageCarousel } from "@/components/studio/home/HomepageCarousel";
import { HomeTools } from "@/components/studio/home/HomeTools";
import { RecentWork } from "@/components/studio/home/RecentWork";

export default async function StudioHome() {
  const [{ tools }, { slides }] = await Promise.all([getTools(), getHomepageSlides()]);

  return (
    <div className="flex flex-col">
      <HomepageCarousel slides={slides} />
      <HomeTools tools={tools} />
      <RecentWork />
    </div>
  );
}
