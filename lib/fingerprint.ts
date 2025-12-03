/**
 * Browser Fingerprint Generation
 * 
 * Creates a unique hash based on browser characteristics for anti-fraud tracking.
 * This helps identify unique visitors without storing personal data.
 */

// =============================================================================
// Types
// =============================================================================

interface NavigatorWithExtras extends Navigator {
  deviceMemory?: number;
}

interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

// =============================================================================
// Constants
// =============================================================================

const SESSION_STORAGE_KEYS = {
  SESSION_ID: 'ta_session_id',
  VIEWED_PREFIX: 'ta_viewed_',
} as const;

// =============================================================================
// Fingerprint Generation
// =============================================================================

/**
 * Generates a unique browser fingerprint hash
 */
export async function generateFingerprint(): Promise<string> {
  const components = await collectFingerprintComponents();
  const fingerprint = components.join('|||');
  return hashString(fingerprint);
}

async function collectFingerprintComponents(): Promise<string[]> {
  const components: string[] = [];

  // Screen characteristics
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  
  // Locale info
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  components.push(navigator.language);
  
  // Hardware info
  components.push(navigator.platform);
  components.push(String(navigator.hardwareConcurrency || 0));
  components.push(String((navigator as NavigatorWithExtras).deviceMemory || 0));
  components.push(String(navigator.maxTouchPoints || 0));
  
  // GPU info via WebGL
  components.push(getWebGLRenderer());
  
  // Canvas fingerprint
  components.push(getCanvasFingerprint());
  
  // Audio context sample rate
  components.push(await getAudioFingerprint());

  return components;
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
      }
    }
  } catch {
    // WebGL not available
  }
  return 'no-webgl';
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('AffiliateBase', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('AffiliateBase', 4, 17);
      return canvas.toDataURL().slice(-50);
    }
  } catch {
    // Canvas not available
  }
  return 'no-canvas';
}

async function getAudioFingerprint(): Promise<string> {
  try {
    const AudioContextClass = window.AudioContext || (window as WindowWithWebkit).webkitAudioContext;
    
    if (AudioContextClass) {
      const context = new AudioContextClass();
      const sampleRate = String(context.sampleRate);
      await context.close();
      return sampleRate;
    }
  } catch {
    // Audio context not available
  }
  return 'no-audio';
}

// =============================================================================
// Hashing
// =============================================================================

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// =============================================================================
// Session Management
// =============================================================================

/**
 * Gets or creates a unique session ID
 */
export function getSessionId(): string {
  const key = SESSION_STORAGE_KEYS.SESSION_ID;
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

/**
 * Checks if a program was already viewed in this session
 */
export function wasViewedInSession(programId: string): boolean {
  const key = `${SESSION_STORAGE_KEYS.VIEWED_PREFIX}${programId}`;
  return sessionStorage.getItem(key) === 'true';
}

/**
 * Marks a program as viewed in this session
 */
export function markViewedInSession(programId: string): void {
  const key = `${SESSION_STORAGE_KEYS.VIEWED_PREFIX}${programId}`;
  sessionStorage.setItem(key, 'true');
}
