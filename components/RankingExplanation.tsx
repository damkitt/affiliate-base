export const RankingExplanation = () => {
    return (
        <div className="text-center mb-6 mt-[-10px]">
            <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">
                Ranked by{" "}
                <span className="text-[var(--text-secondary)] font-medium">
                    engagement
                </span>
                ,{" "}
                <span className="text-[var(--text-secondary)] font-medium">
                    quality
                </span>{" "}
                &{" "}
                <span className="text-[var(--text-secondary)] font-medium">
                    popularity
                </span>
                . New programs get a temporary boost.
            </p>
        </div>
    );
};
