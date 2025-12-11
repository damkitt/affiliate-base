export function LeaderboardSkeleton() {
    return (
        <div className="max-w-[800px] mx-auto px-6 pb-20 mt-10">
            <div className="space-y-3">
                {/* Featured Skeleton - Just one to represent loading state */}
                <div className="relative h-[72px] w-full bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--bg-secondary)]/50 to-transparent" />
                </div>

                {/* Regular List Skeletons */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="relative h-[72px] w-full bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="flex items-center gap-4 p-3 h-full">
                            {/* Rank */}
                            <div className="w-8 h-8 rounded-md bg-[var(--bg-secondary)]" />
                            {/* Logo */}
                            <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)]" />
                            {/* Text */}
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-[var(--bg-secondary)] rounded" />
                                <div className="h-3 w-1/2 bg-[var(--bg-secondary)] rounded" />
                            </div>
                            {/* Commission */}
                            <div className="w-16 h-6 rounded-lg bg-[var(--bg-secondary)]" />
                        </div>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--bg-secondary)]/50 to-transparent" />
                    </div>
                ))}
            </div>
        </div>
    );
}
