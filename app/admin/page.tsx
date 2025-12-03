"use client";

import { useState } from "react";
import useSWR from "swr";
import type { Program } from "@/types";
import { AdminHeader } from "@/components/Admin/AdminHeader";
import { SearchBar } from "@/components/Admin/SearchBar";
import { Tabs } from "@/components/Admin/Tabs";
import { ProgramCard } from "@/components/Admin/ProgramCard";
import { EditForm } from "@/components/Admin/EditForm";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Program>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pendingPrograms = [], mutate: mutatePending } = useSWR<
    Program[]
  >("/api/admin/programs?status=pending", fetcher, { refreshInterval: 3000 });

  const { data: allPrograms = [], mutate: mutateAll } = useSWR<Program[]>(
    "/api/admin/programs",
    fetcher,
    { refreshInterval: 3000 }
  );

  const handleApprove = async (id: string) => {
    await fetch("/api/admin/programs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved" }),
    });
    mutatePending();
    mutateAll();
  };

  const handleDecline = async (id: string) => {
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
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    setEditForm({});
    mutatePending();
    mutateAll();
  };

  const handleEditChange = (field: keyof Program, value: unknown) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const filterPrograms = (programs: Program[]) => {
    if (!searchQuery) return programs;
    const query = searchQuery.toLowerCase();
    return programs.filter(
      (p) =>
        p.programName.toLowerCase().includes(query) ||
        p.tagline?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  };

  const programs = filterPrograms(
    activeTab === "pending" ? pendingPrograms : allPrograms
  );

  return (
    <div className="min-h-screen pb-20">
      <AdminHeader pendingCount={pendingPrograms.length} />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="mb-8">
          <Tabs
            activeTab={activeTab}
            pendingCount={pendingPrograms.length}
            allCount={allPrograms.length}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="space-y-6">
          {programs.map((program) => (
            <div
              key={program.id}
              className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-lg"
            >
              {editingId === program.id ? (
                <EditForm
                  program={editForm}
                  onChange={handleEditChange}
                  onSave={handleSaveEdit}
                  onCancel={() => {
                    setEditingId(null);
                    setEditForm({});
                  }}
                />
              ) : (
                <ProgramCard
                  program={program}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onEdit={handleEdit}
                />
              )}
            </div>
          ))}

          {programs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-medium text-[var(--text-secondary)]">
                {searchQuery
                  ? "No programs match your search"
                  : "No programs to review"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
