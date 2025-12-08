"use client";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import {
    HiShieldCheck,
    HiDocumentText,
    HiExclamationTriangle,
    HiNoSymbol,
    HiUserCircle,
    HiLockClosed,
    HiScale,
    HiEnvelope,
    HiCurrencyDollar,
    HiInformationCircle,
} from "react-icons/hi2";

export default function TermsPage() {
    const sections = [
        {
            id: "acceptance",
            icon: HiDocumentText,
            title: "1. Acceptance of Terms",
            content:
                'By accessing or using AffiliateBase (the "Site"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.',
        },
        {
            id: "description",
            icon: HiInformationCircle,
            title: "2. Description of Service",
            content:
                "AffiliateBase is a directory and discovery platform for affiliate programs. We provide data, metrics, and tools (such as revenue calculators) for informational purposes only. We are not an affiliate network. We do not process payments between creators and brands, nor do we manage tracking links. All affiliate relationships are established directly between the user and the third-party brand.",
        },
        {
            id: "accuracy",
            icon: HiShieldCheck,
            title: "3. Accuracy of Information",
            content:
                "While we strive to keep our database accurate, affiliate program terms (commission rates, cookie duration, payout methods) change frequently.",
            bullets: [
                {
                    title: "No Warranty",
                    text: "We do not guarantee the accuracy, completeness, or timeliness of any data on the Site.",
                },
                {
                    title: "Verification",
                    text: "Users are responsible for verifying all terms directly on the partner's website before applying or promoting a program.",
                },
            ],
        },
        {
            id: "financial",
            icon: HiCurrencyDollar,
            title: "4. No Financial Advice",
            content:
                'The "Revenue Simulator" and other calculation tools on the Site are for estimation and entertainment purposes only. Actual earnings vary based on traffic source, conversion rates, and individual effort. We do not guarantee any specific financial results.',
        },
        {
            id: "paid",
            icon: HiCurrencyDollar,
            title: "5. Paid Services (Advertising & Featured Spots)",
            content:
                'Brands and users may purchase "Featured" listings or other advertising slots.',
            bullets: [
                {
                    title: "No Refunds",
                    text: "All purchases for advertising are non-refundable, regardless of performance or click-through rates.",
                },
                {
                    title: "Right to Refuse",
                    text: "We reserve the right to remove any advertisement or claimed program that violates our policies without refund.",
                },
            ],
        },
        {
            id: "prohibited",
            icon: HiNoSymbol,
            title: "6. Prohibited Content & Acceptable Use",
            content:
                "To maintain the quality and integrity of AffiliateBase, we strictly prohibit the listing of programs in the following categories. We reserve the right to remove any listing immediately if it falls into these categories:",
            bullets: [
                {
                    title: "High-Risk & Scams",
                    text: '"Get rich quick" schemes, Pyramid schemes, Ponzi schemes, or Multi-Level Marketing (MLM) with no tangible product.',
                },
                {
                    title: "Adult Content",
                    text: "Pornography, adult dating, or any NSFW material.",
                },
                {
                    title: "Illegal Activities",
                    text: "Sale of illegal drugs, weapons, counterfeit goods, or malware/spyware.",
                },
                {
                    title: "Gambling",
                    text: "Online casinos, betting sites, or unregulated crypto-gambling.",
                },
                {
                    title: "Hate Speech",
                    text: "Content that promotes violence, discrimination, or harassment.",
                },
            ],
            footer:
                'We reserve the right to determine what constitutes "Prohibited Content" at our sole discretion.',
        },
        {
            id: "conduct",
            icon: HiUserCircle,
            title: "7. User Conduct",
            bullets: [
                {
                    title: "Claiming",
                    text: 'If you use the "Claim Program" feature, you certify that you are the authorized owner or representative of the specific company. False claims may result in a permanent ban.',
                },
                {
                    title: "Scraping",
                    text: "Automated scraping, data mining, or extraction of our database is strictly prohibited without prior written permission.",
                },
            ],
        },
        {
            id: "privacy",
            icon: HiLockClosed,
            title: "8. Privacy & Data Handling",
            content: "We respect your privacy. Here is how we handle your data:",
            bullets: [
                {
                    title: "Analytics",
                    text: "We use anonymous analytics to understand how users interact with our site (e.g., page views, clicks). This data is aggregated and does not identify you personally.",
                },
                {
                    title: "Contact Info",
                    text: 'If you voluntarily provide your email (e.g., via the "Claim" form or reporting an issue), we only use it to communicate with you regarding your request.',
                },
                {
                    title: "No Selling",
                    text: "We do not sell, trade, or rent your personal information to third parties.",
                },
            ],
        },
        {
            id: "liability",
            icon: HiScale,
            title: "9. Limitation of Liability",
            content:
                "To the fullest extent permitted by law, AffiliateBase shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the Site or reliance on any information provided.",
        },
        {
            id: "contact",
            icon: HiEnvelope,
            title: "10. Contact Us",
            content:
                "If you have questions about these Terms or how we handle your data, please contact us through our website or email.",
        },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans flex flex-col">
            <NavBar showBackButton />
            <div className="h-14" />

            <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-dim)] rounded-full mb-6 border border-[var(--accent-solid)]/20">
                        <HiShieldCheck className="w-5 h-5 text-[var(--accent-solid)]" />
                        <span className="text-sm font-semibold text-[var(--accent-solid)]">
                            Legal
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
                        Terms of Service & Privacy Policy
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        Last Updated: 8 December 2025
                    </p>
                </div>

                {/* Table of Contents */}
                <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] mb-8">
                    <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                        Table of Contents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-solid)] transition-colors py-1"
                            >
                                <section.icon className="w-4 h-4 text-[var(--text-tertiary)]" />
                                {section.title}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            id={section.id}
                            className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] scroll-mt-20"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center">
                                    <section.icon className="w-5 h-5 text-[var(--accent-solid)]" />
                                </div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                    {section.title}
                                </h2>
                            </div>

                            {section.content && (
                                <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                                    {section.content}
                                </p>
                            )}

                            {section.bullets && (
                                <ul className="space-y-3">
                                    {section.bullets.map((bullet, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-[var(--accent-solid)] mt-2 shrink-0" />
                                            <div>
                                                <span className="font-semibold text-[var(--text-primary)]">
                                                    {bullet.title}:
                                                </span>{" "}
                                                <span className="text-[var(--text-secondary)]">
                                                    {bullet.text}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {section.footer && (
                                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-start gap-2">
                                        <HiExclamationTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            {section.footer}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
