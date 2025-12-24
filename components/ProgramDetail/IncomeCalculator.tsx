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

interface IncomeCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    commissionRate: number;
    commissionDuration: string | null | undefined;
    avgOrderValue: number | null | undefined;
    programName: string;
}

export function IncomeCalculator({
    isOpen,
    onClose,
    commissionRate,
    commissionDuration,
    avgOrderValue,
    programName,
}: IncomeCalculatorProps) {
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
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-h-[95vh] sm:max-h-[90vh] max-w-4xl bg-[var(--bg-elevated)] rounded-2xl sm:rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border)] flex-shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                                <HiCalculator className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
                                    Income Calculator
                                </h2>
                                <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] truncate">
                                    {programName} • {isRecurring ? "Recurring" : "One-time"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex-shrink-0"
                        >
                            <HiXMark className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content - Scrollable on mobile */}
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[var(--border)]">
                            {/* Left Panel: Controls */}
                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                                {/* Product Price */}
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] mb-1.5 sm:mb-2 uppercase tracking-wide">
                                        Product Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] text-sm sm:text-base">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            value={productPrice}
                                            onChange={(e) => setProductPrice(e.target.value)}
                                            placeholder="Enter price..."
                                            className={`w-full h-11 sm:h-12 pl-7 sm:pl-8 pr-4 rounded-xl bg-[var(--bg-secondary)] border text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-solid)] transition-all text-base ${!productPrice
                                                ? "border-amber-500/50 animate-pulse"
                                                : "border-[var(--border)]"
                                                }`}
                                        />
                                    </div>
                                    {!productPrice && (
                                        <p className="text-[10px] sm:text-xs text-amber-500 mt-1 sm:mt-1.5">
                                            ⚠ Enter a product price to see projections
                                        </p>
                                    )}
                                </div>

                                {/* Commission */}
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] mb-1.5 sm:mb-2 uppercase tracking-wide">
                                        My Commission (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            value={commission}
                                            onChange={(e) => setCommission(e.target.value)}
                                            min="1"
                                            max="100"
                                            className="w-full h-11 sm:h-12 px-4 pr-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] transition-all text-base"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                                            %
                                        </span>
                                    </div>
                                </div>

                                {/* Sales per Month Slider */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                                        <label className="text-[10px] sm:text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                                            Sales per Month
                                        </label>
                                        <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                value={salesPerMonth}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setSalesPerMonth(Math.max(1, val));
                                                }}
                                                min="1"
                                                className="w-12 sm:w-14 text-center text-sm font-semibold text-[var(--text-primary)] bg-transparent border-none focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    {/* Slider track */}
                                    <div className="relative h-8 flex items-center touch-pan-x">
                                        {/* Background track */}
                                        <div className="absolute inset-x-0 h-1.5 sm:h-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)]" />
                                        {/* Active track - gradient */}
                                        <div
                                            className="absolute h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                            style={{ width: `${Math.min(100, salesPerMonth / 10)}%` }}
                                        />
                                        {/* Thumb - 3D white capsule */}
                                        <div
                                            className="absolute w-5 h-5 sm:w-6 sm:h-6 -ml-2.5 sm:-ml-3 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)_inset] cursor-pointer transition-transform hover:scale-110 active:scale-95"
                                            style={{ left: `${Math.min(100, salesPerMonth / 10)}%` }}
                                        >
                                            <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white to-gray-100" />
                                        </div>
                                        {/* Invisible range input for interaction */}
                                        <input
                                            type="range"
                                            min="1"
                                            max="1000"
                                            value={Math.min(1000, salesPerMonth)}
                                            onChange={(e) => setSalesPerMonth(parseInt(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-pan-x"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 sm:mt-3 text-[10px] text-[var(--text-tertiary)] font-medium">
                                        <span>1</span>
                                        <span>500</span>
                                        <span>1000</span>
                                    </div>
                                </div>

                                {/* Audience Growth Slider */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                                        <div>
                                            <label className="text-[10px] sm:text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                                                Audience Growth
                                            </label>
                                            <span className="ml-1.5 text-[9px] sm:text-[10px] text-[var(--text-tertiary)] font-normal normal-case tracking-normal">
                                                / month
                                            </span>
                                        </div>
                                        <div className="flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                value={audienceGrowth}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    setAudienceGrowth(Math.min(50, Math.max(0, val)));
                                                }}
                                                min="0"
                                                max="50"
                                                className="w-7 sm:w-8 text-center text-sm font-semibold text-[var(--text-primary)] bg-transparent border-none focus:outline-none"
                                            />
                                            <span className="text-sm font-semibold text-[var(--text-secondary)]">%</span>
                                        </div>
                                    </div>
                                    {/* Slider track */}
                                    <div className="relative h-8 flex items-center touch-pan-x">
                                        {/* Background track */}
                                        <div className="absolute inset-x-0 h-1.5 sm:h-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)]" />
                                        {/* Active track - gradient */}
                                        <div
                                            className="absolute h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                            style={{ width: `${audienceGrowth * 2}%` }}
                                        />
                                        {/* Thumb - 3D white capsule */}
                                        <div
                                            className="absolute w-5 h-5 sm:w-6 sm:h-6 -ml-2.5 sm:-ml-3 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)_inset] cursor-pointer transition-transform hover:scale-110 active:scale-95"
                                            style={{ left: `${audienceGrowth * 2}%` }}
                                        >
                                            <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white to-gray-100" />
                                        </div>
                                        {/* Invisible range input for interaction */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={audienceGrowth}
                                            onChange={(e) => setAudienceGrowth(parseInt(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-pan-x"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 sm:mt-3 text-[10px] text-[var(--text-tertiary)] font-medium">
                                        <span>0%</span>
                                        <span>25%</span>
                                        <span>50%</span>
                                    </div>
                                </div>

                                {/* Recurring Snowball Note */}
                                {isRecurring && (
                                    <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <HiSparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs sm:text-sm font-semibold text-emerald-400 mb-0.5 sm:mb-1">
                                                    Snowball Effect Active
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
                                                    With recurring commissions, every customer you bring continues paying you monthly. Your income compounds over time!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel: Chart & Metrics */}
                            <div className="p-4 sm:p-6 bg-[var(--bg-card)]">
                                {/* Chart */}
                                <div className="h-40 sm:h-48 mb-4 sm:mb-6">
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
                                                    tick={{ fontSize: 9, fill: "var(--text-tertiary)" }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    interval="preserveStartEnd"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 9, fill: "var(--text-tertiary)" }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(value) => `$${value}`}
                                                    width={45}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "var(--bg-elevated)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "12px",
                                                        padding: "8px 12px",
                                                        fontSize: "12px",
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
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                                    <HiCalculator className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-tertiary)]" />
                                                </div>
                                                <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
                                                    Enter product price to see projections
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                        <p className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mb-1">Month 1</p>
                                        <p className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                                            {isValid ? formatCurrency(month1Income) : "$0"}
                                        </p>
                                    </div>
                                    <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                                        <p className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mb-1">Month 12</p>
                                        <p className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                                            {isValid ? formatCurrency(month12Income) : "$0"}
                                        </p>
                                    </div>
                                    <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                                        <p className="text-[10px] sm:text-xs text-emerald-400 font-medium mb-1">Total Year</p>
                                        <p className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                                            {isValid ? formatCurrency(totalYearEarnings) : "$0"}
                                        </p>
                                    </div>
                                </div>

                                {/* Growth indicator */}
                                {isValid && month12Income > month1Income && (
                                    <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                        <p className="text-xs sm:text-sm text-emerald-400">
                                            📈 {((month12Income / month1Income - 1) * 100).toFixed(0)}% growth from Month 1 to 12
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
