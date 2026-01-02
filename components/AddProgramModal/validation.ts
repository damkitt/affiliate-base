import { FormData } from "./types";
import { cleanAndValidateUrl } from "@/lib/url-validator";

export const validateEnglishInput = (value: string, allowEmoji = false): boolean => {
  const commonEmojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F3FB}-\u{1F3FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu;

  if (allowEmoji) {
    // If emojis are allowed, we remove them from the string before checking if the rest is valid English
    const cleanValue = value.replace(commonEmojiRegex, "");
    return /^[a-zA-Z0-9\s.,!?'"@#$%^&*()_+\-=[\]{};:|\\/<>\u2000-\u206F\u00A0-\u00BF]*$/.test(cleanValue);
  }

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
