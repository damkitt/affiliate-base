import { HiCurrencyDollar, HiClock, HiMapPin } from "react-icons/hi2";
import { Program, CATEGORY_ICONS } from "@/types";
import { CategoryIcon } from "@/components/CategoryIcon";

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
    <div className="mb-10">
      {/* Hero Card */}
      <div className="relative rounded-xl p-6 md:p-8 bg-gradient-to-br from-[var(--accent)]/[0.02] to-transparent transition-all duration-300 animate-fade-in-up">
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Logo */}
          <div className="shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt={program.programName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-[var(--accent)]">${program.programName.charAt(
                    0
                  )}</span>`;
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent)]/5 mb-3">
              <CategoryIcon
                iconName={categoryIconName}
                className="w-3.5 h-3.5 text-[var(--accent)]"
              />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {program.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 leading-tight">
              {program.programName}
            </h1>

            {/* Tagline */}
            <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-6">
              {program.tagline}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <HiCurrencyDollar className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Commission
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {program.commissionRate}%
                  </div>
                </div>
              </div>

              {program.cookieDuration && (
                <div className="flex items-center gap-2.5">
                  <HiClock className="w-5 h-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Cookie Life
                    </div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {program.cookieDuration} days
                    </div>
                  </div>
                </div>
              )}

              {program.country && (
                <div className="flex items-center gap-2.5">
                  <HiMapPin className="w-5 h-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Availability
                    </div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {program.country}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onApplyClick}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Apply Now
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  if (program.websiteUrl) {
                    window.open(program.websiteUrl, "_blank");
                  }
                }}
                className="px-6 py-2.5 bg-[var(--bg)] text-[var(--text-primary)] rounded-lg font-medium border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Visit Website
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
