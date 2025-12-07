"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiCheck, HiStar, HiSparkles } from "react-icons/hi2";
import { Program } from "@/types";
import useSWR from "swr";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type Step = "pricing" | "selection" | "preview" | "success";

export function AdvertiseFlow() {
    const [step, setStep] = useState<Step>("pricing");
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const { width, height } = useWindowSize();

    const handlePlanSelect = () => {
        setStep("selection");
    };

    const handleProgramSelect = (program: Program) => {
        setSelectedProgram(program);
        setStep("preview");
    };

    const handleConfirm = async () => {
        if (!selectedProgram) return;

        try {
            const res = await fetch("/api/programs/featured", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ programId: selectedProgram.id }),
            });

            if (!res.ok) throw new Error("Failed to update program");

            setStep("success");
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
            {step === "success" && <Confetti width={width} height={height} numberOfPieces={500} recycle={false} />}

            {/* Progress Bar */}
            <div className="h-1.5 bg-[var(--bg-secondary)] w-full">
                <motion.div
                    className="h-full bg-[var(--accent-solid)]"
                    initial={{ width: "0%" }}
                    animate={{
                        width: step === "pricing" ? "25%" :
                            step === "selection" ? "50%" :
                                step === "preview" ? "75%" : "100%"
                    }}
                />
            </div>

            <div className="flex-1 p-8 md:p-12">
                <AnimatePresence mode="wait">
                    {step === "pricing" && (
                        <PricingStep onSelect={handlePlanSelect} />
                    )}
                    {step === "selection" && (
                        <SelectionStep onSelect={handleProgramSelect} />
                    )}
                    {step === "preview" && selectedProgram && (
                        <PreviewStep program={selectedProgram} onConfirm={handleConfirm} onBack={() => setStep("selection")} />
                    )}
                    {step === "success" && (
                        <SuccessStep />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function PricingStep({ onSelect }: { onSelect: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center text-center h-full justify-center"
        >
            <div className="mb-6 p-4 rounded-full bg-[var(--accent-dim)] text-[var(--accent-solid)]">
                <HiStar className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                Become a Featured Program
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md mb-10">
                Get premium visibility on our leaderboard. Featured programs get 5x more clicks and a dedicated &ldquo;Featured&rdquo; badge.
            </p>

            <div className="w-full max-w-sm bg-[var(--bg-secondary)] rounded-xl p-8 border border-[var(--border)] relative overflow-hidden group hover:border-[var(--accent-solid)] transition-all duration-300">
                <div className="absolute top-0 right-0 bg-[var(--accent-solid)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    MOST POPULAR
                </div>

                <div className="text-sm text-[var(--text-secondary)] font-medium mb-2">MONTHLY PLAN</div>
                <div className="flex items-baseline justify-center gap-1 mb-6">
                    <span className="text-4xl font-bold text-[var(--text-primary)]">$200</span>
                    <span className="text-[var(--text-secondary)]">/month</span>
                </div>

                <ul className="space-y-3 text-left mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                        <HiCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span>Top placement on leaderboard</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                        <HiCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span>&ldquo;Featured&rdquo; badge &amp; styling</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                        <HiCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span>Detailed analytics report</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                        <HiCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span>Priority support</span>
                    </li>
                </ul>

                <button
                    onClick={onSelect}
                    className="w-full py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-600/20"
                >
                    Select Plan
                </button>
            </div>
        </motion.div>
    );
}

function SelectionStep({ onSelect }: { onSelect: (p: Program) => void }) {
    // Mock data for now
    const { data: programs } = useSWR<Program[]>("/api/programs", (url: string) => fetch(url).then(r => r.json()));

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col"
        >
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Select Your Program</h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
                {programs?.map(program => (
                    <div
                        key={program.id}
                        onClick={() => onSelect(program)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)] cursor-pointer transition-all"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center font-bold text-[var(--text-secondary)]">
                            {program.programName[0]}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">{program.programName}</h3>
                            <p className="text-xs text-[var(--text-secondary)]">{program.websiteUrl}</p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function PreviewStep({ program, onConfirm, onBack }: { program: Program, onConfirm: () => void, onBack: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col items-center justify-center"
        >
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">Preview Your Ad</h2>

            {/* Preview Card */}
            <div className="w-full max-w-2xl p-6 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--accent-solid)] shadow-lg shadow-[var(--accent-solid)]/10 relative mb-10">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-[var(--accent-solid)] text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <HiStar className="w-3 h-3" />
                    FEATURED
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-2xl font-bold text-[var(--text-secondary)]">
                        {program.programName[0]}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">{program.programName}</h3>
                        <p className="text-[var(--text-secondary)]">{program.tagline}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-[var(--text-secondary)]">Commission</div>
                        <div className="text-xl font-bold text-[var(--accent-solid)]">{program.commissionRate}%</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-secondary)] transition-all"
                >
                    Back
                </button>
                <button
                    onClick={onConfirm}
                    className="px-8 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30"
                >
                    Confirm & Pay $200
                </button>
            </div>
        </motion.div>
    );
}

function SuccessStep() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center"
        >
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
                <HiSparkles className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                Payment Successful!
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md mb-8">
                Your program is now featured on the leaderboard. Get ready for some serious traffic!
            </p>
            <button
                onClick={() => window.location.href = "/"}
                className="px-8 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30"
            >
                Go to Leaderboard
            </button>
        </motion.div>
    );
}
