"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Program, CATEGORIES } from "@/types";
import { HiArrowLeft, HiCheck, HiXMark, HiPencil, HiTrash, HiMagnifyingGlass } from "react-icons/hi2";
import { ThemeToggle } from "@/components/ThemeToggle";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Program>>({});
    const [searchQuery, setSearchQuery] = useState("");

    const { data: pendingPrograms = [], mutate: mutatePending } = useSWR<Program[]>(
        "/api/admin/programs?status=pending",
        fetcher,
        { refreshInterval: 3000 }
    );

    const { data: allPrograms = [], mutate: mutateAll } = useSWR<Program[]>(
        "/api/admin/programs",
        fetcher,
        { refreshInterval: 3000 }
    );

    const handleApprove = async (id: number) => {
        await fetch("/api/admin/programs", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "approved" })
        });
        mutatePending();
        mutateAll();
    };

    const handleDecline = async (id: number) => {
        if (!confirm("Are you sure you want to delete this program?")) return;
        await fetch(`/api/programs/${id}`, { method: "DELETE" });
        mutatePending();
        mutateAll();
    };

    const handleEdit = (program: Program) => {
        setEditingId(program.id);
        setEditForm(program);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        await fetch(`/api/programs/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm)
        });
        setEditingId(null);
        setEditForm({});
        mutatePending();
        mutateAll();
    };

    // Filter programs by search query
    const filterPrograms = (programs: Program[]) => {
        if (!searchQuery) return programs;
        const query = searchQuery.toLowerCase();
        return programs.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.tagline?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    };

    const programs = filterPrograms(activeTab === "pending" ? pendingPrograms : allPrograms);

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <HiArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <div className="h-6 w-px bg-[var(--border)]" />
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin Panel</h1>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Search programs by name, category, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] inline-flex">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "pending"
                                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                    >
                        Pending ({pendingPrograms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "all"
                                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                    >
                        All Programs ({allPrograms.length})
                    </button>
                </div>

                {/* Program Cards */}
                <div className="space-y-6">
                    {programs.map((program) => (
                        <div
                            key={program.id}
                            className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-lg"
                        >
                            {editingId === program.id ? (
                                <div className="space-y-4">
                                    {/* Edit Form - All Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Name *</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.name || ""}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Category *</label>
                                            <select
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.category || ""}
                                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Tagline *</label>
                                        <input
                                            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                            value={editForm.tagline || ""}
                                            onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Description *</label>
                                        <textarea
                                            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] min-h-[100px]"
                                            value={editForm.description || ""}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Website URL *</label>
                                            <input
                                                type="url"
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.websiteUrl || ""}
                                                onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Affiliate URL *</label>
                                            <input
                                                type="url"
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.affiliateUrl || ""}
                                                onChange={(e) => setEditForm({ ...editForm, affiliateUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Commission Rate *</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.commissionRate || ""}
                                                onChange={(e) => setEditForm({ ...editForm, commissionRate: e.target.value })}
                                                placeholder="e.g. 20% or $50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Country</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.country || ""}
                                                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                                                placeholder="🇺🇸 or USA"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">X Handle</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.xHandle || ""}
                                                onChange={(e) => setEditForm({ ...editForm, xHandle: e.target.value })}
                                                placeholder="@username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                            value={editForm.email || ""}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Logo (Base64)</label>
                                        <textarea
                                            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs min-h-[80px]"
                                            value={editForm.logoBase64 || ""}
                                            onChange={(e) => setEditForm({ ...editForm, logoBase64: e.target.value })}
                                            placeholder="data:image/png;base64,..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Affiliates Count</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.affiliatesCount || ""}
                                                onChange={(e) => setEditForm({ ...editForm, affiliatesCount: e.target.value })}
                                                placeholder="e.g. 100-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Payouts Total</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
                                                value={editForm.payoutsTotal || ""}
                                                onChange={(e) => setEditForm({ ...editForm, payoutsTotal: e.target.value })}
                                                placeholder="e.g. $10k-$50k"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">Additional Info</label>
                                        <textarea
                                            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] min-h-[80px]"
                                            value={editForm.additionalInfo || ""}
                                            onChange={(e) => setEditForm({ ...editForm, additionalInfo: e.target.value })}
                                            placeholder="Trust booster information..."
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-lg"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditForm({});
                                            }}
                                            className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start gap-6 mb-6">
                                        <div className="w-20 h-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {program.logoBase64 ? (
                                                <img src={program.logoBase64} alt={program.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-[var(--text-tertiary)]">{program.name[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{program.name}</h2>
                                            <p className="text-base text-[var(--text-secondary)] mb-3">{program.tagline}</p>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)]">
                                                    {program.category}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                                                    {program.commissionRate}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${program.status === "approved"
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : program.status === "pending"
                                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                            : "bg-red-500/10 text-red-500 border-red-500/20"
                                                    }`}>
                                                    {program.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                                        {program.description}
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        {program.websiteUrl && (
                                            <div>
                                                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Website</p>
                                                <a href={program.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] truncate block">
                                                    {new URL(program.websiteUrl).hostname}
                                                </a>
                                            </div>
                                        )}
                                        {program.country && (
                                            <div>
                                                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Country</p>
                                                <p className="text-sm text-[var(--text-primary)]">{program.country}</p>
                                            </div>
                                        )}
                                        {program.affiliatesCount && (
                                            <div>
                                                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Affiliates</p>
                                                <p className="text-sm text-[var(--text-primary)]">{program.affiliatesCount}</p>
                                            </div>
                                        )}
                                        {program.payoutsTotal && (
                                            <div>
                                                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Payouts</p>
                                                <p className="text-sm text-[var(--text-primary)]">{program.payoutsTotal}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3">
                                        {program.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(program.id)}
                                                    className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg"
                                                >
                                                    <HiCheck className="w-5 h-5" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(program.id)}
                                                    className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <HiXMark className="w-5 h-5" />
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleEdit(program)}
                                            className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium flex items-center gap-2 hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
                                        >
                                            <HiPencil className="w-4 h-4" />
                                            Edit
                                        </button>
                                        {program.status !== "pending" && (
                                            <button
                                                onClick={() => handleDecline(program.id)}
                                                className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                                            >
                                                <HiTrash className="w-4 h-4" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {programs.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-lg font-medium text-[var(--text-secondary)]">
                                {searchQuery ? "No programs match your search" : "No programs to review"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
