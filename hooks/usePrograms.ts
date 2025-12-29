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

export function usePrograms(initialData?: Program[]) {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const lastTrackedSearch = useRef<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search?.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, error, mutate } = useSWR<Program[]>(
    debouncedSearch
      ? `/api/programs?search=${encodeURIComponent(debouncedSearch)}`
      : "/api/programs",
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }
  );

  const programs = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const filteredPrograms: Program[] = useMemo(() => {
    return programs.filter((p) => {
      const matchesCategory = selectedCategory
        ? p.category === selectedCategory
        : true;
      return matchesCategory;
    });
  }, [programs, selectedCategory]);

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
    }).catch(() => {});

    lastTrackedSearch.current = debouncedSearch;
  }, [debouncedSearch, filteredPrograms]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    for (const p of programs) {
      if (p.category) categories.add(p.category);
    }
    return Array.from(categories).sort();
  }, [programs]);

  const visibleCategories = useMemo(
    () => CATEGORIES.filter((cat) => availableCategories.includes(cat)),
    [availableCategories]
  );

  return {
    programs: filteredPrograms,
    allPrograms: programs,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    visibleCategories,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
