import { useState, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import { Program } from "@/types";
import { CATEGORIES } from "@/constants";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const error = new Error("An error occurred while fetching the data.");
      throw error;
    }
    return res.json();
  });

export function usePrograms(
  initialData?: Program[],
  initialCategory: string | null = null,
  activeCategories: string[] = []
) {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const lastTrackedSearch = useRef<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search?.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const isInitialRequest = useMemo(() => {
    return selectedCategory === initialCategory && (!search || search.trim() === "");
  }, [selectedCategory, initialCategory, search]);

  const { data, error, mutate: swrMutate, isValidating } = useSWR<Program[]>(
    debouncedSearch
      ? `/api/programs?search=${encodeURIComponent(debouncedSearch)}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ""}`
      : selectedCategory
        ? `/api/programs?category=${encodeURIComponent(selectedCategory)}`
        : "/api/programs",
    fetcher,
    {
      fallbackData: isInitialRequest ? initialData : undefined,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 1000, // Much snappier re-validation for SPA feel
      keepPreviousData: true,
    }
  );

  // Manually update document title for instant SPA-style navigation
  useEffect(() => {
    if (selectedCategory) {
      document.title = `Best ${selectedCategory} Affiliate Programs — AffiliateBase`;
    } else {
      document.title = "AffiliateBase — Curated SaaS Affiliate Programs";
    }
  }, [selectedCategory]);

  // Sync cache if initialData changes (Next.js route data update)
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      swrMutate(initialData, false);
    }
  }, [initialData, swrMutate]);

  const programs = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [persistentPrograms, setPersistentPrograms] = useState<Program[]>(initialData || []);

  // Update persistent programs only when new data is successfully fetched
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setPersistentPrograms(data);
    }
  }, [data]);

  // Now that the API handles category filtering, filteredPrograms is essentially the same as programs, 
  // but we keep the memo for consistency or for additional local-only logic if needed.
  const filteredPrograms: Program[] = useMemo(() =>
    (data && Array.isArray(data)) ? data : persistentPrograms,
    [data, persistentPrograms]);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch === lastTrackedSearch.current)
      return;

    fetch("/api/track/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: debouncedSearch,
        resultsCount: filteredPrograms.length,
      }),
    }).catch(() => { });

    lastTrackedSearch.current = debouncedSearch;
  }, [debouncedSearch, filteredPrograms]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    for (const p of programs) {
      if (p.category) categories.add(p.category);
    }
    return Array.from(categories).sort();
  }, [programs]);

  const visibleCategories = useMemo(() => {
    // If activeCategories are passed from server, use them as the stable set.
    // Otherwise fallback to whatever is in the current programs.
    if (activeCategories && activeCategories.length > 0) {
      return CATEGORIES.filter(cat => activeCategories.includes(cat));
    }
    return CATEGORIES.filter((cat) => availableCategories.includes(cat));
  }, [activeCategories, availableCategories]);

  return {
    programs: filteredPrograms,
    allPrograms: programs,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    visibleCategories,
    isLoading: !error && !data && !isInitialRequest,
    isValidating,
    isError: error,
    mutate: swrMutate,
  };
}
