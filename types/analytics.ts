export interface TrafficDataPoint {
    date: string;
    visitors: number;
    clicks: number;
}

export interface GeoReferrerStat {
    country: string;
    code: string;
    users: number;
    topSource: string;
}

export interface TopProgram {
    id: string;
    name: string;
    slug: string | null;
    views: number;
    clicks: number;
    ctr: number;
}

export interface StartupOrigin {
    country: string;
    count: number;
}

export interface ClickBreakdown {
    programId: string;
    programName: string;
    slug: string | null;
    clicks: number;
}

export interface SearchQuery {
    query: string;
    count: number;
    resultsCount: number;
}

export interface CategoryTrend {
    category: string;
    views: number;
    percentage: number;
}

export interface ReferrerCTR {
    source: string;
    domain: string | null;
    visitors: number;
    clicks: number;
    ctr: number;
}

export interface FunnelStep {
    name: string;
    value: number;
    conversion: number; // % from previous step
}

export interface DeviceStat {
    type: string;
    count: number;
    percentage: number;
}

export interface OSStat {
    name: string;
    count: number;
    percentage: number;
}

export interface FeaturedProgram {
    id: string;
    name: string;
    slug: string | null;
}

export interface FunnelData {
    steps: FunnelStep[];
}

export interface DashboardStats {
    // Core Metrics (Single Source of Truth)
    liveUsers: number;
    totalViews: number;        // Raw page loads
    uniqueVisitors: number;    // Deduplicated visitors (same as Funnel Step 1)
    totalClicks: number;
    advertiseViews: number;

    // New Google-like Metrics
    bounceRate: number;        // % who left without clicking
    avgSessionDuration: number; // Average seconds per session
    returnVisitorRate: number; // % returning visitors
    peakHours: { hour: number; visitors: number }[];

    // Charts & Tables
    trafficChart: TrafficDataPoint[];
    geoReferrerStats: GeoReferrerStat[];
    startupOrigins: StartupOrigin[];
    topPrograms: TopProgram[];
    newProgramsChart: { date: string; total: number; added: number }[];
    newProgramsCount: { day: number; week: number; month: number };
    clickBreakdown: ClickBreakdown[];
    topSearches: SearchQuery[];
    zeroResultSearches: SearchQuery[];
    categoryTrends: CategoryTrend[];
    referrerCTR: ReferrerCTR[];
    funnel: FunnelData;
    featuredPrograms: FeaturedProgram[];
    deviceStats: DeviceStat[];
    osStats: OSStat[];
    health?: {
        dbRows: number;
        dbSizeWarning: boolean;
    };
}

export interface ProgramStats {
    views: number;
    clicks: number;
    ctr: number;
    trafficChart: TrafficDataPoint[];
}
