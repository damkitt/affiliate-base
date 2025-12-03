/**
 * Authentication API Routes
 * 
 * POST /api/auth/login - Login with password
 * POST /api/auth/logout - Logout and clear cookie
 * GET /api/auth/check - Check authentication status
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  verifyPassword, 
  generateToken, 
  setAuthCookie, 
  removeAuthCookie,
  isAuthenticated 
} from "@/lib/auth";

// =============================================================================
// Rate Limiting (in-memory for simplicity, use Redis in production)
// =============================================================================

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

function isRateLimited(ip: string): { limited: boolean; remainingTime?: number } {
  const attempt = loginAttempts.get(ip);
  
  if (!attempt) return { limited: false };
  
  const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
  
  // Reset if lockout period has passed
  if (timeSinceLastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return { limited: false };
  }
  
  if (attempt.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 1000);
    return { limited: true, remainingTime };
  }
  
  return { limited: false };
}

function recordFailedAttempt(ip: string): void {
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  loginAttempts.set(ip, {
    count: attempt.count + 1,
    lastAttempt: Date.now(),
  });
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// =============================================================================
// POST /api/auth/login
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIP(request);
    
    // Check rate limiting
    const rateLimit = isRateLimited(ip);
    if (rateLimit.limited) {
      return NextResponse.json(
        { 
          error: "Too many login attempts", 
          retryAfter: rateLimit.remainingTime 
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => null);
    
    if (!body?.password || typeof body.password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = verifyPassword(body.password);
    
    if (!isValid) {
      recordFailedAttempt(ip);
      
      const attempt = loginAttempts.get(ip);
      const remaining = MAX_ATTEMPTS - (attempt?.count || 0);
      
      return NextResponse.json(
        { 
          error: "Invalid password",
          attemptsRemaining: remaining > 0 ? remaining : 0
        },
        { status: 401 }
      );
    }

    // Clear failed attempts on success
    clearAttempts(ip);

    // Generate token and set cookie
    const token = await generateToken();
    await setAuthCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/auth/login (logout)
// =============================================================================

export async function DELETE(): Promise<NextResponse> {
  try {
    await removeAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/auth/login (check status)
// =============================================================================

export async function GET(): Promise<NextResponse> {
  try {
    const authenticated = await isAuthenticated();
    return NextResponse.json({ authenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
