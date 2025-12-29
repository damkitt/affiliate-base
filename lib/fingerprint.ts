import { SESSION_STORAGE_KEYS } from "@/constants";
import { WindowWithWebkit } from "@/types";
import { collectFingerprintComponents } from "./utils";

export async function generateFingerprint(): Promise<string> {
  const components = await collectFingerprintComponents();
  const fingerprint = components.join("|||");
  return hashString(fingerprint);
}

export const getWebGLRenderer = (): string => {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (gl instanceof WebGLRenderingContext) {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "unknown";
    }
  }
  return "no-webgl";
};

export const getCanvasFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("AffiliateBase", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("AffiliateBase", 4, 17);
    return canvas.toDataURL().slice(-50);
  }
  return "no-canvas";
};

export async function getAudioFingerprint(): Promise<string> {
  const AudioContextClass =
    window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;

  if (AudioContextClass) {
    const context = new AudioContextClass();
    const sampleRate = String(context.sampleRate);
    await context.close();
    return sampleRate;
  }

  return "no-audio";
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getSessionId(): string | undefined {
  const key = SESSION_STORAGE_KEYS.SESSION_ID;
  const sessionId = sessionStorage.getItem(key);

  return sessionId || undefined;
}

export function wasViewedInSession(programId: string): boolean {
  const key = `${SESSION_STORAGE_KEYS.VIEWED_PREFIX}${programId}`;
  return sessionStorage.getItem(key) === "true";
}

export function markViewedInSession(programId: string): void {
  const key = `${SESSION_STORAGE_KEYS.VIEWED_PREFIX}${programId}`;
  sessionStorage.setItem(key, "true");
}
