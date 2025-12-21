"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Program } from "@/types";
import type { ProgramStats } from "@/lib/analytics";
import { updateProgramData, getProgramManagementData } from "@/app/admin/actions";
import { EditForm } from "@/components/Admin/EditForm";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { HiArrowLeft, HiEye, HiCursorClick, HiTrendingUp, HiCheck, HiTrash } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

interface ManageProgramClientProps {
    initialProgram: Program;
    initialStats: ProgramStats;
}

export default function ManageProgramClient({ initialProgram, initialStats }: ManageProgramClientProps) {
    const router = useRouter();
    const [program, setProgram] = useState<Program>(initialProgram);
    const [stats, setStats] = useState<ProgramStats>(initialStats);
    const [range, setRange] = useState<"24h" | "7d" | "30d">("7d");
    const [isPending, startTransition] = useTransition();
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    useEffect(() => {
        // Refresh stats when range changes
        async function refreshStats() {
            const result = await getProgramManagementData(program.id, range);
            if (result.success && result.stats) {
                setStats(result.stats as any);
            }
        }
        if (range !== "7d" || stats === initialStats) {
            refreshStats();
        }
    }, [range, program.id]);

    const handleEditChange = (field: keyof Program, value: unknown) => {
        setProgram((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus("idle");
        const result = await updateProgramData(program.id, program);
        setIsSaving(false);

        if (result.success) {
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } else {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    const handleStatusToggle = async () => {
        const newStatus = !program.approvalStatus;
        const result = await updateProgramData(program.id, { approvalStatus: newStatus });
        if (result.success) {
            setProgram(prev => ({ ...prev, approvalStatus: newStatus }));
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this program permanently?")) return;
        const res = await fetch(`/api/programs/${program.id}`, { method: "DELETE" });
        if (res.ok) {
            router.push("/admin");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white"
                        >
                            <HiArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                                {program.logoUrl && (
                                    <Image src={program.logoUrl} alt="" fill className="object-cover" unoptimized />
                                )}
                            </div>
                            <h1 className="text-sm font-bold tracking-tight">{program.programName}</h1>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${program.approvalStatus
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }`}>
                                {program.approvalStatus ? "Live" : "Pending"}
                            </span>
                            {program.isFeatured && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-500 border-amber-500/30 font-bold">
                                    SPONSORED
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleStatusToggle}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${program.approvalStatus
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                }`}
                        >
                            <HiCheck className="w-4 h-4" />
                            {program.approvalStatus ? "Deactivate" : "Approve Now"}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
                        >
                            <HiTrash className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Stats & Analytics */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <HiEye className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Total Views</span>
                                </div>
                                <p className="text-3xl font-bold tracking-tight">{stats.views.toLocaleString()}</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <HiCursorClick className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Total Clicks</span>
                                </div>
                                <p className="text-3xl font-bold tracking-tight">{stats.clicks.toLocaleString()}</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <HiTrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">AVG CTR</span>
                                </div>
                                <p className="text-3xl font-bold tracking-tight">{stats.ctr}%</p>
                            </div>
                        </div>

                        {/* Traffic Chart */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Traffic Trend</h3>
                                <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-lg border border-white/10">
                                    {(["24h", "7d", "30d"] as const).map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setRange(r)}
                                            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${range === r ? "bg-white text-black" : "text-white/40 hover:text-white"
                                                }`}
                                        >
                                            {r.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.trafficChart}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#fff" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            hide
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="visitors"
                                            stroke="#fff"
                                            fillOpacity={1}
                                            fill="url(#colorVisits)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Ranking & Visibility */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Ranking & Visibility</h3>

                            <div className="space-y-6">
                                {/* Score */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-white/60">Trending Score</span>
                                        <span className="text-sm font-mono font-bold text-blue-400">{program.trendingScore?.toFixed(0) || 0}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${Math.min((program.trendingScore || 0) / 10, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Boost Input */}
                                <div>
                                    <label className="block text-xs text-white/60 mb-2">Manual Score Boost</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={program.manualScoreBoost ?? 0}
                                            onChange={(e) => handleEditChange("manualScoreBoost", parseInt(e.target.value) || 0)}
                                            className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-white/20 outline-none transition-all"
                                        />
                                        <div className={`text-xs font-bold ${(program.manualScoreBoost || 0) > 0 ? "text-emerald-500" : (program.manualScoreBoost || 0) < 0 ? "text-red-500" : "text-white/20"
                                            }`}>
                                            {(program.manualScoreBoost || 0) >= 0 ? "+" : ""}{program.manualScoreBoost || 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Sponsorship Toggle */}
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold">Sponsored Status</h4>
                                            <p className="text-[10px] text-white/40">Pin to top of the leaderboard</p>
                                        </div>
                                        <button
                                            onClick={() => handleEditChange("isFeatured", !program.isFeatured)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${program.isFeatured ? "bg-amber-500" : "bg-white/10"
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${program.isFeatured ? "right-1" : "left-1"
                                                }`} />
                                        </button>
                                    </div>

                                    {program.isFeatured && (
                                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Live Sponsorship</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-white/40 italic">Ends: {program.featuredExpiresAt ? new Date(program.featuredExpiresAt).toLocaleDateString() : 'Never'}</span>
                                                <button
                                                    onClick={() => {
                                                        const days = prompt("How many days to add (from now)?", "30");
                                                        if (days) {
                                                            const date = new Date();
                                                            date.setDate(date.getDate() + parseInt(days));
                                                            handleEditChange("featuredExpiresAt", date);
                                                        }
                                                    }}
                                                    className="text-[10px] font-bold text-white/60 hover:text-white underline underline-offset-2"
                                                >
                                                    Set Expiry
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="lg:col-span-8">
                        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Program Settings</h2>
                                    <p className="text-sm text-white/40">Manage visibility, commission, and metadata.</p>
                                </div>
                            </div>

                            <EditForm
                                program={program}
                                onChange={handleEditChange}
                                onSave={handleSave}
                                onCancel={() => router.push("/admin")}
                                isSaving={isSaving}
                                saveStatus={saveStatus}
                            />
                        </div>
                    </div>

                </div>
            </main>

            {/* Premium Floating Notification */}
            <AnimatePresence>
                {saveStatus === "success" && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-8 right-8 z-[100]"
                    >
                        <div className="px-6 py-4 rounded-2xl bg-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center gap-4 border border-white/20">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <HiCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Changes Saved</h4>
                                <p className="text-xs opacity-60">Program updated successfully.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
