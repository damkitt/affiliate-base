/**
 * Authentication & Authorization Module
 * 
 * Provides JWT-based authentication for admin panel.
 * Uses jose library for Edge-compatible JWT operations.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

// =============================================================================
// Constants
// =============================================================================

const COOKIE_NAME = "affiliatebase_admin_token";
const TOKEN_EXPIRY = "24h";

// =============================================================================
// Environment Validation
// =============================================================================

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

function getJwtNumber(): number {
  const num = process.env.JWT_NUMBER;
  if (!num || isNaN(Number(num))) {
    throw new Error("JWT_NUMBER must be a valid number");
  }
  return Number(num);
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  return password;
}

// =============================================================================
// Types
// =============================================================================

interface AdminTokenPayload extends JWTPayload {
  role: "admin";
  jwtNumber: number;
  iat: number;
  exp: number;
}

// =============================================================================
// Password Verification
// =============================================================================

/**
 * Verify admin password with timing-safe comparison
 */
export function verifyPassword(inputPassword: string): boolean {
  const adminPassword = getAdminPassword();
  
  // Timing-safe comparison to prevent timing attacks
  if (inputPassword.length !== adminPassword.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < inputPassword.length; i++) {
    result |= inputPassword.charCodeAt(i) ^ adminPassword.charCodeAt(i);
  }
  
  return result === 0;
}

// =============================================================================
// JWT Operations
// =============================================================================

/**
 * Generate a new admin JWT token
 */
export async function generateToken(): Promise<string> {
  const secret = getJwtSecret();
  const jwtNumber = getJwtNumber();
  
  const token = await new SignJWT({
    role: "admin",
    jwtNumber,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuer("affiliatebase")
    .setAudience("affiliatebase-admin")
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const jwtNumber = getJwtNumber();
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: "affiliatebase",
      audience: "affiliatebase-admin",
    });

    // Validate payload structure
    if (payload.role !== "admin" || payload.jwtNumber !== jwtNumber) {
      return null;
    }

    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

// =============================================================================
// Cookie Operations
// =============================================================================

/**
 * Set the admin token cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

/**
 * Get the admin token from cookies
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Remove the admin token cookie
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Check if current request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthCookie();
  if (!token) return false;
  
  const payload = await verifyToken(token);
  return payload !== null;
}

// =============================================================================
// Export cookie name for middleware
// =============================================================================

export { COOKIE_NAME };
