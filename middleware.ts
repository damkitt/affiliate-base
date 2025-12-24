import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "affiliatebase_admin_token";
const LOGIN_PATH = "/admin/login";

const PROTECTED_PATHS = ["/admin", "/api/admin"];

const PUBLIC_PATHS = ["/admin/login", "/api/auth/login"];

async function verifyJWT(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("[Middleware] Missing JWT_SECRET");
      return false;
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey, {
      issuer: "affiliatebase",
    });

    if (payload.role !== "admin") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Middleware] JWT verification failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = request.nextUrl;

    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

    if (!isProtected) {
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (!pathname.startsWith("/api/")) {
        const loginUrl = new URL(LOGIN_PATH, request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isValid = await verifyJWT(token);

    if (!isValid) {
      const response = pathname.startsWith("/api/")
        ? NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        )
        : NextResponse.redirect(new URL(LOGIN_PATH, request.url));

      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    const response = NextResponse.next();

    // Security Headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Lightweight Rate Limiting for API (In-memory, per-edge-instance)
    if (pathname.startsWith("/api/")) {
      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
      const now = Date.now();
      const rateLimitKey = `rl_${ip}`;

      if (!(globalThis as any)._rateLimits) {
        (globalThis as any)._rateLimits = new Map<string, { count: number; start: number }>();
      }
      const limits = (globalThis as any)._rateLimits;
      const current = limits.get(rateLimitKey) || { count: 0, start: now };

      if (now - current.start > 60000) {
        current.count = 1;
        current.start = now;
      } else {
        current.count++;
      }

      limits.set(rateLimitKey, current);

      if (current.count > 60) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }

    return response;
  } catch (error) {
    // FAIL OPEN: If middleware crashes, let the request through to avoid taking down the whole site.
    console.error("[Middleware Critical Error]:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
