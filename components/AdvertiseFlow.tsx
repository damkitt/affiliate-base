"use client";

import { useState } from "react";
import { HiCheck, HiStar, HiMagnifyingGlass } from "react-icons/hi2";
import { Program } from "@/types";
import useSWR from "swr";
import AddProgramModal from "./AddProgramModal";
import { ProgramCard } from "./ProgramCard";
import styles from "./AdvertiseFlow.module.css";
import { config } from "@/config";
import { useAdvertiseFlowFetch } from "@/hooks/useAdvertiseFlowFetch";

export function AdvertiseFlow() {
  const [step, setStep] = useState<number>(0);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handlePlanSelect = () => {
    setStep(1);
  };

  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    setStep(2);
  };

  const progressWidth =
    step === 0 ? "0%" : step === 1 ? "33%" : step === 2 ? "66%" : "100%";

  const { handleConfirm } = useAdvertiseFlowFetch(selectedProgram);

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: progressWidth }} />
      </div>

      <div className={styles.content}>
        {step === 0 && (
          <div className={styles.stepWrapper}>
            <PricingStep onSelect={handlePlanSelect} />
          </div>
        )}
        {step === 1 && (
          <div className={styles.stepWrapper}>
            <SelectionStep onSelect={handleProgramSelect} />
          </div>
        )}
        {step === 2 && selectedProgram && (
          <div className={styles.stepWrapper}>
            <PreviewStep
              program={selectedProgram}
              onConfirm={handleConfirm}
              onBack={() => setStep(1)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PricingStep({ onSelect }: { onSelect: () => void }) {
  const { data: availability } = useSWR("/api/featured/availability", (url) =>
    fetch(url).then((r) => r.json())
  );

  const isFull = availability?.isFull;
  const nextDate = availability?.nextAvailable
    ? new Date(availability.nextAvailable).toLocaleDateString()
    : "soon";

  return (
    <div className={styles.pricingStep}>
      <div className={styles.iconWrapper}>
        <HiStar className={styles.iconLarge} />
      </div>
      <h2 className={styles.title}>Become a Sponsored Program</h2>
      <p className={styles.description}>
        Get premium visibility at the top of our leaderboard. Sponsored programs
        receive priority placement above organic listings, a distinctive
        &ldquo;Sponsored&rdquo; badge, and significantly more visibility from
        our targeted affiliate audience.
      </p>

      <div className={styles.pricingCard}>
        <div className={styles.limitedBadge}>LIMITED SLOTS</div>

        <div className={styles.planLabel}>MONTHLY SPONSORSHIP</div>
        <div className={styles.priceWrapper}>
          <span className={styles.price}>$299</span>
          <span className={styles.period}>/month</span>
        </div>

        <ul className={styles.featureList}>
          <li className={styles.featureItem}>
            <HiCheck className={styles.featureIcon} />
            <span>Top 3 placement on leaderboard</span>
          </li>
          <li className={styles.featureItem}>
            <HiCheck className={styles.featureIcon} />
            <span>&ldquo;Sponsored&rdquo; badge & premium styling</span>
          </li>
          <li className={styles.featureItem}>
            <HiCheck className={styles.featureIcon} />
            <span>5x more clicks than organic listings</span>
          </li>
          <li className={styles.featureItem}>
            <HiCheck className={styles.featureIcon} />
            <span>Priority support & detailed analytics</span>
          </li>
        </ul>

        {isFull ? (
          <div className={styles.soldOutWrapper}>
            <div className={styles.soldOutBanner}>
              All 3 slots are currently taken
            </div>
            <p className={styles.nextAvailable}>
              Next slot available on {nextDate}
            </p>
            <button disabled className={styles.soldOutButton}>
              Sold Out
            </button>
          </div>
        ) : (
          <button onClick={onSelect} className={styles.primaryButton}>
            Get Sponsored
            {availability && (
              <span className={styles.slotsLeft}>
                ({config.advertising.maxSlots - availability.count} of{" "}
                {config.advertising.maxSlots} slots left)
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectionStep({ onSelect }: { onSelect: (p: Program) => void }) {
  const { data: programs } = useSWR<Program[]>("/api/programs", (url: string) =>
    fetch(url).then((r) => r.json())
  );
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPrograms =
    search.length >= 2
      ? programs?.filter((p) => {
          const matchesSearch = p.programName
            .toLowerCase()
            .includes(search.toLowerCase());
          const isAlreadyFeatured =
            p.isFeatured &&
            p.featuredExpiresAt &&
            new Date(p.featuredExpiresAt) > new Date();
          return matchesSearch && !isAlreadyFeatured;
        })
      : [];

  return (
    <>
      <div className={styles.selectionStep}>
        <h2 className={styles.stepTitle}>Find Your Program</h2>
        <p className={styles.stepSubtitle}>
          Search for your affiliate program to sponsor it
        </p>

        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <HiMagnifyingGlass className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Type your program name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />

          {search.length >= 2 && (
            <div className={styles.resultsWrapper}>
              {!programs ? (
                <div className={styles.loadingText}>Loading...</div>
              ) : filteredPrograms?.length === 0 ? (
                <div className={styles.noResults}>
                  No programs found for &ldquo;{search}&rdquo;
                </div>
              ) : (
                filteredPrograms?.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => onSelect(program)}
                    className={styles.programRow}
                  >
                    <div className={styles.programLogo}>
                      {program.logoUrl ? (
                        <img src={program.logoUrl} alt={program.programName} />
                      ) : (
                        program.programName[0]
                      )}
                    </div>
                    <div className={styles.programInfo}>
                      <h3 className={styles.programName}>
                        {program.programName}
                      </h3>
                      <p className={styles.programUrl}>{program.websiteUrl}</p>
                    </div>
                    <div className={styles.programCommission}>
                      {program.commissionRate}%
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Program CTA */}
        {search.length === 0 && (
          <div className={styles.addProgramCta}>
            <button
              onClick={() => setShowAddModal(true)}
              className={styles.addProgramButton}
            >
              <span>Don&apos;t see your program? Add it first</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Program Modal */}
      {showAddModal && (
        <AddProgramModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

function PreviewStep({
  program,
  onConfirm,
  onBack,
}: {
  program: Program;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className={styles.previewStep}>
      <h2 className={styles.stepTitle}>Preview Your Sponsored Listing</h2>
      <p className={styles.stepSubtitle}>
        This is exactly how your program will appear on the leaderboard
      </p>

      {/* Preview Card */}
      <div className={styles.previewCard}>
        <ProgramCard program={program} variant="row" />
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={onBack} className={styles.backButton}>
          Back
        </button>
        <button onClick={onConfirm} className={styles.confirmButton}>
          Confirm & Pay $299
        </button>
      </div>
    </div>
  );
}
