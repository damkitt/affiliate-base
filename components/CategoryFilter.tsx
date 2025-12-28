"use client";

import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORY_ICONS } from "@/constants";

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
}

export const CategoryFilter = ({
    categories,
    selectedCategory,
    onSelectCategory,
}: CategoryFilterProps) => {
    if (categories.length === 0) return null;

    return (
        <div className="max-w-[800px] mx-auto px-6 mb-8">
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                    onClick={() => onSelectCategory(null)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${selectedCategory === null
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
                {categories.map((category) => {
                    const iconName = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || "HiCube";
                    const isSelected = selectedCategory === category;
                    return (
                        <button
                            key={category}
                            onClick={() => onSelectCategory(isSelected ? null : category)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${isSelected
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
                            <CategoryIcon iconName={iconName} className="w-3.5 h-3.5" />
                            <span>{category}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
