import { middlewareConstants } from "./constants";
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET;

async function verifyJWT(token: string): Promise<boolean> {
  try {
    if (!SECRET) return false;

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET),
      { issuer: "affiliatebase" }
    );

    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const { PUBLIC_PATHS, PROTECTED_PATHS, COOKIE_NAME, LOGIN_PATH } =
    middlewareConstants;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isApi = pathname.startsWith("/api/");

  if (!token) {
    if (isApi) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!(await verifyJWT(token))) {
    const response = isApi
      ? NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        )
      : NextResponse.redirect(new URL(LOGIN_PATH, request.url));

    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
