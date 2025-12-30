import Image from "next/image";
import { DashboardStats } from "@/lib/analytics";

interface TopSourcesWidgetProps {
    data?: DashboardStats;
    isLoading: boolean;
}

export function TopSourcesWidget({ data, isLoading }: TopSourcesWidgetProps) {
    if (isLoading && !data) {
        return (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 h-[300px] animate-pulse" />
        );
    }

    const totalVisitors = data?.uniqueVisitors || 0;
    const topReferrers = data?.referrerCTR?.slice(0, 5) || [];

    return (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Top Traffic Sources</h3>
            <div className="space-y-5">
                {topReferrers.map((ref, i) => {
                    const percentage = totalVisitors > 0 ? Math.round((ref.visitors / totalVisitors) * 100) : 0;
                    return (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 relative flex-shrink-0 rounded-md overflow-hidden bg-white/5 flex items-center justify-center border border-white/10">
                                        {ref.domain ? (
                                            <Image
                                                src={`https://www.google.com/s2/favicons?domain=${ref.domain}&sz=64`}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <span className="text-[10px] opacity-40">#</span>
                                        )}
                                    </div>
                                    <span className="font-medium text-white/80">{ref.source}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-white/40">{ref.visitors.toLocaleString()} visits</span>
                                    <span className="font-bold text-white">{percentage}%</span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500/50 to-blue-500 transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}

                {topReferrers.length === 0 && (
                    <div className="h-40 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-white/20 text-xs uppercase tracking-widest font-bold">No Referrer Data</p>
                    </div>
                )}
            </div>
        </div>
    );
}
