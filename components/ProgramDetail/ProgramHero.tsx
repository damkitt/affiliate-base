import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Program } from "@/types";
import { CATEGORY_ICONS } from "@/constants";

interface ProgramHeroProps {
  readonly program: Program;
  readonly onApplyClick: () => void;
}

export function ProgramHero({ program, onApplyClick }: ProgramHeroProps) {
  const logoSrc =
    program.logoUrl ||
    `https://www.google.com/s2/favicons?domain=${program.websiteUrl}&sz=128`;
  const categoryIconName = CATEGORY_ICONS[program.category] || "HiCube";

  return (
    <div className="mb-8">
      {/* Hero Card */}
      <div
        className="relative rounded-xl p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border)]"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt={program.programName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-[var(--accent-solid)]">${program.programName.charAt(
                    0
                  )}</span>`;
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Top row: Category + Actions */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent-dim)] border border-[var(--accent-solid)]/20">
                <CategoryIcon
                  iconName={categoryIconName}
                  className="w-3.5 h-3.5 text-[var(--accent-solid)]"
                />
                <span className="text-xs font-medium text-[var(--accent-solid)]">
                  {program.category}
                </span>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() =>
                    program.websiteUrl &&
                    window.open(program.websiteUrl, "_blank")
                  }
                  className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent-solid)] hover:bg-[var(--bg-secondary)] transition-all"
                  title="Visit Website"
                >
                  <HiArrowTopRightOnSquare className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <button
                  onClick={onApplyClick}
                  className="px-5 py-2 text-white rounded-lg font-semibold transition-all hover:opacity-90"
                  style={{ background: "var(--accent-gradient-dark)" }}
                >
                  Apply Now
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
              {program.programName}
            </h1>

            {/* Tagline */}
            <p className="text-[var(--text-secondary)] mb-4 line-clamp-2">
              {program.tagline}
            </p>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={onApplyClick}
                className="flex-1 py-2.5 text-white rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--accent-gradient-dark)" }}
              >
                Apply Now
              </button>
              <button
                onClick={() =>
                  program.websiteUrl &&
                  window.open(program.websiteUrl, "_blank")
                }
                className="p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent-solid)] transition-all"
              >
                <HiArrowTopRightOnSquare className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
