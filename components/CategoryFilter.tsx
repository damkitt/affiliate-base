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
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-regular transition-all duration-200 ${
            selectedCategory === null
              ? "text-white"
              : "text-[var(--text-primary)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)]"
          }`}
          style={
            selectedCategory === null
              ? {
                  background: "var(--accent-gradient-dark)",
                }
              : { background: "var(--bg-card)" }
          }
        >
          All
        </button>
        {categories.map((category) => {
          const iconName =
            CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || "HiCube";
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(isSelected ? null : category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-regular transition-all duration-200 ${
                isSelected
                  ? "text-white"
                  : "text-[var(--text-primary)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)]"
              }`}
              style={
                isSelected
                  ? {
                      background: "var(--accent-gradient-dark)",
                    }
                  : { background: "var(--bg-card)" }
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
