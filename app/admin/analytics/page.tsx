"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnalyticsProvider, useAnalytics } from "@/components/Admin/Analytics/AnalyticsProvider";

// Components
import { StatsCards } from "@/components/Admin/Analytics/StatsCards";
import { TrafficChart } from "@/components/Admin/Analytics/TrafficChart";
import { FunnelSection } from "@/components/Admin/Analytics/FunnelSection";
import { TopProgramsTable } from "@/components/Admin/Analytics/TopProgramsTable";
import { SearchAnalytics } from "@/components/Admin/Analytics/SearchAnalytics";
import { ReferrerTable } from "@/components/Admin/Analytics/ReferrerTable";
import { NewProgramsDetail } from "@/components/Admin/Analytics/NewProgramsDetail";
import { DeviceOSSection } from "@/components/Admin/Analytics/DeviceOSSection";

function DashboardContent() {
    // Consume data and state from the Single Source of Truth Provider
    const {
        data,
        programFunnel,
        isLoading,
        isError,
        range,
        setRange,
        selectedProgram,
        setSelectedProgram
    } = useAnalytics();

    if (isError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-500 font-medium">Failed to load analytics data.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm text-white transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Remove green gradient on this page (UI effect)
    useEffect(() => {
        document.body.classList.add("no-spotlight");
        return () => {
            document.body.classList.remove("no-spotlight");
        };
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header - Always visible to prevent layout shift */}
            <header className="border-b border-white/10 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/admin"
                            className="text-white/50 hover:text-white transition-colors text-sm"
                        >
                            ← Admin
                        </Link>
                        <h1 className="text-lg font-medium tracking-tight">Analytics</h1>
                    </div>
                    {/* Time Range Tabs */}
                    <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-md border border-white/10">
                        {(["24h", "7d", "30d"] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                disabled={isLoading && !data} // Disable while initial loading
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${range === r
                                    ? "bg-white text-black"
                                    : "text-white/50 hover:text-white"
                                    } ${isLoading && !data ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Unified Loading State */}
                {isLoading && !data ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white/40 text-xs tracking-widest uppercase font-medium">Loading Dashboard...</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* DB Health Warning */}
                        {data?.health?.dbSizeWarning && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-yellow-500">⚠️</div>
                                    <div>
                                        <h3 className="text-yellow-500 font-medium text-sm">High Traffic Volume</h3>
                                        <p className="text-white/60 text-xs">
                                            Traffic logs have exceeded 50,000 records ({data.health.dbRows.toLocaleString()}). Performance may degrade.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Row 1: KPI Cards */}
                        <StatsCards data={data} isLoading={isLoading} />

                        {/* Row 2: New Programs Detail */}
                        <NewProgramsDetail data={data} isLoading={isLoading} range={range} />

                        {/* Row 3: Traffic Chart */}
                        <TrafficChart data={data} isLoading={isLoading} range={range} />

                        {/* Row 3: Conversion Funnel */}
                        <FunnelSection
                            data={data}
                            programFunnel={programFunnel}
                            isLoading={isLoading}
                            selectedProgram={selectedProgram}
                            onProgramChange={setSelectedProgram}
                        />

                        {/* Row 4: Programs & Clicks */}
                        <TopProgramsTable data={data} isLoading={isLoading} />

                        {/* Row 5: Search & Categories */}
                        <SearchAnalytics data={data} isLoading={isLoading} />

                        {/* Row 6: Sources & Geo */}
                        <ReferrerTable data={data} isLoading={isLoading} />

                        {/* Row 7: Devices & OS */}
                        <DeviceOSSection data={data} isLoading={isLoading} />
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <AnalyticsProvider>
            <DashboardContent />
        </AnalyticsProvider>
    );
}
