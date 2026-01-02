import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HiArrowUpRight, HiStar, HiChartBar, HiInformationCircle } from "react-icons/hi2";
import { Program } from "@/types";
import { isProgramNew, isProgramSponsored } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORY_ICONS } from "@/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { ProgramLogo } from "./ProgramLogo";
import styles from "./ProgramCard.module.css";

interface ProgramCardProps {
  program: Program;
  variant?: "row" | "card";
  rank?: number;
  highlightNew?: boolean;
  hideAction?: boolean;
}

export const ProgramCard = memo(function ProgramCard({
  program,
  variant = "row",
  rank,
  highlightNew = true,
  hideAction = false,
}: ProgramCardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    const url = `/programs/${program.slug || program.id}`;
    router.prefetch(url);
  };

  const isNew = mounted && highlightNew && isProgramNew(program.createdAt);
  const isSponsored = isProgramSponsored(program);

  const categoryIconName =
    CATEGORY_ICONS[program.category as keyof typeof CATEGORY_ICONS] || "HiCube";

  const Logo = (
    <ProgramLogo
      src={program.logoUrl}
      name={program.programName || "Unknown"}
      size={variant === "row" ? "md" : "lg"}
      priority={isSponsored || (rank !== undefined && rank <= 3)}
      className={variant === "row" ? styles.logoRow : styles.logoCard}
    />
  );

  const NewDot = isNew ? (
    <div className={styles.newDotWrapper}>
      <div
        className={`${styles.newDot} ${isSponsored ? styles.newDotSponsored : styles.newDotDefault
          }`}
      />
      <div className={styles.newDotTooltip}>
        <div className="flex items-center gap-2">
          <HiInformationCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>New Arrival (24h)</span>
        </div>
        <div className={styles.newDotArrow} />
      </div>
    </div>
  ) : null;

  const SponsoredBadge = isSponsored ? (
    <span className={styles.sponsoredBadge}>Sponsored</span>
  ) : null;

  const CommissionPill = (
    <div
      className={`${styles.commissionPill} ${isSponsored
        ? styles.commissionPillSponsored
        : styles.commissionPillDefault
        }`}
    >
      {program.commissionType === "FIXED" ? (
        <>
          <span className={styles.commissionRate}>${program.commissionRate ?? 0}</span>
          <span className={styles.commissionDuration}>per sale</span>
        </>
      ) : (
        <>
          <span className={styles.commissionRate}>{program.commissionRate ?? 0}%</span>
          <span className={styles.commissionDuration}>
            {program.commissionDuration === "Recurring" ? "recurring" : "one-time"}
          </span>
        </>
      )}
    </div>
  );

  if (variant === "row") {
    return (
      <Link
        href={`/programs/${program.slug || program.id}`}
        onMouseEnter={handleMouseEnter}
        className={`${styles.rowWrapper} ${isSponsored ? styles.rowWrapperSponsored : ""
          }`}
      >
        {NewDot}

        <div className={styles.rowGrid}>
          <div className={styles.rankCol}>
            {isSponsored ? (
              <HiStar className={styles.rankIcon} />
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className={styles.rankTooltipTrigger}>
                      {rank === 1 ? (
                        <span className={styles.rankMedal}>🥇</span>
                      ) : rank === 2 ? (
                        <span className={styles.rankMedal}>🥈</span>
                      ) : rank === 3 ? (
                        <span className={styles.rankMedal}>🥉</span>
                      ) : (
                        <span className={styles.rankNumber}>{rank}</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className={styles.tooltipContent}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                        <HiChartBar className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[12px] font-bold text-white">Trending Score</p>
                        <p className={styles.tooltipText}>
                          Based on <span className={styles.tooltipHighlight}>7-day</span> unique views, clicks, and CTR. New programs get a temporary boost.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className={styles.programInfoCol}>
            {Logo}
            <div className={styles.programInfoContent}>
              <div className={styles.programInfoHeader}>
                <h3
                  className={`${styles.programName} ${isSponsored ? styles.programNameSponsored : ""
                    } break-words`}
                >
                  {program.programName}
                </h3>
                {SponsoredBadge}
              </div>
              <p className={`${styles.programTagline} break-words`}>{program.tagline}</p>
            </div>
          </div>

          <div className={styles.categoryCol}>
            <span className={styles.categoryBadge}>
              <CategoryIcon
                iconName={categoryIconName}
                className={styles.categoryIcon}
              />
              {program.category}
            </span>
          </div>

          <div className={hideAction ? styles.commissionColExpanded : styles.commissionCol}>{CommissionPill}</div>

          {!hideAction && (
            <div className={styles.actionCol}>
              <HiArrowUpRight className={styles.actionIcon} />
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "card") {
    return (
      <Link
        href={`/programs/${program.slug || program.id}`}
        onMouseEnter={handleMouseEnter}
        className={styles.cardWrapper}
      >
        <div className={styles.cardContent}>
          {Logo}

          <div className="flex-1 min-w-0">
            <h3 className={`${styles.cardProgramName} break-words`}>{program.programName}</h3>

            <div className={styles.cardCategoryBadge}>
              <CategoryIcon
                iconName={categoryIconName}
                className={styles.cardCategoryIcon}
              />
              <span className={styles.cardCategoryText}>
                {program.category}
              </span>
            </div>
          </div>

          {program.commissionRate != null && (
            <div className={styles.cardCommission}>
              <div className={styles.cardCommissionRate}>
                {program.commissionType === "FIXED" ? `$${program.commissionRate}` : `${program.commissionRate}%`}
              </div>
              <div className={styles.cardCommissionLabel}>
                {program.commissionType === "FIXED" ? "per sale" : "commission"}
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return null;
});
