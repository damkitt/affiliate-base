"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { Program } from "@/types";
import AddProgramModal from "@/components/AddProgramModal";
import { Footer } from "@/components/Footer";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORIES, CATEGORY_ICONS } from "@/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  // Fetch programs sorted by trendingScore (featured first)
  const { data, error, mutate } = useSWR<Program[]>(
    "/api/programs",
    fetcher
  );

  // Ensure programs is always an array
  const programs = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastTrackedSearch = useRef<string>("");

  // Track search queries with debounce (1 second)
  useEffect(() => {
    if (!search.trim() || search === lastTrackedSearch.current) return;

    const timer = setTimeout(() => {
      // Count results for this search
      const results = programs.filter((p) =>
        p.programName.toLowerCase().includes(search.toLowerCase()) ||
        p.tagline.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );

      // Track the search
      fetch("/api/track/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: search.trim(),
          resultsCount: results.length,
        }),
      }).catch(() => { }); // Silently fail

      lastTrackedSearch.current = search;
    }, 1000);

    return () => clearTimeout(timer);
  }, [search, programs]);

  // Derive available categories from data (sorted for consistent hydration)
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    for (const p of programs) {
      if (p.category) categories.add(p.category);
    }
    return Array.from(categories).sort();
  }, [programs]);

  // Filter programs by search and category
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
        {/* Category Filter */}
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

        {/* Program List (sorted by trendingScore, featured first) */}
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