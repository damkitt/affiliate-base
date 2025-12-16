"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import AddProgramModal from "@/components/AddProgramModal";
import { Footer } from "@/components/Footer";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORY_ICONS } from "@/constants";
import { WhoopHero } from "@/components/WhoopHero";
import { usePrograms } from "@/hooks/usePrograms";
import type { Program } from "@/types";

interface HomeContentProps {
  initialPrograms: Program[];
}

export default function HomeContent({ initialPrograms }: HomeContentProps) {
  const {
    programs: filteredPrograms,
    isError: error,
    mutate,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    visibleCategories,
  } = usePrograms(initialPrograms);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    filteredPrograms;
    mutate();
  }, [mutate, filteredPrograms]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* New Whoop Style Background */}
      <WhoopHero />

      {/* Content wrapper with relative z-index to sit on top */}
      <div className="relative z-10">
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
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${
                    selectedCategory === null
                      ? "text-white border-transparent scale-105"
                      : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)]"
                  }`}
                  style={
                    selectedCategory === null
                      ? {
                          background: "var(--accent-gradient-dark)",
                          boxShadow: "var(--shadow-md)",
                        }
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
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : category)
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${
                        isSelected
                          ? "text-white border-transparent scale-105"
                          : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)]"
                      }`}
                      style={
                        isSelected
                          ? {
                              background: "var(--accent-gradient-dark)",
                              boxShadow: "var(--shadow-md)",
                            }
                          : { boxShadow: "var(--shadow-sm)" }
                      }
                    >
                      <CategoryIcon
                        iconName={iconName}
                        className="w-3.5 h-3.5"
                      />
                      <span>{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rating Explanation */}
          <div className="text-center mb-6 mt-[-10px]">
            <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">
              Ranked by{" "}
              <span className="text-[var(--text-secondary)] font-medium">
                engagement
              </span>
              ,{" "}
              <span className="text-[var(--text-secondary)] font-medium">
                quality
              </span>{" "}
              &{" "}
              <span className="text-[var(--text-secondary)] font-medium">
                popularity
              </span>
              . New programs get a temporary boost.
            </p>
          </div>

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
    </div>
  );
}
