"use client";

import { useState } from "react";
import {
    HiUserGroup,
    HiLink,
    HiPresentationChartLine,
    HiCurrencyDollar,
    HiLightBulb
} from "react-icons/hi2";

export function HowItWorks() {
    const [activeStep, setActiveStep] = useState<number | null>(null);

    const howItWorks = [
        {
            step: "01",
            icon: HiUserGroup,
            title: "Sign Up & Get Approved",
            desc: "Create your affiliate account and get instant access",
            color: "bg-emerald-600",
            details: ["Fill out simple application form", "Get approved within 24-48 hours", "Access affiliate dashboard"]
        },
        {
            step: "02",
            icon: HiLink,
            title: "Get Your Unique Link",
            desc: "Receive your personalized tracking link and materials",
            color: "bg-cyan-500",
            details: ["Custom tracking link generated", "Marketing materials provided", "Access to promotional banners"]
        },
        {
            step: "03",
            icon: HiPresentationChartLine,
            title: "Share & Track Performance",
            desc: "Promote the program and monitor your results",
            color: "bg-violet-500",
            details: ["Share link with your audience", "Real-time analytics dashboard", "Track clicks and conversions"]
        },
        {
            step: "04",
            icon: HiCurrencyDollar,
            title: "Earn Commissions",
            desc: "Get paid for every successful referral",
            color: "bg-amber-500",
            details: ["Automatic commission calculation", "Regular payout schedule", "Multiple payment methods"]
        }
    ];

    return (
        <div className="card-premium p-8 rounded-[2rem] animate-fade-in-up delay-300">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                    <HiLightBulb className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {howItWorks.map((item, idx) => (
                    <div
                        key={idx}
                        className={`p-5 rounded-3xl glass border border-[var(--border)] cursor-pointer transition-all duration-300 hover:bg-[var(--bg-secondary)] ${activeStep === idx ? 'ring-1 ring-emerald-500/50 bg-emerald-500/5' : ''}`}
                        onClick={() => setActiveStep(activeStep === idx ? null : idx)}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                                <item.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Step {item.step}</span>
                        </div>
                        <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{item.desc}</p>

                        {/* Expandable Details */}
                        <div className={`overflow-hidden transition-all duration-300 ease-out ${activeStep === idx ? "max-h-48 opacity-100 mt-4 pt-4 border-t border-[var(--border)]" : "max-h-0 opacity-0"}`}>
                            <ul className="space-y-2">
                                {item.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-3 text-xs text-[var(--text-secondary)]">
                                        <span className="text-emerald-500 font-bold">→</span>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mt-2 flex items-center gap-1 group">
                            {activeStep === idx ? "Show less" : "Learn more"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
