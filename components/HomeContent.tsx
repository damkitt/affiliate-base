"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import AddProgramModal from "@/components/AddProgramModal";
import { Footer } from "@/components/Footer";
import { usePrograms } from "@/hooks/usePrograms";
import { CategoryFilter } from "@/components/CategoryFilter";
import { RankingExplanation } from "@/components/RankingExplanation";
import type { Program, Category } from "@/types";
import { getSlugFromCategory, getCategoryFromSlug } from "@/constants";
import { motion, AnimatePresence } from "framer-motion";

interface HomeContentProps {
  initialPrograms: Program[];
  initialCategory?: Category | null;
  activeCategories?: string[];
}

export default function HomeContent({
  initialPrograms,
  initialCategory = null,
  activeCategories = []
}: HomeContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    programs: filteredPrograms,
    isLoading,
    isValidating,
    isError: error,
    mutate,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    visibleCategories,
  } = usePrograms(initialPrograms, initialCategory, activeCategories);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for back/forward navigation to sync state
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const segments = path.split("/").filter(Boolean);
      let category: string | null = null;
      if (segments[0] === "category" && segments[1]) {
        category = getCategoryFromSlug(segments[1]);
      }
      setSelectedCategory(category);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setSelectedCategory]);

  // Sync state if initialCategory changes (on route completion)
  useEffect(() => {
    if (initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleCategorySelect = (category: string | null) => {
    // 1. INSTANT State Update
    setSelectedCategory(category);

    // 2. INSTANT URL Update (SPA Style - No RSC overhead)
    const slug = category ? getSlugFromCategory(category as Category) : null;
    const url = slug ? `/category/${slug}` : "/";
    window.history.pushState(null, "", url);

    // We still call a transition to signal background work if needed, 
    // but the UI is already updated.
    startTransition(() => {
      // Optional: warm up Next.js router cache without full navigation
      router.prefetch(url);
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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
            onSelectCategory={handleCategorySelect}
          />

          <RankingExplanation />

          {error && (
            <div className="text-center py-8 text-red-500">
              Failed to load programs. Please try again later.
            </div>
          )}

          {/* Program List (sorted by trendingScore, featured first) */}
          <Leaderboard programs={filteredPrograms} isPending={isPending || isLoading || isValidating} />
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
