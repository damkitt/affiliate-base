import { LeaderboardSkeleton } from "@/components/skeletons/LeaderboardSkeleton";


export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Use a static shell to maintain layout stability during load */}
            {/* Note: We can't use complex client components here easily, so we mimic structure */}
            <div className="pt-32 px-6 mb-12 max-w-[700px] mx-auto">
                {/* Header Skeleton */}
                <div className="space-y-4">
                    <div className="h-12 w-3/4 bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
                    <div className="h-4 w-1/2 bg-[var(--bg-elevated)] rounded animate-pulse" />
                </div>
            </div>

            <LeaderboardSkeleton />
        </div>
    );
}
