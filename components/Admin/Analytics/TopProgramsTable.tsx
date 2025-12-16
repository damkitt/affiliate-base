import Link from "next/link";
import { DashboardStats } from "@/lib/analytics";

interface TopProgramsTableProps {
    data?: DashboardStats;
    isLoading: boolean;
}

export function TopProgramsTable({ data, isLoading }: TopProgramsTableProps) {
    return (
        <div className="space-y-8">
            {/* Click Breakdown */}
            <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                    Outbound Clicks by Program
                </h2>
                <div className="space-y-2">
                    {isLoading ? (
                        <div className="text-white/30 text-sm py-4 text-center">
                            Loading...
                        </div>
                    ) : data?.clickBreakdown?.length === 0 ? (
                        <div className="text-white/30 text-sm py-4 text-center">
                            No clicks yet
                        </div>
                    ) : (
                        data?.clickBreakdown?.map((item, i) => (
                            <div
                                key={item.programId}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-white/20 text-xs tabular-nums w-4">
                                        {i + 1}
                                    </span>
                                    <span className="font-medium text-sm">
                                        {item.programName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {item.slug && (
                                        <Link
                                            href={`/programs/${item.slug}`}
                                            className="text-xs text-white/30 hover:text-white transition-colors"
                                        >
                                            View →
                                        </Link>
                                    )}
                                    <span className="tabular-nums text-sm font-medium">
                                        {item.clicks.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Top Programs Table */}
            <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                    Top Programs
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-white/30 text-xs uppercase tracking-wider">
                                <th className="pb-3 font-medium">#</th>
                                <th className="pb-3 font-medium">Program</th>
                                <th className="pb-3 font-medium text-right">Views</th>
                                <th className="pb-3 font-medium text-right">Clicks</th>
                                <th className="pb-3 font-medium text-right">CTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-white/30">
                                        Loading...
                                    </td>
                                </tr>
                            ) : data?.topPrograms?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-white/30">
                                        No data yet
                                    </td>
                                </tr>
                            ) : (
                                data?.topPrograms?.map((program, i) => (
                                    <tr
                                        key={program.id}
                                        className="border-b border-white/5 last:border-0"
                                    >
                                        <td className="py-3 text-white/20 tabular-nums">
                                            {i + 1}
                                        </td>
                                        <td className="py-3">
                                            {program.slug ? (
                                                <Link
                                                    href={`/programs/${program.slug}`}
                                                    className="hover:text-white/80 transition-colors"
                                                >
                                                    {program.name}
                                                </Link>
                                            ) : (
                                                program.name
                                            )}
                                        </td>
                                        <td className="py-3 text-right tabular-nums text-white/70">
                                            {program.views.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right tabular-nums text-white/70">
                                            {program.clicks.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right tabular-nums">
                                            {program.ctr}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
