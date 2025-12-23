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
import { generateFingerprint } from "@/lib/fingerprint";

type AvailabilityData = {
  isFull: boolean;
  count?: number;
  max?: number;
  nextAvailableDate?: string;
};

export function AdvertiseFlow() {
  const [state, setState] = useState({ step: 0, selectedProgram: null as Program | null, data: null as AvailabilityData | null, loading: true, initialized: false });

  useEffect(() => {
    fetch("/api/featured/availability").then(res => res.json()).then(data => setState(s => ({ ...s, data, loading: false })));
    const query = new URLSearchParams(window.location.search);
    const step = parseInt(query.get("step") || "0", 10);
    const programId = query.get("program");
    if (step === 2 && programId) {
      fetch(`/api/programs/${programId}`).then(res => res.json()).then(selectedProgram => setState(s => ({ ...s, step, selectedProgram, initialized: true })));
    } else setState(s => ({ ...s, step: isNaN(step) ? 0 : step, initialized: true }));
  }, []);

  useEffect(() => {
    if (!state.initialized) return;
    const query = new URLSearchParams(window.location.search);
    query.set("step", state.step.toString());
    state.selectedProgram ? query.set("program", state.selectedProgram.id) : query.delete("program");
    window.history.replaceState(null, "", `${window.location.pathname}?${query.toString()}`);
  }, [state.step, state.selectedProgram, state.initialized]);

  const handlePlanSelect = async () => {
    setState(s => ({ ...s, step: 1 }));
    try {
      const fp = await generateFingerprint();
      fetch("/api/analytics/collect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fingerprint: fp, url: "/advertise/start-flow", referer: window.location.href }) });
    } catch { }
  };

  const { handleConfirm } = useAdvertiseFlowFetch(state.selectedProgram);
  if (!state.initialized || (state.step === 2 && !state.selectedProgram)) return <div className={styles.container}><div className={styles.loaderWrapper}><div className={styles.loader}><HiStar className={styles.loaderIcon} /></div><p className={styles.loaderText}>Loading...</p></div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${(state.step / 2) * 100}%` }} /></div>
      <div className={styles.content}>
        {state.step === 0 && <PricingStep onSelect={handlePlanSelect} data={state.data} loading={state.loading} />}
        {state.step === 1 && <SelectionStep onSelect={p => setState(s => ({ ...s, selectedProgram: p, step: 2 }))} />}
        {state.step === 2 && state.selectedProgram && <PreviewStep program={state.selectedProgram} onConfirm={handleConfirm} onBack={() => setState(s => ({ ...s, step: 1 }))} />}
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
            <span>Guaranteed Top 3 Placement</span>
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
              {data.nextAvailableDate && (
                <p className={styles.nextAvailableText}>
                  Next slot available: {new Date(data.nextAvailableDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
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
