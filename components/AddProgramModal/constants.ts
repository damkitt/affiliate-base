import {
  HiRocketLaunch,
  HiDocumentText,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";
import { StepConfig, FormData } from "./types";

export const STEPS: StepConfig[] = [
  {
    id: 1,
    title: "Basic Info",
    description: "Logo, name & links",
    icon: HiRocketLaunch,
  },
  {
    id: 2,
    title: "Details",
    description: "Metrics & region",
    icon: HiDocumentText,
  },
  {
    id: 3,
    title: "Contact",
    description: "How to reach you",
    icon: HiChatBubbleLeftRight,
  },
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: 25 }, (_, i) => currentYear - i);

export const AFFILIATE_RANGES = [
  "0-100",
  "100-500",
  "500-1k",
  "1k-5k",
  "5k-10k",
  "10k+",
];

export const PAYOUT_RANGES = [
  "$0-$1k",
  "$1k-$10k",
  "$10k-$50k",
  "$50k-$100k",
  "$100k+",
];

export const APPROVAL_TIMES = ["1", "2-3", "3-5", "5-7", "7-14", "14+"];

export const INITIAL_FORM_DATA: FormData = {
  programName: "",
  tagline: "",
  description: "",
  category: "SaaS",
  websiteUrl: "",
  affiliateUrl: "",
  country: "",
  xHandle: "",
  email: "",
  logoUrl: "",
  commissionRate: "",
  commissionDuration: "",
  affiliatesCountRange: "",
  payoutsTotalRange: "",
  foundingMonth: "",
  foundingYear: "",
  additionalInfo: "",
  cookieDuration: "",
  payoutMethod: "",
  minPayoutValue: "",
  avgOrderValue: "",
  targetAudience: "",
  approvalTimeRange: "",
};
