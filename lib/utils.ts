import { VALID_COUNTRIES } from "@/constants";
import { CreateProgramBody, ValidCountry } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NavigatorWithExtras } from "@/types";
import {
  getAudioFingerprint,
  getCanvasFingerprint,
  getWebGLRenderer,
} from "./fingerprint";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateCountry(country: string | undefined): ValidCountry {
  if (country && VALID_COUNTRIES.includes(country as ValidCountry)) {
    return country as ValidCountry;
  }
  return "Other";
}

export function validateCreateBody(body: CreateProgramBody) {
  if (!body) return false;

  const { programName, websiteUrl, affiliateUrl } = body;

  return programName?.trim() && websiteUrl?.trim() && affiliateUrl?.trim();
}

export async function collectFingerprintComponents(): Promise<string[]> {
  const components: string[] = [
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.userAgent.trim(),
    String(navigator.hardwareConcurrency || 0),
    String((navigator as NavigatorWithExtras).deviceMemory || 0),
    String(navigator.maxTouchPoints || 0),
    getWebGLRenderer(),
    getCanvasFingerprint(),
    await getAudioFingerprint(),
  ];

  return components;
}
