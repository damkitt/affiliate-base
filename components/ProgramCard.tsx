"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiArrowUpRight, HiStar, HiChartBar, HiInformationCircle } from "react-icons/hi2";
import { Program } from "@/types";
import { isProgramNew } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORY_ICONS } from "@/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import styles from "./ProgramCard.module.css";

interface ProgramCardProps {
  program: Program;
  variant?: "row" | "card";
  rank?: number;
  highlightNew?: boolean;
}

export const ProgramCard = memo(function ProgramCard({
  program,
  variant = "row",
  rank,
  highlightNew = true,
}: ProgramCardProps) {
  const isNew = highlightNew && isProgramNew(program.createdAt);
  const isSponsored =
    program.isFeatured &&
    program.featuredExpiresAt &&
    new Date(program.featuredExpiresAt) > new Date();

  const categoryIconName =
    CATEGORY_ICONS[program.category as keyof typeof CATEGORY_ICONS] || "HiCube";

  const Logo = (
    <div
      className={`${styles.logo} ${variant === "row" ? styles.logoRow : styles.logoCard
        }`}
    >
      {program.logoUrl ? (
        <Image
          src={program.logoUrl}
          alt={program.programName}
          fill
          priority={isSponsored || (rank !== undefined && rank <= 3)}
          sizes="(max-width: 768px) 48px, 64px"
          className="object-cover"
        />
      ) : (
        <div
          className={`${styles.logoPlaceholder} ${variant === "card" ? styles.logoPlaceholderCard : ""
            }`}
        >
          {program.programName[0]}
        </div>
      )}
    </div>
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
      <span className={styles.commissionRate}>{program.commissionRate}%</span>
      <span className={styles.commissionDuration}>
        {program.commissionDuration === "Recurring" ? "recurring" : "one-time"}
      </span>
    </div>
  );

  if (variant === "row") {
    return (
      <Link
        href={`/programs/${program.slug || program.id}`}
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
                    }`}
                >
                  {program.programName}
                </h3>
                {SponsoredBadge}
              </div>
              <p className={styles.programTagline}>{program.tagline}</p>
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

          <div className={styles.commissionCol}>{CommissionPill}</div>

          <div className={styles.actionCol}>
            <HiArrowUpRight className={styles.actionIcon} />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "card") {
    return (
      <Link
        href={`/programs/${program.slug || program.id}`}
        className={styles.cardWrapper}
      >
        <div className={styles.cardContent}>
          {Logo}

          <div className="flex-1 min-w-0">
            <h3 className={styles.cardProgramName}>{program.programName}</h3>

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
                {program.commissionRate}%
              </div>
              <div className={styles.cardCommissionLabel}>commission</div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return null;
});
