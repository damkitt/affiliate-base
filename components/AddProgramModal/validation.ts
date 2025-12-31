import { FormData } from "./types";
import { cleanAndValidateUrl } from "@/lib/url-validator";

export const validateEnglishInput = (value: string): boolean => {
  // Relaxed regex to allow smart quotes, dashes, ellipsis, and other common punctuation
  // \u2000-\u206F covers General Punctuation (smart quotes, dashes, bullets, etc.)
  // \u00A0-\u00BF covers Latin-1 Supplement (currency, fractions, etc.)
  const regex = /^[a-zA-Z0-9\s.,!?'"@#$%^&*()_+\-=[\]{};:|\\/<>\u2000-\u206F\u00A0-\u00BF]*$/;
  return regex.test(value);
};

export const validateUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional fields)
  try {
    cleanAndValidateUrl(url);
    return true;
  } catch {
    return false;
  }
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Empty is valid (optional)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const shouldValidateField = (fieldName: string): boolean => {
  const fieldsToValidate = [
    "programName",
    "tagline",
    "description",
    "additionalInfo",
    "commissionRate",
    "commissionType",
    "commissionDuration",
    "targetAudience",
    "minPayoutValue",
    "avgOrderValue",
    "cookieDuration",
    "payoutMethod",
  ];
  return fieldsToValidate.includes(fieldName);
};

export const canProceedToStep = (step: number, formData: FormData): boolean => {
  if (step === 2) {
    return !!(
      formData.programName &&
      formData.logoUrl &&
      formData.websiteUrl &&
      validateUrl(formData.websiteUrl) &&
      formData.affiliateUrl &&
      validateUrl(formData.affiliateUrl)
    );
  }
  if (step === 3) {
    return !!(
      formData.programName &&
      formData.logoUrl &&
      formData.websiteUrl &&
      validateUrl(formData.websiteUrl) &&
      formData.affiliateUrl &&
      validateUrl(formData.affiliateUrl) &&
      formData.commissionRate &&
      !Number.isNaN(Number(formData.commissionRate))
    );
  }
  return true;
};

export const canSubmitForm = (formData: FormData): boolean => {
  return !!(
    formData.programName &&
    formData.logoUrl &&
    formData.websiteUrl &&
    validateUrl(formData.websiteUrl) &&
    formData.affiliateUrl &&
    validateUrl(formData.affiliateUrl) &&
    formData.commissionRate &&
    !Number.isNaN(Number(formData.commissionRate)) &&
    (!formData.email || validateEmail(formData.email))
  );
};
