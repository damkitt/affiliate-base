import { useState, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import { Program } from "@/types";
import { CATEGORIES } from "@/constants";

const fetcher = (url: string) =>
    fetch(url).then(async (res) => {
        if (!res.ok) {
            const error = new Error("An error occurred while fetching the data.");
            // Attach extra info to the error object.
            (error as any).info = await res.json().catch(() => ({}));
            (error as any).status = res.status;
            throw error;
        }
        return res.json();
    });

export function usePrograms(initialData?: Program[]) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const lastTrackedSearch = useRef<string>("");

    // 1. Debounce the search term for the API key to avoid spamming the server
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // 2. Fetch programs (Server-side search if debouncedSearch is present)
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
            keepPreviousData: true
        }
    );

    const programs = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    // 3. Analytics: Track search queries with a longer debounce
    useEffect(() => {
        if (!search.trim() || search === lastTrackedSearch.current) return;

        const timer = setTimeout(() => {
            fetch("/api/track/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: search.trim(),
                    resultsCount: filteredPrograms.length,
                }),
            }).catch(() => { });

            lastTrackedSearch.current = search;
        }, 2000); // 2-second analytics debounce

        return () => clearTimeout(timer);
    }, [search, programs]);

    const availableCategories = useMemo(() => {
        const categories = new Set<string>();
        for (const p of programs) {
            if (p.category) categories.add(p.category);
        }
        return Array.from(categories).sort();
    }, [programs]);

    const visibleCategories = useMemo(() =>
        CATEGORIES.filter((cat) => availableCategories.includes(cat)),
        [availableCategories]
    );

    // 4. Client-side filtering (Final layer for category filtering)
    const filteredPrograms = useMemo(() => {
        return programs.filter((p) => {
            const matchesCategory = selectedCategory
                ? p.category === selectedCategory
                : true;
            return matchesCategory;
        });
    }, [programs, selectedCategory]);

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
