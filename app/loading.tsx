import { LeaderboardSkeleton } from "@/components/skeletons/LeaderboardSkeleton";


export default function Loading() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-background">
            {/* Minimal Background Glow to match WhoopHero */}
            <div
                className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[100vw] h-[70vh] opacity-20 dark:opacity-30 blur-[100px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(0,240,160,0.3) 0%, rgba(0,240,160,0.05) 50%, transparent 80%)"
                }}
            />

            {/* Content wrapper with relative z-index to sit on top */}
            <div className="relative z-10">
                <div className="pt-32 px-6 mb-12 max-w-[700px] mx-auto">
                    {/* Header Skeleton */}
                    <div className="space-y-4">
                        <div className="h-12 w-3/4 bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
                        <div className="h-4 w-1/2 bg-[var(--bg-elevated)] rounded animate-pulse" />
                    </div>
                </div>

                <LeaderboardSkeleton />
            </div>
        </div>
    );
}
