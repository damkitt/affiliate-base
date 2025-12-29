import crypto from "crypto";

import { getCountryFlag, getFullCountryName } from "./country-helpers";

export { getCountryFlag, getFullCountryName };

type TLog = {
  visitorId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export function getStableIdentity(log: TLog): string {
  if (log.visitorId) return String(log.visitorId);

  const data = `${log.ip || "anon"}-${log.userAgent || "no-ua"}`;
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
    .substring(0, 16);
}

export function parseUserAgent(ua: string | null) {
  if (!ua) return { os: "Other", device: "Desktop" };

  const lowerUA = ua.toLowerCase();
  let os = "Other";
  let device = "Desktop";

  if (lowerUA.includes("windows")) os = "Windows";
  else if (lowerUA.includes("mac os x")) {
    if (lowerUA.includes("iphone") || lowerUA.includes("ipad")) os = "iOS";
    else os = "macOS";
  } else if (lowerUA.includes("android")) os = "Android";
  else if (lowerUA.includes("linux")) os = "Linux";
  else if (lowerUA.includes("ios") || lowerUA.includes("iphone")) os = "iOS";

  if (
    lowerUA.includes("mobile") ||
    lowerUA.includes("iphone") ||
    (lowerUA.includes("android") && lowerUA.includes("mobile"))
  ) {
    device = "Mobile";
  } else if (
    lowerUA.includes("ipad") ||
    lowerUA.includes("tablet") ||
    (lowerUA.includes("android") && !lowerUA.includes("mobile"))
  ) {
    device = "Tablet";
  }

  return { os, device };
}

export function getDateRange(range: "24h" | "7d" | "30d"): Date {
  const now = new Date();
  switch (range) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

export function parseReferrer(referer: string | null): {
  name: string;
  domain: string | null;
} {
  if (!referer) return { name: "Direct", domain: null };
  try {
    const url = new URL(referer);
    const host = url.hostname.replace("www.", "");
    const domain = url.hostname;

    if (host.includes("google")) return { name: "Google", domain };
    if (
      host.includes("twitter") ||
      host.includes("t.co") ||
      host.includes("x.com")
    )
      return { name: "X (Twitter)", domain };
    if (host.includes("linkedin")) return { name: "LinkedIn", domain };
    if (host.includes("facebook")) return { name: "Facebook", domain };
    if (host.includes("instagram")) return { name: "Instagram", domain };
    if (host.includes("reddit")) return { name: "Reddit", domain };
    if (host.includes("youtube")) return { name: "YouTube", domain };
    if (host.includes("bing")) return { name: "Bing", domain };
    if (host.includes("duckduckgo")) return { name: "DuckDuckGo", domain };
    if (host.includes("yandex")) return { name: "Yandex", domain };
    if (host.includes("github")) return { name: "GitHub", domain };
    if (host.includes("indiehackers")) return { name: "IndieHackers", domain };
    if (host.includes("producthunt")) return { name: "ProductHunt", domain };

    const name =
      host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
    return { name, domain };
  } catch {
    return { name: "Direct", domain: null };
  }
}
