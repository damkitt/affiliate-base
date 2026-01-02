import { FormData, COUNTRY_CODE_MAP, CountryCode } from "./types";
import { MONTHS } from "./constants";
import { cleanAndValidateUrl } from "@/lib/url-validator";

export const calculateStartupAge = (
  foundingMonth: string,
  foundingYear: string
): number | null => {
  if (!foundingMonth || !foundingYear) return null;

  const foundingDate = new Date(
    Number.parseInt(foundingYear),
    MONTHS.indexOf(foundingMonth)
  );
  const now = new Date();
  const months =
    (now.getFullYear() - foundingDate.getFullYear()) * 12 +
    (now.getMonth() - foundingDate.getMonth());

  return Math.max(0, months);
};

const getCountryCode = (countryName: string): CountryCode => {
  return COUNTRY_CODE_MAP[countryName] || "Other";
};

export const buildPayload = (formData: FormData) => {
  return {
    programName: formData.programName,
    tagline: formData.tagline || "No tagline provided.",
    description: formData.description || "No description provided.",
    category: formData.category,
    websiteUrl: cleanAndValidateUrl(formData.websiteUrl),
    affiliateUrl: cleanAndValidateUrl(formData.affiliateUrl),
    country: formData.country ? getCountryCode(formData.country) : "Other",
    xHandle: formData.xHandle || null,
    email: formData.email || null,
    logoUrl: formData.logoUrl || null,
    commissionRate: Number.parseInt(formData.commissionRate) || 0,
    commissionType: formData.commissionType,
    commissionDuration: formData.commissionDuration || null,
    cookieDuration: formData.cookieDuration
      ? Number.parseInt(formData.cookieDuration)
      : null,
    payoutMethod: formData.payoutMethod || null,
    minPayoutValue: formData.minPayoutValue
      ? Number.parseInt(formData.minPayoutValue)
      : null,
    avgOrderValue: formData.avgOrderValue
      ? Number.parseInt(formData.avgOrderValue)
      : null,
    targetAudience: formData.targetAudience || null,
    additionalInfo: formData.additionalInfo || null,
    affiliatesCountRange: formData.affiliatesCountRange || null,
    payoutsTotalRange: formData.payoutsTotalRange || null,
    foundingDate:
      formData.foundingMonth && formData.foundingYear
        ? new Date(
          Number.parseInt(formData.foundingYear),
          MONTHS.indexOf(formData.foundingMonth)
        ).toISOString()
        : null,
    approvalTimeRange: formData.approvalTimeRange || null,
  };
};
