"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import useSWR from "swr";
import { DashboardStats, FunnelData } from "@/lib/analytics";

type TimeRange = "24h" | "7d" | "30d";

interface AnalyticsContextType {
    data?: DashboardStats;
    programFunnel?: FunnelData;
    isLoading: boolean;
    isError: boolean;
    range: TimeRange;
    setRange: (range: TimeRange) => void;
    selectedProgram: string;
    setSelectedProgram: (id: string) => void;
    mutate: () => Promise<any>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json());

export function AnalyticsProvider({ children }: { children: ReactNode }) {
    const [range, setRange] = useState<TimeRange>("7d");
    const [selectedProgram, setSelectedProgram] = useState<string>("global");

    // Main Dashboard Data Fetch - HOISTED SINGLE REQUEST
    const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
        `/api/admin/analytics?range=${range}`,
        fetcher,
        {
            revalidateOnFocus: false, // Prevent aggressive re-fetching
            revalidateOnReconnect: false,
            refreshInterval: 0, // Disable auto-poll for now (or set to 60s if needed)
            dedupingInterval: 5000, // Debounce duplicate requests within 5s
            keepPreviousData: true, // Show stale data while fetching new range
        }
    );

    // Optional: Program-specific Funnel (only if selected)
    const { data: programFunnel } = useSWR<FunnelData>(
        selectedProgram !== "global" ? `/api/admin/analytics/funnel?programId=${selectedProgram}&range=${range}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            keepPreviousData: true
        }
    );

    return (
        <AnalyticsContext.Provider
            value={{
                data,
                programFunnel,
                isLoading,
                isError: !!error,
                range,
                setRange,
                selectedProgram,
                setSelectedProgram,
                mutate
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
}

// Hook to consume the context
export function useAnalytics() {
    const context = useContext(AnalyticsContext);
    if (context === undefined) {
        throw new Error("useAnalytics must be used within an AnalyticsProvider");
    }
    return context;
}
