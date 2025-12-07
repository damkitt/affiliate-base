"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { Program } from "@/types";
import AddProgramModal from "@/components/AddProgramModal";
import { generateFakePrograms } from "@/lib/fakePrograms";
import { Footer } from "@/components/Footer";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORIES, CATEGORY_ICONS } from "@/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error, mutate } = useSWR<Program[]>(
    "/api/programs",
    fetcher
  );

  // Ensure programs is always an array and add fake programs
  const programs = useMemo(() => {
    const realPrograms = Array.isArray(data) ? data : [];
    const fakePrograms = generateFakePrograms(30);
    return [...realPrograms, ...fakePrograms];
  }, [data]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive available categories from data (sorted for consistent hydration)
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    for (const p of programs) {
      if (p.category) categories.add(p.category);
    }
    return Array.from(categories).sort();
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

  const visibleCategories = CATEGORIES.filter((cat) =>
    availableCategories.includes(cat)
  );

  return (
    <div className="min-h-screen pb-20">
      <Header
        onAddProgram={() => setIsModalOpen(true)}
        search={search}
        setSearch={setSearch}
      />

      <main className="animate-fade-in-up delay-100">
        {/* Search Filter Inlined */}
        {visibleCategories.length > 0 && (
          <div className="max-w-[800px] mx-auto px-6 mb-8">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${selectedCategory === null
                  ? "text-white border-transparent scale-105"
                  : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)]"
                  }`}
                style={
                  selectedCategory === null
                    ? { background: "var(--accent-gradient-dark)", boxShadow: "var(--shadow-md)" }
                    : { boxShadow: "var(--shadow-sm)" }
                }
              >
                All
              </button>
              {visibleCategories.map((category) => {
                const iconName = CATEGORY_ICONS[category] || "HiCube";
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(isSelected ? null : category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${isSelected
                      ? "text-white border-transparent scale-105"
                      : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)]"
                      }`}
                    style={
                      isSelected
                        ? { background: "var(--accent-gradient-dark)", boxShadow: "var(--shadow-md)" }
                        : { boxShadow: "var(--shadow-sm)" }
                    }
                  >
                    <CategoryIcon iconName={iconName} className="w-3.5 h-3.5" />
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            Failed to load programs. Please try again later.
          </div>
        )}

        <Leaderboard programs={filteredPrograms} />
      </main>

      <AddProgramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
      />

      <Footer onAddProgram={() => setIsModalOpen(true)} />
    </div>
  );
}