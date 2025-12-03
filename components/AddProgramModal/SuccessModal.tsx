import { HiCheck } from "react-icons/hi2";

interface SuccessModalProps {
  onClose: () => void;
}

export function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />
      <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center animate-scaleIn border border-[var(--border)]">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <HiCheck className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Program Submitted!
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Your affiliate program has been successfully added to the directory.
        </p>
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-[var(--accent-solid)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}
