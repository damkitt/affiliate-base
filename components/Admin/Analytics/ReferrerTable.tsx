import Image from "next/image";
import { DashboardStats, getCountryFlag } from "@/lib/analytics";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

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
                                    <tr key={i} className="border-b border-white/5 last:border-0 group">
                                        <td className="py-3">
                                            {ref.domain ? (
                                                <a
                                                    href={`https://${ref.domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 hover:text-white transition-colors group/link"
                                                >
                                                    {/* Favicon */}
                                                    <div className="w-5 h-5 relative flex-shrink-0 rounded-md overflow-hidden bg-white/5 flex items-center justify-center border border-white/10 group-hover/link:border-white/20">
                                                        <Image
                                                            src={`https://www.google.com/s2/favicons?domain=${ref.domain}&sz=64`}
                                                            alt={ref.source}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <span className="truncate font-medium">{ref.source}</span>
                                                    <HiArrowTopRightOnSquare className="w-3 h-3 opacity-0 group-hover/link:opacity-50 transition-opacity" />
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 text-white/40">
                                                    <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                                                        <span className="text-[10px]">#</span>
                                                    </div>
                                                    <span className="font-medium">{ref.source}</span>
                                                </div>
                                            )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                        {data.geoReferrerStats.map((stat, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg leading-none" title={stat.code}>
                                        {getCountryFlag(stat.code)}
                                    </span>
                                    <span className="text-sm font-medium text-white/80">{stat.country}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-white/20 font-mono uppercase tracking-tighter">
                                        {stat.topSource}
                                    </span>
                                    <span className="tabular-nums text-sm font-bold text-white/90">
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
