/**
 * Next.js Middleware
 * 
 * Protects admin routes with JWT authentication.
 * Redirects unauthenticated users to login page.
 */

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// =============================================================================
// Configuration
// =============================================================================

const COOKIE_NAME = "affiliatebase_admin_token";
const LOGIN_PATH = "/admin/login";

// Protected paths
const PROTECTED_PATHS = [
  "/admin",
  "/api/admin",
];

// Paths that don't require authentication
const PUBLIC_PATHS = [
  "/admin/login",
  "/api/auth/login",
];

// =============================================================================
// JWT Verification (Edge-compatible)
// =============================================================================

async function verifyJWT(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;
    const jwtNumber = process.env.JWT_NUMBER;

    if (!secret || !jwtNumber) {
      console.error("[Middleware] Missing JWT_SECRET or JWT_NUMBER");
      return false;
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey, {
      issuer: "affiliatebase",
      audience: "affiliatebase-admin",
    });

    // Verify JWT number matches
    if (payload.jwtNumber !== Number(jwtNumber)) {
      return false;
    }

    // Verify role
    if (payload.role !== "admin") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Middleware] JWT verification failed:", error);
    return false;
  }
}

// =============================================================================
// Middleware
// =============================================================================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Check if path is public
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if path requires protection
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  if (!isProtected) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // Redirect to login for page requests
    if (!pathname.startsWith("/api/")) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Return 401 for API requests
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Verify token
  const isValid = await verifyJWT(token);

  if (!isValid) {
    // Clear invalid cookie
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      : NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  return response;
}

// =============================================================================
// Matcher Configuration
// =============================================================================

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
