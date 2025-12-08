"use client";

import { useState, useMemo, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { HiXMark, HiCalculator, HiSparkles } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

interface IncomeSimulatorProps {
    isOpen: boolean;
    onClose: () => void;
    commissionRate: number;
    commissionDuration: string | null | undefined;
    avgOrderValue: number | null | undefined;
    programName: string;
}

export function IncomeSimulator({
    isOpen,
    onClose,
    commissionRate,
    commissionDuration,
    avgOrderValue,
    programName,
}: IncomeSimulatorProps) {
    // Whether recurring or one-time
    const isRecurring = commissionDuration === "Recurring";

    // Form state
    const [productPrice, setProductPrice] = useState<string>(
        avgOrderValue ? String(avgOrderValue) : ""
    );
    const [commission, setCommission] = useState<string>(String(commissionRate || 0));
    const [salesPerMonth, setSalesPerMonth] = useState(5);
    const [audienceGrowth, setAudienceGrowth] = useState(10);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setProductPrice(avgOrderValue ? String(avgOrderValue) : "");
            setCommission(String(commissionRate || 0));
            setSalesPerMonth(5);
            setAudienceGrowth(10);
        }
    }, [isOpen, avgOrderValue, commissionRate]);

    // Calculate 12 month projections
    const { chartData, month1Income, month12Income, totalYearEarnings } = useMemo(() => {
        const price = parseFloat(productPrice) || 0;
        const commPercent = parseFloat(commission) || 0;
        const growthRate = audienceGrowth / 100;

        const data: { month: string; earnings: number; newSales: number }[] = [];
        let totalSubscribers = 0;
        let totalEarnings = 0;
        let m1 = 0;
        let m12 = 0;

        for (let month = 1; month <= 12; month++) {
            // Calculate new sales with growth
            const growthMultiplier = 1 + growthRate * (month - 1);
            const newSales = Math.round(salesPerMonth * growthMultiplier);

            let monthlyIncome = 0;

            if (isRecurring) {
                // Recurring: snowball effect - all previous subscribers continue paying
                totalSubscribers += newSales;
                monthlyIncome = totalSubscribers * price * (commPercent / 100);
            } else {
                // One-time: only new sales count
                monthlyIncome = newSales * price * (commPercent / 100);
            }

            totalEarnings += monthlyIncome;

            if (month === 1) m1 = monthlyIncome;
            if (month === 12) m12 = monthlyIncome;

            data.push({
                month: `M${month}`,
                earnings: Math.round(monthlyIncome),
                newSales,
            });
        }

        return {
            chartData: data,
            month1Income: m1,
            month12Income: m12,
            totalYearEarnings: totalEarnings,
        };
    }, [productPrice, commission, salesPerMonth, audienceGrowth, isRecurring]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const isValid = parseFloat(productPrice) > 0 && parseFloat(commission) > 0;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-4xl bg-[var(--bg-elevated)] rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20">
                                <HiCalculator className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                    Income Simulator
                                </h2>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {programName} • {isRecurring ? "Recurring" : "One-time"} commission
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            <HiXMark className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[var(--border)]">
                        {/* Left Panel: Controls */}
                        <div className="p-6 space-y-5">
                            {/* Product Price */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                                    Product Price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        value={productPrice}
                                        onChange={(e) => setProductPrice(e.target.value)}
                                        placeholder="Enter price..."
                                        className={`w-full h-12 pl-8 pr-4 rounded-xl bg-[var(--bg-secondary)] border text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-solid)] transition-all ${!productPrice
                                            ? "border-amber-500/50 animate-pulse"
                                            : "border-[var(--border)]"
                                            }`}
                                    />
                                </div>
                                {!productPrice && (
                                    <p className="text-xs text-amber-500 mt-1.5">
                                        ⚠ Please enter a product price to see projections
                                    </p>
                                )}
                            </div>

                            {/* Commission */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                                    My Commission (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={commission}
                                        onChange={(e) => setCommission(e.target.value)}
                                        min="1"
                                        max="100"
                                        className="w-full h-12 px-4 pr-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                                        %
                                    </span>
                                </div>
                            </div>

                            {/* Sales per Month Slider */}
                            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                <div className="flex items-center justify-between mb-5">
                                    <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                                        Sales per Month
                                    </label>
                                    <div className="px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
                                        <input
                                            type="number"
                                            value={salesPerMonth}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                setSalesPerMonth(Math.max(1, val));
                                            }}
                                            min="1"
                                            className="w-14 text-center text-sm font-semibold text-[var(--text-primary)] bg-transparent border-none focus:outline-none"
                                        />
                                    </div>
                                </div>
                                {/* Slider track */}
                                <div className="relative h-8 flex items-center">
                                    {/* Background track */}
                                    <div className="absolute inset-x-0 h-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)]" />
                                    {/* Active track - gradient */}
                                    <div
                                        className="absolute h-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                        style={{ width: `${Math.min(100, salesPerMonth / 10)}%` }}
                                    />
                                    {/* Thumb - 3D white capsule */}
                                    <div
                                        className="absolute w-7 h-7 -ml-3.5 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.8)_inset] cursor-pointer transition-transform hover:scale-110 active:scale-95"
                                        style={{ left: `${Math.min(100, salesPerMonth / 10)}%` }}
                                    >
                                        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white to-gray-100" />
                                    </div>
                                    {/* Invisible range input for interaction */}
                                    <input
                                        type="range"
                                        min="1"
                                        max="1000"
                                        value={Math.min(1000, salesPerMonth)}
                                        onChange={(e) => setSalesPerMonth(parseInt(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex justify-between mt-3 text-[10px] text-[var(--text-tertiary)] font-medium">
                                    <span>1</span>
                                    <span>500</span>
                                    <span>1000</span>
                                </div>
                            </div>

                            {/* Audience Growth Slider */}
                            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                <div className="flex items-center justify-between mb-5">
                                    <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                                        Audience Growth
                                    </label>
                                    <div className="flex items-center px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
                                        <input
                                            type="number"
                                            value={audienceGrowth}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setAudienceGrowth(Math.min(50, Math.max(0, val)));
                                            }}
                                            min="0"
                                            max="50"
                                            className="w-8 text-center text-sm font-semibold text-[var(--text-primary)] bg-transparent border-none focus:outline-none"
                                        />
                                        <span className="text-sm font-semibold text-[var(--text-secondary)]">%</span>
                                    </div>
                                </div>
                                {/* Slider track */}
                                <div className="relative h-8 flex items-center">
                                    {/* Background track */}
                                    <div className="absolute inset-x-0 h-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)]" />
                                    {/* Active track - gradient */}
                                    <div
                                        className="absolute h-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                        style={{ width: `${audienceGrowth * 2}%` }}
                                    />
                                    {/* Thumb - 3D white capsule */}
                                    <div
                                        className="absolute w-7 h-7 -ml-3.5 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.8)_inset] cursor-pointer transition-transform hover:scale-110 active:scale-95"
                                        style={{ left: `${audienceGrowth * 2}%` }}
                                    >
                                        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white to-gray-100" />
                                    </div>
                                    {/* Invisible range input for interaction */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={audienceGrowth}
                                        onChange={(e) => setAudienceGrowth(parseInt(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex justify-between mt-3 text-[10px] text-[var(--text-tertiary)] font-medium">
                                    <span>0%</span>
                                    <span>25%</span>
                                    <span>50%</span>
                                </div>
                            </div>

                            {/* Recurring Snowball Note */}
                            {isRecurring && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-start gap-3">
                                        <HiSparkles className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-400 mb-1">
                                                Snowball Effect Active
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                With recurring commissions, every customer you bring continues paying you monthly. Your income compounds over time!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel: Chart & Metrics */}
                        <div className="p-6 bg-[var(--bg-card)]">
                            {/* Chart */}
                            <div className="h-48 mb-6">
                                {isValid ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) => `$${value}`}
                                                width={50}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "var(--bg-elevated)",
                                                    border: "1px solid var(--border)",
                                                    borderRadius: "12px",
                                                    padding: "8px 12px",
                                                }}
                                                labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
                                                formatter={(value: number) => [formatCurrency(value), "Earnings"]}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="earnings"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                fill="url(#earningsGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                                <HiCalculator className="w-8 h-8 text-[var(--text-tertiary)]" />
                                            </div>
                                            <p className="text-sm text-[var(--text-tertiary)]">
                                                Enter product price to see projections
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Month 1</p>
                                    <p className="text-lg font-bold text-[var(--text-primary)]">
                                        {isValid ? formatCurrency(month1Income) : "$0"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Month 12</p>
                                    <p className="text-lg font-bold text-[var(--text-primary)]">
                                        {isValid ? formatCurrency(month12Income) : "$0"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                                    <p className="text-xs text-emerald-400 mb-1">Total Year</p>
                                    <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                        {isValid ? formatCurrency(totalYearEarnings) : "$0"}
                                    </p>
                                </div>
                            </div>

                            {/* Growth indicator */}
                            {isValid && month12Income > month1Income && (
                                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <p className="text-sm text-emerald-400">
                                        📈 {((month12Income / month1Income - 1) * 100).toFixed(0)}% growth from Month 1 to 12
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
