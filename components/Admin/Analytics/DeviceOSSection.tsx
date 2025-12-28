import { DashboardStats } from "@/lib/analytics";
import {
    HiDevicePhoneMobile,
    HiComputerDesktop,
    HiDeviceTablet,
    HiQuestionMarkCircle
} from "react-icons/hi2";
import {
    FaWindows,
    FaApple,
    FaAndroid,
    FaLinux
} from "react-icons/fa6";

interface DeviceOSSectionProps {
    data?: DashboardStats;
    isLoading: boolean;
}

export function DeviceOSSection({ data, isLoading }: DeviceOSSectionProps) {
    const getDeviceIcon = (type: string) => {
        switch (type) {
            case "Mobile": return <HiDevicePhoneMobile className="w-4 h-4" />;
            case "Desktop": return <HiComputerDesktop className="w-4 h-4" />;
            case "Tablet": return <HiDeviceTablet className="w-4 h-4" />;
            default: return <HiQuestionMarkCircle className="w-4 h-4" />;
        }
    };

    const getOSIcon = (name: string) => {
        switch (name) {
            case "Windows": return <FaWindows className="w-4 h-4" />;
            case "macOS":
            case "iOS": return <FaApple className="w-4 h-4" />;
            case "Android": return <FaAndroid className="w-4 h-4" />;
            case "Linux": return <FaLinux className="w-4 h-4" />;
            default: return <HiQuestionMarkCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Devices */}
            <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                    Devices
                </h2>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="py-8 text-center text-white/20">Loading...</div>
                    ) : !data?.deviceStats?.length ? (
                        <div className="py-8 text-center text-white/20">No data</div>
                    ) : (
                        data.deviceStats.map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-white/80">
                                        {getDeviceIcon(stat.type)}
                                        <span>{stat.type}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/40 text-xs tabular-nums">{stat.count.toLocaleString()} sessions</span>
                                        <span className="font-bold tabular-nums text-white">{stat.percentage}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${stat.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Operating Systems */}
            <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                    Operating Systems
                </h2>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="py-8 text-center text-white/20">Loading...</div>
                    ) : !data?.osStats?.length ? (
                        <div className="py-8 text-center text-white/20">No data</div>
                    ) : (
                        data.osStats.map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-white/80">
                                        {getOSIcon(stat.name)}
                                        <span>{stat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/40 text-xs tabular-nums">{stat.count.toLocaleString()} sessions</span>
                                        <span className="font-bold tabular-nums text-white">{stat.percentage}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${stat.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
