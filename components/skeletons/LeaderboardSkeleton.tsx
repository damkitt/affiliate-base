export function LeaderboardSkeleton() {
    return (
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 mt-10">
            <div className="border border-zinc-200/60 dark:border-white/[0.1] rounded-2xl bg-white dark:bg-[#0A0A0A] overflow-hidden">
                {/* Table Header Skeleton */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02]">
                    <div className="col-span-1 flex justify-center"><div className="w-4 h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" /></div>
                    <div className="col-span-6 md:col-span-5"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" /></div>
                    <div className="col-span-3 hidden md:block"><div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" /></div>
                    <div className="col-span-3 md:col-span-2"><div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" /></div>
                    <div className="col-span-2 md:col-span-1"></div>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 px-6 py-5 items-center relative overflow-hidden">
                            <div className="col-span-1 flex justify-center">
                                <div className="w-4 h-4 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                            </div>
                            <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                                    <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="col-span-3 hidden md:block">
                                <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse" />
                            </div>
                            <div className="col-span-3 md:col-span-2">
                                <div className="h-8 w-20 bg-emerald-500/5 rounded-full animate-pulse" />
                            </div>
                            <div className="col-span-2 md:col-span-1 flex justify-end">
                                <div className="w-5 h-5 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
