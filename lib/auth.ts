import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = process.env.ADMIN_TOKEN_NAME;
const TOKEN_EXPIRY = process.env.ADMIN_TOKEN_EXPIRY;

const validationEnvironment = () => {
  if (!COOKIE_NAME) {
    throw new Error("COOKIE_NAME environment variable is not set");
  }

  if (!TOKEN_EXPIRY) {
    throw new Error("TOKEN_EXPIRY environment variable is not set");
  }
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  return password;
}

export function verifyPassword(password: string): boolean {
  const adminPassword = getAdminPassword();

  if (!adminPassword || !password) {
    return false;
  }

  return password === adminPassword;
}

export async function generateToken(): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT({
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY!)
    .setIssuer("affiliatebase")
    .setAudience("affiliatebase-admin")
    .sign(secret);

  return token;
}

export async function verifyToken(token: string) {
  const secret = getJwtSecret();

  const { payload } = await jwtVerify(token, secret, {
    issuer: "affiliatebase",
    audience: "affiliatebase-admin",
  });

  const role = payload.role;
  if (role !== "admin") {
    return null;
  }

  return payload;
}

export async function setAuthCookie(token: string): Promise<void> {
  validationEnvironment();
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME!, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | null> {
  validationEnvironment();
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME!)!.value || null;
}

export async function removeAuthCookie(): Promise<void> {
  validationEnvironment();
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME!);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthCookie();
  if (!token) return false;

  const payload = await verifyToken(token);
  return payload !== null;
}

/**
 * Verify authentication from request headers (for API routes)
 * Checks Authorization header or cookie
 */
export async function verifyAuth(request: Request): Promise<{ success: boolean; error?: string }> {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = await verifyToken(token);
      if (payload) {
        return { success: true };
      }
    }

    // Fall back to cookie
    const token = await getAuthCookie();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return { success: false, error: "Invalid token" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Authentication failed" };
  }
}
