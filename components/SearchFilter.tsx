import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORIES, CATEGORY_ICONS } from "@/constants";

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
  const visibleCategories = CATEGORIES.filter((cat) =>
    availableCategories.includes(cat)
  );

  if (visibleCategories.length === 0) return null;

    return (
        <div className="max-w-[800px] mx-auto px-6 mb-8">
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${selectedCategory === null
                            ? "text-white border-transparent scale-105"
                            : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)]"
                        }`}
                    style={selectedCategory === null ? { background: 'var(--accent-gradient-dark)', boxShadow: 'var(--shadow-md)' } : { boxShadow: 'var(--shadow-sm)' }}
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
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${isSelected
                                    ? "text-white border-transparent scale-105"
                                    : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)]"
                                }`}
                            style={isSelected ? { background: 'var(--accent-gradient-dark)', boxShadow: 'var(--shadow-md)' } : { boxShadow: 'var(--shadow-sm)' }}
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
