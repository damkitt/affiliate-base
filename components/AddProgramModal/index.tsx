import { AddProgramForm } from "./AddProgramForm";

interface AddProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddProgramModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProgramModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      <AddProgramForm
        onClose={onClose}
        onSuccess={onSuccess}
        isModal={true}
      />
    </div>
  );
}

