"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
    HiXMark,
    HiArrowRight,
    HiArrowLeft,
    HiCheck,
    HiSparkles,
} from "react-icons/hi2";
import type { FormData } from "./types";
import { STEPS, INITIAL_FORM_DATA } from "./constants";
import {
    validateEnglishInput,
    shouldValidateField,
    canProceedToStep,
    canSubmitForm,
} from "./validation";
import { buildPayload } from "./utils";
import { ProgressBar } from "./ProgressBar";
import { SuccessModal } from "./SuccessModal";
import { BasicInfoStep } from "./FormSteps/BasicInfoStep";
import { DetailsStep } from "./FormSteps/DetailsStep";
import { ContactStep } from "./FormSteps/ContactStep";

interface AddProgramFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    isModal?: boolean;
}

export function AddProgramForm({
    onClose,
    onSuccess,
    isModal = true,
}: AddProgramFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [slideDirection, setSlideDirection] = useState<"left" | "right">(
        "right"
    );
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (shouldValidateField(name) && !validateEnglishInput(value)) {
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setIsUploading(true);
        try {
            const uploadData = new window.FormData();
            uploadData.append("file", file);

            const response = await fetch("/api/upload/avatar", {
                method: "POST",
                body: uploadData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            setFormData((prev) => ({ ...prev, logoUrl: data.url }));
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload logo. Please try again.");
            setLogoPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 3 && canProceedToStep(currentStep + 1, formData)) {
            setSlideDirection("right");
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setSlideDirection("left");
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!canSubmitForm(formData)) return;

        setIsSubmitting(true);

        try {
            const payload = buildPayload(formData);

            const response = await fetch("/api/programs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(`Server returned non-JSON response`);
            }

            if (response.ok) {
                setFormData((prev) => ({ ...prev, slug: data.slug }));
                onSuccess?.();
                setShowSuccess(true);
            } else {
                alert(`Error: ${data.error || "Failed to create program"}`);
                setIsSubmitting(false);
            }
        } catch (error: any) {
            alert(`Error: ${error.message || "Network error. Please try again."}`);
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
        setLogoPreview(null);
        setCurrentStep(1);
        setShowSuccess(false);
    };

    const handleSuccessClose = () => {
        onClose();
        resetForm();
    };

    if (showSuccess) {
        return (
            <SuccessModal
                onClose={handleSuccessClose}
                programName={formData.programName}
                slug={formData.slug}
                logoUrl={formData.logoUrl}
            />
        );
    }

    return (
        <div className={`relative w-full ${isModal ? "max-w-2xl bg-[var(--bg-card)] backdrop-blur-2xl rounded-2xl shadow-[var(--shadow-premium)] max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn border border-[var(--border)]" : "bg-[var(--bg-card)] backdrop-blur-2xl rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden min-h-[600px]"}`}>
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
                {isModal && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-all duration-300 hover:rotate-90"
                    >
                        <HiXMark className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                )}

                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-dim)] rounded-full mb-3 border border-[var(--accent-solid)]/20">
                        <HiSparkles className="w-4 h-4 text-[var(--accent-solid)]" />
                        <span className="text-xs font-semibold text-[var(--accent-solid)]">
                            Add Program
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                        {STEPS[currentStep - 1].title}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {STEPS[currentStep - 1].description}
                    </p>
                </div>

                <ProgressBar steps={STEPS} currentStep={currentStep} />
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div
                    className={`min-h-full px-6 py-4 transition-all duration-500 ease-out ${slideDirection === "right"
                        ? "animate-slideInRight"
                        : "animate-slideInLeft"
                        }`}
                    key={currentStep}
                >
                    {currentStep === 1 && (
                        <BasicInfoStep
                            formData={formData}
                            logoPreview={logoPreview}
                            isUploading={isUploading}
                            fileInputRef={fileInputRef}
                            onFormChange={handleChange}
                            onLogoUpload={handleLogoUpload}
                            onCategorySelect={(category) =>
                                setFormData((prev) => ({ ...prev, category }))
                            }
                        />
                    )}

                    {currentStep === 2 && (
                        <DetailsStep
                            formData={formData}
                            onFormChange={handleChange}
                            onSetMonth={(month) =>
                                setFormData((prev) => ({ ...prev, foundingMonth: month }))
                            }
                            onSetYear={(year) =>
                                setFormData((prev) => ({ ...prev, foundingYear: year }))
                            }
                            onSetCountry={(country) =>
                                setFormData((prev) => ({ ...prev, country }))
                            }
                        />
                    )}

                    {currentStep === 3 && (
                        <ContactStep
                            formData={formData}
                            logoPreview={logoPreview}
                            onFormChange={handleChange}
                        />
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-[var(--border)]">
                <button
                    type="button"
                    onClick={currentStep === 1 ? onClose : handleBack}
                    className="h-10 px-4 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors duration-150 flex items-center gap-2"
                >
                    {currentStep === 1 ? (
                        isModal ? "Cancel" : "Discard"
                    ) : (
                        <>
                            <HiArrowLeft className="w-4 h-4" />
                            Back
                        </>
                    )}
                </button>

                {currentStep < 3 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceedToStep(currentStep + 1, formData)}
                        className={`h-10 px-5 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${canProceedToStep(currentStep + 1, formData)
                            ? "bg-[var(--accent-solid)] text-white hover:bg-[var(--accent-hover)] shadow-md"
                            : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed border border-[var(--border)]"
                            }`}
                    >
                        Continue
                        <HiArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !canSubmitForm(formData)}
                        className={`h-10 px-5 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${canSubmitForm(formData) && !isSubmitting
                            ? "bg-[var(--accent-solid)] text-white hover:bg-[var(--accent-hover)] shadow-md"
                            : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed border border-[var(--border)]"
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <HiCheck className="w-4 h-4" />
                                Add Program
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
