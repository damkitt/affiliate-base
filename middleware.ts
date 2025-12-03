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

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
