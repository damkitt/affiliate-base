import { Program } from "@/types";
import s from "./AdvertisingCardConfirm.module.css";
import { ProgramCard } from "./ProgramCard";

const AdvertisingCardConfirm = ({
  program,
  onBack,
  onConfirm,
}: {
  program: Program;
  onBack: () => void;
  onConfirm: () => void;
}) => {
  /* 
    Force the program to look sponsored for the preview.
    We create a new object so we don't mutate the original.
  */
  const previewProgram = {
    ...program,
    isFeatured: true,
    featuredExpiresAt: new Date(Date.now() + 86400000 * 30), // +30 days
  } as Program;

  return (
    <div className={s.content}>
      <div className={s.containerWrapper} style={{ pointerEvents: 'none' }}>
        {/* We reuse the actual ProgramCard to guarantee 1:1 visual match */}
        <ProgramCard
          program={previewProgram}
          variant="row"
          rank={1} // Show rank #1 for the preview to look extra premium
          hideAction={true} // Hide the arrow since it's a preview
        />
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
