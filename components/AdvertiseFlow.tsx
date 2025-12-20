"use client";

import { useState, useEffect } from "react";
import { HiCheck, HiStar, HiMagnifyingGlass, HiCubeTransparent } from "react-icons/hi2";
import Image from "next/image";
import { Program } from "@/types";
import useSWR from "swr";
import AddProgramModal from "./AddProgramModal";
import { ProgramCard } from "./ProgramCard";
import styles from "./AdvertiseFlow.module.css";
import { config } from "@/config";
import { useAdvertiseFlowFetch } from "@/hooks/useAdvertiseFlowFetch";
import AdvertisingCardConfirm from "./AdvertisingCardConfirm";

type AvailabilityData = {
  isFull: boolean;
  count?: number;
  max?: number;
};

export function AdvertiseFlow() {
  const [step, setStep] = useState<number>(0);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/featured/availability", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch availability:", err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const stepParam = query.get("step");
    const programParam = query.get("program");

    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (!isNaN(stepNumber) && stepNumber >= 0 && stepNumber <= 2) {
        setStep(stepNumber);

        if (stepNumber === 2 && programParam) {
          fetch(`/api/programs/${programParam}`)
            .then((res) => res.json())
            .then((programData) => setSelectedProgram(programData))
            .catch((err) => console.error("Failed to fetch program:", err))
            .finally(() => setIsInitialized(true));
          return;
        }
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const query = new URLSearchParams(window.location.search);
    query.set("step", step.toString());

    if (step === 2 && selectedProgram) {
      query.set("program", selectedProgram.id);
    } else {
      query.delete("program");
    }

    const newUrl = `${window.location.pathname}?${query.toString()}${window.location.hash
      }`;
    window.history.replaceState(null, "", newUrl);
  }, [step, selectedProgram, isInitialized]);

  const handlePlanSelect = () => setStep(1);

  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 1) {
      setStep(0);
    }
  };

  const progressWidth = step === 1 ? "33%" : step === 2 ? "66%" : "0%";

  const { handleConfirm } = useAdvertiseFlowFetch(selectedProgram);

  const isLoading = !isInitialized || (step === 2 && !selectedProgram);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loaderWrapper}>
          <div className={styles.loader}>
            <div className={styles.loaderRing} />
            <HiStar className={styles.loaderIcon} />
          </div>
          <p className={styles.loaderText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: progressWidth }} />
      </div>

      <div className={styles.content}>
        {step === 0 && (
          <div className={styles.stepWrapper}>
            <PricingStep
              onSelect={handlePlanSelect}
              data={data ?? null}
              loading={loading}
            />
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
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PricingStep({
  onSelect,
  data,
  loading,
}: {
  onSelect: () => void;
  data: AvailabilityData | null;
  loading: boolean;
}) {
  const isFull = data?.isFull;

  return (
    <div className={styles.pricingStep}>
      {/* Vertical Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.logoWrapper}>
          <Image
            src="/default-logo.png"
            alt="Logo"
            width={64}
            height={64}
            className={styles.logoImage}
          />
        </div>
        <span className={styles.brandName}>
          Affiliate <span className={styles.brandHighlight}>Base</span>
        </span>
      </div>

      <h1 className={styles.title}>Recruit Partners, Not Leads.</h1>
      <p className={styles.description}>
        Stop paying for single clicks. Get discovered by creators who bring you
        thousands of customers. Secure the top spot.
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
            <span>Permanent Rank #1, #2, or #3</span>
          </li>
          <li className={styles.featureItem}>
            <HiCheck className={styles.featureIcon} />
            <span>Premium Gold Highlight & Badge</span>
          </li>
          <li className={styles.featureItem}>
            <HiCheck className={styles.featureIcon} />
            <span>5x Higher Click-Through Rate</span>
          </li>
          <li className={styles.featureItem}>
            <HiCheck className={styles.featureIcon} />
            <span>Seen by 100% of Visitors</span>
          </li>
        </ul>

        {data && !loading ? (
          isFull ? (
            <div className={styles.soldOutWrapper}>
              <div className={styles.soldOutBanner}>
                All 3 slots are currently taken
              </div>
              <button disabled className={styles.soldOutButton}>
                Sold Out
              </button>
            </div>
          ) : (
            <button onClick={onSelect} className={styles.primaryButton}>
              Get Sponsored
              <span className={styles.slotsLeft}>
                ({config.advertising.maxSlots - (data.count ?? 0)} of{" "}
                {config.advertising.maxSlots} slots left)
              </span>
            </button>
          )
        ) : (
          <div className={styles.loadingText}>Loading availability...</div>
        )}
      </div>
      <p className={styles.guaranteeText}>
        One-time payment. Valid for 30 days. No auto-renewal.
      </p>
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
        </div>

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
                    {program.commissionRate}%{" "}
                    {program.commissionDuration?.toLowerCase() == "recurring"
                      ? "Recurring"
                      : "One-time"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className={styles.addProgramCta}>
          <button
            onClick={() => setShowAddModal(true)}
            className={styles.addProgramButton}
          >
            <span>Don&apos;t see your program? Add it first</span>
          </button>
        </div>
      </div>

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
      <AdvertisingCardConfirm
        program={program}
        onBack={onBack}
        onConfirm={onConfirm}
      />
    </div>
  );
}
