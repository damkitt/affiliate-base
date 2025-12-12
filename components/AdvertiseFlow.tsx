"use client";

import { useState } from "react";
import { HiCheck, HiStar, HiSparkles, HiMagnifyingGlass } from "react-icons/hi2";
import { Program } from "@/types";
import useSWR from "swr";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import AddProgramModal from "./AddProgramModal";
import { ProgramCard } from "./ProgramCard";

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
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col transition-all duration-300">
            {step === "success" && <Confetti width={width} height={height} numberOfPieces={500} recycle={false} />}

            {/* Progress Bar */}
            <div className="h-1.5 bg-[var(--bg-secondary)] w-full">
                <div
                    className="h-full bg-[var(--accent-solid)] transition-all duration-500 ease-out"
                    style={{
                        width: step === "pricing" ? "25%" :
                            step === "selection" ? "50%" :
                                step === "preview" ? "75%" : "100%"
                    }}
                />
            </div>

            <div className="flex-1 p-8 md:p-12">
                {step === "pricing" && (
                    <div className="animate-fade-in">
                        <PricingStep onSelect={handlePlanSelect} />
                    </div>
                )}
                {step === "selection" && (
                    <div className="animate-fade-in">
                        <SelectionStep onSelect={handleProgramSelect} />
                    </div>
                )}
                {step === "preview" && selectedProgram && (
                    <div className="animate-fade-in">
                        <PreviewStep program={selectedProgram} onConfirm={handleConfirm} onBack={() => setStep("selection")} />
                    </div>
                )}
                {step === "success" && (
                    <div className="animate-fade-in">
                        <SuccessStep />
                    </div>
                )}
            </div>
        </div>
    );
}

function PricingStep({ onSelect }: { onSelect: () => void }) {
    const { data: availability } = useSWR("/api/featured/availability", (url) => fetch(url).then(r => r.json()));

    const isFull = availability?.isFull;
    const nextDate = availability?.nextAvailable ? new Date(availability.nextAvailable).toLocaleDateString() : 'soon';

    return (
        <div
            className="flex flex-col items-center text-center h-full justify-center animate-fade-in"
        >
            <div className="mb-6 p-4 rounded-full bg-[var(--accent-dim)] text-[var(--accent-solid)]">
                <HiStar className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                Become a Sponsored Program
            </h2>
            <p className="text-[var(--text-secondary)] max-w-lg mb-10 leading-relaxed">
                Get premium visibility at the top of our leaderboard. Sponsored programs receive priority placement above organic listings, a distinctive &ldquo;Sponsored&rdquo; badge, and significantly more visibility from our targeted affiliate audience.
            </p>

            <div className="w-full max-w-sm bg-[var(--bg-secondary)] rounded-xl p-8 border border-[var(--border)] relative overflow-hidden group hover:border-[var(--accent-solid)] transition-all duration-300">
                <div className="absolute top-0 right-0 bg-[var(--accent-solid)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    LIMITED SLOTS
                </div>

                <div className="text-sm text-[var(--text-secondary)] font-medium mb-2">MONTHLY SPONSORSHIP</div>
                <div className="flex items-baseline justify-center gap-1 mb-6">
                    <span className="text-4xl font-bold text-[var(--text-primary)]">$299</span>
                    <span className="text-[var(--text-secondary)]">/month</span>
                </div>

                <ul className="space-y-3 text-left mb-8">
                    <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                        <HiCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span>Top 3 placement on leaderboard</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                        <HiCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span>&ldquo;Sponsored&rdquo; badge & premium styling</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                        <HiCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span>5x more clicks than organic listings</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                        <HiCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span>Priority support & detailed analytics</span>
                    </li>
                </ul>

                {isFull ? (
                    <div className="text-center space-y-3">
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                            All 3 slots are currently taken
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Next slot available on {nextDate}
                        </p>
                        <button
                            disabled
                            className="w-full py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] font-medium cursor-not-allowed opacity-70"
                        >
                            Sold Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onSelect}
                        className="w-full py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-600/20"
                    >
                        Get Sponsored
                        {availability && <span className="ml-2 text-xs font-normal opacity-80">({3 - availability.count} of 3 slots left)</span>}
                    </button>
                )}
            </div>
        </div>
    );
}

function SelectionStep({ onSelect }: { onSelect: (p: Program) => void }) {
    const { data: programs } = useSWR<Program[]>("/api/programs", (url: string) => fetch(url).then(r => r.json()));
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    // Filter logic: Only show when search has value
    const filteredPrograms = search.length >= 2 ? programs?.filter(p => {
        const matchesSearch = p.programName.toLowerCase().includes(search.toLowerCase());
        const isAlreadyFeatured = p.isFeatured && p.featuredExpiresAt && new Date(p.featuredExpiresAt) > new Date();
        return matchesSearch && !isAlreadyFeatured;
    }) : [];

    return (
        <>
            <div
                className="h-full flex flex-col animate-fade-in"
            >
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Find Your Program</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">Search for your affiliate program to sponsor it</p>

                {/* Search Input */}
                <div className="relative mb-4">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                    <input
                        type="text"
                        placeholder="Type your program name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] transition-colors placeholder:text-[var(--text-tertiary)] text-lg"
                        autoFocus
                    />
                </div>

                {/* Search Results - Only show when typing */}
                {search.length >= 2 && (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[280px] mb-4">
                        {!programs ? (
                            <div className="text-center py-6 text-[var(--text-secondary)]">Loading...</div>
                        ) : filteredPrograms?.length === 0 ? (
                            <div className="text-center py-6 text-[var(--text-secondary)]">
                                No programs found for &ldquo;{search}&rdquo;
                            </div>
                        ) : (
                            filteredPrograms?.map(program => (
                                <div
                                    key={program.id}
                                    onClick={() => onSelect(program)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)] cursor-pointer transition-all"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center font-bold text-[var(--text-secondary)] overflow-hidden relative border border-[var(--border)]">
                                        {program.logoUrl ? (
                                            <img src={program.logoUrl} alt={program.programName} className="object-cover w-full h-full" />
                                        ) : (
                                            program.programName[0]
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-[var(--text-primary)]">{program.programName}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] truncate">{program.websiteUrl}</p>
                                    </div>
                                    <div className="text-xs font-medium text-[var(--accent-solid)]">
                                        {program.commissionRate}%
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Add Program CTA */}
                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)] transition-all"
                    >
                        <span className="text-lg">+</span>
                        <span className="text-sm font-medium">Don&apos;t see your program? Add it first</span>
                    </button>
                </div>
            </div>

            {/* Add Program Modal */}
            {showAddModal && (
                <AddProgramModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </>
    );
}

function PreviewStep({ program, onConfirm, onBack }: { program: Program, onConfirm: () => void, onBack: () => void }) {
    return (
        <div
            className="h-full flex flex-col items-center justify-center animate-fade-in"
        >
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Preview Your Sponsored Listing</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8">This is exactly how your program will appear on the leaderboard</p>

            {/* Preview Card - using shared component */}
            <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-[var(--border)] shadow-lg mb-10">
                <ProgramCard program={program} variant="row" />
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
                    Confirm & Pay $299
                </button>
            </div>
        </div>
    );
}

function SuccessStep() {
    return (
        <div
            className="h-full flex flex-col items-center justify-center text-center animate-fade-in"
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
        </div>
    );
}
