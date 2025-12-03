"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Header } from "@/components/Header";
import { SearchFilter } from "@/components/SearchFilter";
import { Leaderboard } from "@/components/Leaderboard";
import { Program } from "@/types";
import AddProgramModal from "@/components/AddProgramModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error, isLoading, mutate } = useSWR<Program[]>(
    "/api/programs",
    fetcher
  );

  // Ensure programs is always an array
  const programs = Array.isArray(data) ? data : [];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive available categories from data
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    for (const p of programs) {
      if (p.category) categories.add(p.category);
    }
    return Array.from(categories);
  }, [programs]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchesSearch =
        p.programName.toLowerCase().includes(search.toLowerCase()) ||
        p.tagline.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = selectedCategory
        ? p.category === selectedCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [programs, search, selectedCategory]);

  return (
    <div className="min-h-screen pb-20">
      <Header
        onAddProgram={() => setIsModalOpen(true)}
        search={search}
        setSearch={setSearch}
      />

      <main className="animate-fade-in-up delay-100">
        <SearchFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          availableCategories={availableCategories}
        />

        {error && (
          <div className="text-center py-8 text-red-500">
            Failed to load programs. Please try again later.
          </div>
        )}

        <Leaderboard programs={filteredPrograms} isLoading={isLoading} />
      </main>

      <AddProgramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}