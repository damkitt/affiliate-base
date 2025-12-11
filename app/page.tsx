import { getLeaderboardPrograms } from "@/lib/data-fetching";
import HomeContent from "@/components/HomeContent";

// Revalidate every 60 seconds (or stick to cache tags in data-fetching)
export const revalidate = 60;

export default async function Home() {
  const initialPrograms = await getLeaderboardPrograms();
  const serializedPrograms = JSON.parse(JSON.stringify(initialPrograms));

  return <HomeContent initialPrograms={serializedPrograms} />;
}