import { FormData } from "./types";

export const validateEnglishInput = (value: string): boolean => {
  const regex = /^[a-zA-Z0-9\s.,!?'"@#$%^&*()_+\-=[\]{};:|\\/<>]*$/;
  return regex.test(value);
};

export const validateUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional fields)
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
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
