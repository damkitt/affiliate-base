import { FunnelData, FeaturedProgram, DashboardStats } from "@/lib/analytics";

interface FunnelSectionProps {
    data?: DashboardStats;
    programFunnel?: FunnelData;
    isLoading: boolean;
    selectedProgram: string;
    onProgramChange: (id: string) => void;
}

export function FunnelSection({ data, programFunnel, isLoading, selectedProgram, onProgramChange }: FunnelSectionProps) {
    return (
        <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs text-white/40 uppercase tracking-wider">
                    Conversion Funnel
                </h2>
                <select
                    value={selectedProgram}
                    onChange={(e) => onProgramChange(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                >
                    <option value="global" className="bg-black">Global Overview</option>
                    {data?.featuredPrograms?.map((program) => (
                        <option key={program.id} value={program.id} className="bg-black">
                            {program.name}
                        </option>
                    ))}
                </select>
            </div>

            {(() => {
                const funnel = selectedProgram === "global" ? data?.funnel : programFunnel;
                if (!funnel?.steps || funnel.steps.length < 3) {
                    return (
                        <div className="text-white/30 text-sm py-8 text-center">
                            {isLoading ? "Loading..." : "No funnel data"}
                        </div>
                    );
                }

                const [step1, step2, step3] = funnel.steps;
                const maxVal = Math.max(step1.value, step2.value, step3.value) || 1;

                // Heights proportional to values (max 85% of container)
                const h1 = (step1.value / maxVal) * 85;
                const h2 = (step2.value / maxVal) * 85;
                const h3 = (step3.value / maxVal) * 85;

                return (
                    <div className="space-y-4">
                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-xs text-white/40 uppercase tracking-wide mb-1">{step1.name}</div>
                                <div className="text-2xl font-light tabular-nums">{step1.value.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-white/40 uppercase tracking-wide mb-1">{step2.name}</div>
                                <div className="text-2xl font-bold tabular-nums text-white/90">{step2.value.toLocaleString()}</div>
                                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">{step2.conversion}% conversion</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-white/40 uppercase tracking-wide mb-1">{step3.name}</div>
                                <div className="text-2xl font-bold tabular-nums text-white/90">{step3.value.toLocaleString()}</div>
                                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">{step3.conversion}% CTR</div>
                            </div>
                        </div>

                        {/* Bar Chart with smooth connections */}
                        <div className="relative h-32">
                            <svg
                                viewBox="0 0 300 100"
                                className="w-full h-full"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
                                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
                                    </linearGradient>
                                    <linearGradient id="connectorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.15)" />
                                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
                                    </linearGradient>
                                </defs>

                                {/* Bar 1 */}
                                <rect
                                    x="0"
                                    y={100 - h1}
                                    width="80"
                                    height={h1}
                                    fill="url(#barGradient)"
                                    className="transition-all duration-500"
                                />

                                {/* Smooth connector 1->2 */}
                                <path
                                    d={`
                                        M 80,${100 - h1}
                                        C 95,${100 - h1} 105,${100 - h2} 120,${100 - h2}
                                        L 120,100
                                        L 80,100
                                        Z
                                    `}
                                    fill="url(#connectorGradient)"
                                    className="transition-all duration-500"
                                />

                                {/* Bar 2 */}
                                <rect
                                    x="120"
                                    y={100 - h2}
                                    width="60"
                                    height={h2}
                                    fill="url(#barGradient)"
                                    className="transition-all duration-500"
                                />

                                {/* Smooth connector 2->3 */}
                                <path
                                    d={`
                                        M 180,${100 - h2}
                                        C 195,${100 - h2} 205,${100 - h3} 220,${100 - h3}
                                        L 220,100
                                        L 180,100
                                        Z
                                    `}
                                    fill="url(#connectorGradient)"
                                    className="transition-all duration-500"
                                />

                                {/* Bar 3 */}
                                <rect
                                    x="220"
                                    y={100 - h3}
                                    width="80"
                                    height={h3}
                                    fill="url(#barGradient)"
                                    className="transition-all duration-500"
                                />
                            </svg>
                        </div>

                        {/* Overall conversion */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs text-white/40">Overall Conversion</span>
                            <span className="text-sm font-medium tabular-nums">
                                {step1.value > 0
                                    ? ((step3.value / step1.value) * 100).toFixed(2)
                                    : 0}%
                            </span>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
