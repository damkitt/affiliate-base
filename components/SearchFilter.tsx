import { CATEGORIES, CATEGORY_ICONS } from "@/types";
import { CategoryIcon } from "@/components/CategoryIcon";

interface SearchFilterProps {
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
    availableCategories: string[];
}

export function SearchFilter({
    selectedCategory,
    setSelectedCategory,
    availableCategories,
}: SearchFilterProps) {
    const visibleCategories = CATEGORIES.filter(cat => availableCategories.includes(cat));

    if (visibleCategories.length === 0) return null;

    return (
        <div className="max-w-[800px] mx-auto px-6 mb-8">
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${selectedCategory === null
                            ? "bg-[var(--text-primary)] text-[var(--bg)] border-transparent shadow-md scale-105"
                            : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        }`}
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
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${isSelected
                                    ? "bg-[var(--text-primary)] text-[var(--bg)] border-transparent shadow-md scale-105"
                                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            <CategoryIcon iconName={iconName} className="w-3.5 h-3.5" />
                            <span>{category}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
