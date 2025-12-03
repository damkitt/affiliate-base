interface TabsProps {
  activeTab: "pending" | "all";
  pendingCount: number;
  allCount: number;
  onTabChange: (tab: "pending" | "all") => void;
}

export function Tabs({
  activeTab,
  pendingCount,
  allCount,
  onTabChange,
}: TabsProps) {
  return (
    <div className="flex gap-2 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] inline-flex">
      <button
        onClick={() => onTabChange("pending")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          activeTab === "pending"
            ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        Pending ({pendingCount})
      </button>
      <button
        onClick={() => onTabChange("all")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          activeTab === "all"
            ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        All Programs ({allCount})
      </button>
    </div>
  );
}
