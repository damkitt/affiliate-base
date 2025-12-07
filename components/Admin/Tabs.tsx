interface TabsProps {
  activeTab: "pending" | "all" | "reports";
  pendingCount: number;
  allCount: number;
  reportsCount?: number;
  onTabChange: (tab: "pending" | "all" | "reports") => void;
}

export function Tabs({
  activeTab,
  pendingCount,
  allCount,
  reportsCount = 0,
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
      <button
        onClick={() => onTabChange("reports")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          activeTab === "reports"
            ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        Edits & Reports {reportsCount > 0 && `(${reportsCount})`}
      </button>
    </div>
  );
}
