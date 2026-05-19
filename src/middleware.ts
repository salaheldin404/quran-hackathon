import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "ar",
  localeDetection: false,
});

const encoder = new TextEncoder();
const SECRET = process.env.SESSION_SECRET!;

async function sign(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function verifySession(token?: string) {
  if (!token) return false;

  const [payload, sig] = token.split(".");

  if (!payload || !sig) {
    return false;
  }

  const expected = await sign(payload);

  return sig === expected;
}

const PROTECTED_PATHS = ["/khatma", "/profile", "/journey"];
const AUTH_PAGES = ["/auth/signin", "/auth/error"];
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Simplified public check for multilingual
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, "") || "/";
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathWithoutLocale.startsWith(path),
  );
  const isAuthPage = AUTH_PAGES.some((page) =>
    pathWithoutLocale.startsWith(page),
  );
  const session = req.cookies.get("session")?.value;
  const hasSession = await verifySession(session);

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!isProtectedPath) {
    return intlMiddleware(req);
  }

  if (!hasSession) {
    const loginUrl = new URL(`/api/auth/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
};
