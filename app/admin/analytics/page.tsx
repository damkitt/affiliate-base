"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import type { DashboardStats, FunnelData } from "@/lib/analytics";

// Components
import { StatsCards } from "@/components/Admin/Analytics/StatsCards";
import { TrafficChart } from "@/components/Admin/Analytics/TrafficChart";
import { FunnelSection } from "@/components/Admin/Analytics/FunnelSection";
import { TopProgramsTable } from "@/components/Admin/Analytics/TopProgramsTable";
import { SearchAnalytics } from "@/components/Admin/Analytics/SearchAnalytics";
import { ReferrerTable } from "@/components/Admin/Analytics/ReferrerTable";
import { NewProgramsDetail } from "@/components/Admin/Analytics/NewProgramsDetail";

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json());

type TimeRange = "24h" | "7d" | "30d";

export default function AnalyticsPage() {
    const [range, setRange] = useState<TimeRange>("7d");
    const [selectedProgram, setSelectedProgram] = useState<string>("global");

    // Remove green gradient on this page
    useEffect(() => {
        document.body.classList.add("no-spotlight");
        return () => {
            document.body.classList.remove("no-spotlight");
        };
    }, []);

    const { data, error, isLoading } = useSWR<DashboardStats>(
        `/api/admin/analytics?range=${range}`,
        fetcher,
        { refreshInterval: 30000 }
    );

    // Fetch program-specific funnel when a program is selected
    const { data: programFunnel } = useSWR<FunnelData>(
        selectedProgram !== "global" ? `/api/admin/analytics/funnel?programId=${selectedProgram}&range=${range}` : null,
        fetcher
    );

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
                <p className="text-red-400">Failed to load analytics</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header */}
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
                        {(["24h", "7d", "30d"] as TimeRange[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${range === r
                                    ? "bg-white text-black"
                                    : "text-white/50 hover:text-white"
                                    }`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
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
            </main>
        </div>
    );
}
