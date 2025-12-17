import { Program } from "@/types";
import s from "./AdvertisingCardConfirm.module.css";
import { HiArrowUpRight, HiStar } from "react-icons/hi2";
import Image from "next/image";

const AdvertisingCardConfirm = ({
  program,
  onBack,
  onConfirm,
}: {
  program: Program;
  onBack: () => void;
  onConfirm: () => void;
}) => {
  console.log("AdvertisingCardConfirm program:", program);

  return (
    <div className={s.content}>
      <div className={s.container}>
        <div className={s.row}>
          <Dot />
          <HiStar className={s.rankIcon} />
          <Image
            src={program.logoUrl ?? "/default-logo.png"}
            width={512}
            height={512}
            className={s.programLogo}
            alt={program.programName ?? "Program Logo"}
          />
          <div className={s.col}>
            <h1>
              {program.programName}
              <div className={s.sponsored}>SPONSORED</div>
            </h1>
            <p>{program.description}</p>
          </div>
        </div>
        <div className={s.row}>
          <div className={s.category}>{program.category}</div>
          <div className={s.commission}>
            {program.commissionRate}%{" "}
            {program.commissionDuration?.toLowerCase() == "recurring"
              ? "Recurring"
              : "One-time"}
          </div>
          <HiArrowUpRight className={s.actionIcon} />
        </div>
      </div>

      <div className={s.buttonGroup}>
        <button onClick={onBack} className={s.backButton}>
          Back
        </button>
        <button onClick={onConfirm} className={s.confirmButton}>
          Confirm & Pay $299
        </button>
      </div>
    </div>
  );
};

export default AdvertisingCardConfirm;

const Dot = () => {
  return (
    <div className={s.newDotWrapper}>
      <div className={`${s.newDot} ${s.newDotSponsored}`} />
      <div className={s.newDotTooltip}>
        New Arrival (24h)
        <div className={s.newDotArrow} />
      </div>
    </div>
  );
};
