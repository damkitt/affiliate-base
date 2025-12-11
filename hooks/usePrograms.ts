import { useState, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import { Program } from "@/types";
import { CATEGORIES } from "@/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePrograms(initialData?: Program[]) {
    const { data, error, mutate } = useSWR<Program[]>("/api/programs", fetcher, {
        fallbackData: initialData,
        revalidateOnFocus: false,
        keepPreviousData: true
    });

    const programs = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const lastTrackedSearch = useRef<string>("");

    // Track search queries with debounce
    useEffect(() => {
        if (!search.trim() || search === lastTrackedSearch.current) return;

        const timer = setTimeout(() => {
            const resultsCount = programs.filter((p) =>
                p.programName.toLowerCase().includes(search.toLowerCase()) ||
                p.tagline.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase())
            ).length;

            fetch("/api/track/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: search.trim(),
                    resultsCount,
                }),
            }).catch(() => { });

            lastTrackedSearch.current = search;
        }, 1000);

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

    return {
        programs: filteredPrograms, // Return filtered list as main 'programs'
        allPrograms: programs,      // Raw list if needed
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
