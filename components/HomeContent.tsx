"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import AddProgramModal from "@/components/AddProgramModal";
import { Footer } from "@/components/Footer";
import { WhoopHero } from "@/components/WhoopHero";
import { usePrograms } from "@/hooks/usePrograms";
import { CategoryFilter } from "@/components/CategoryFilter";
import { RankingExplanation } from "@/components/RankingExplanation";
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
          <CategoryFilter
            categories={visibleCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <RankingExplanation />

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
