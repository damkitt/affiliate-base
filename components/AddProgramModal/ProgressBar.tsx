import { HiCheck } from "react-icons/hi2";
import { StepConfig } from "./types";

interface ProgressBarProps {
  steps: StepConfig[];
  currentStep: number;
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="relative">
              <div
                className={`
                  rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    isCompleted
                      ? "w-10 h-10 bg-[var(--accent-solid)]"
                      : isCurrent
                      ? "w-10 h-10 bg-[var(--bg-card)] border-2 border-[var(--accent-solid)] ring-4 ring-[var(--accent-dim)]"
                      : "w-10 h-10 bg-[var(--bg-secondary)] border-2 border-[var(--border)]"
                  }
                `}
              >
                {isCompleted ? (
                  <HiCheck className="w-6 h-6 text-white animate-scaleIn" />
                ) : (
                  <StepIcon
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isCurrent
                        ? "text-[var(--accent-solid)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="w-12 h-[2px] mx-2 rounded-full overflow-hidden bg-[var(--border)]">
                <div
                  className={`h-full bg-[var(--accent-solid)] transition-all duration-500 ease-out ${
                    isCompleted ? "w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
