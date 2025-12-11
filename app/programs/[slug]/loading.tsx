
import { NavBar } from "@/components/NavBar";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <NavBar showBackButton />
            <div className="h-14" /> {/* Spacer */}

            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Card Skeleton */}
                        <div className="card-solid p-10 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-[var(--bg-secondary)]" />
                                <div className="space-y-3 flex-1">
                                    <div className="h-8 w-1/3 bg-[var(--bg-secondary)] rounded-lg" />
                                    <div className="h-4 w-2/3 bg-[var(--bg-secondary)] rounded" />
                                </div>
                            </div>
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--bg-secondary)]/30 to-transparent" />
                        </div>

                        {/* Content Skeleton */}
                        <div className="card-solid h-64 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--bg-secondary)]/30 to-transparent" />
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="card-solid h-96 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--bg-secondary)]/30 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
