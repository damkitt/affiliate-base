import Image from "next/image";
import { DashboardStats } from "@/lib/analytics";

interface ReferrerTableProps {
    data?: DashboardStats;
    isLoading: boolean;
}

export function ReferrerTable({ data, isLoading }: ReferrerTableProps) {
    return (
        <div className="space-y-8">
            {/* Referrer CTR */}
            <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                    Source Quality (Referrer CTR)
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-white/30 text-xs uppercase tracking-wider">
                                <th className="pb-3 font-medium">Source</th>
                                <th className="pb-3 font-medium text-right">Visitors</th>
                                <th className="pb-3 font-medium text-right">Clicks</th>
                                <th className="pb-3 font-medium text-right">CTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-white/30">
                                        Loading...
                                    </td>
                                </tr>
                            ) : data?.referrerCTR?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-white/30">
                                        No data yet
                                    </td>
                                </tr>
                            ) : (
                                data?.referrerCTR?.map((ref, i) => (
                                    <tr key={i} className="border-b border-white/5 last:border-0">
                                        <td className="py-3 flex items-center gap-2">
                                            {/* Favicon */}
                                            <div className="w-4 h-4 relative flex-shrink-0 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                                                {ref.domain ? (
                                                    <Image
                                                        src={`https://www.google.com/s2/favicons?domain=${ref.domain}&sz=64`}
                                                        alt={ref.source}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span className="text-[8px] text-white/40">#</span>
                                                )}
                                            </div>
                                            <span className="truncate">{ref.source}</span>
                                        </td>
                                        <td className="py-3 text-right tabular-nums text-white/70">
                                            {ref.visitors.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right tabular-nums text-white/70">
                                            {ref.clicks.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right tabular-nums">
                                            <span className={ref.ctr >= 10 ? "text-white font-medium" : ref.ctr >= 5 ? "text-white/80" : ""}>
                                                {ref.ctr}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Geo Stats */}
            {data?.geoReferrerStats && data.geoReferrerStats.length > 0 && (
                <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                    <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                        Traffic by Country
                    </h2>
                    <div className="space-y-2">
                        {data.geoReferrerStats.map((stat, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <span className="text-sm">{stat.country}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-white/30">
                                        via {stat.topSource}
                                    </span>
                                    <span className="tabular-nums text-sm">
                                        {stat.users.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
