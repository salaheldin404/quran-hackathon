import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  setIdTokenCookie,
  setSession,
  setUserIdInCookie,
} from "@/lib/oauth/session";
import { getQfOAuthConfig } from "@/lib/oauth/qf";
import { encryptToken } from "@/lib/oauth/token-encryption";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
}
interface OAuthCallbackCookies {
  storedState: string;
  codeVerifier: string;
  storedNonce: string;
}

function decodeJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch {
    return null;
  }
}

function validateCallbackRequest(
  req: NextRequest,
): { code: string; cookies: OAuthCallbackCookies } | null {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get("oauth_state")?.value;
  const codeVerifier = req.cookies.get("pkce_verifier")?.value;
  const storedNonce = req.cookies.get("oauth_nonce")?.value;

  if (!code || !state || !storedState || !codeVerifier || !storedNonce) {
    return null;
  }
  if (state !== storedState) {
    return null;
  }

  return { code, cookies: { storedState, codeVerifier, storedNonce } };
}

function validateIdToken(
  idToken: string,
  expectedNonce: string,
): ReturnType<typeof decodeJwt> {
  const payload = decodeJwt(idToken);

  if (!payload?.sub) {
    throw new Error("ID token missing required 'sub' claim");
  }
  if (payload.nonce !== expectedNonce) {
    throw new Error("ID token nonce mismatch");
  }

  return payload;
}
async function upsertUser(
  qfUserId: string,
  tokenData: TokenResponse,
  payload: ReturnType<typeof decodeJwt>,
) {
  const encryptedRefreshToken = encryptToken(tokenData.refresh_token);

  const data = {
    refreshToken: encryptedRefreshToken,
    email: payload.email as string,
    firstName: payload.first_name as string,
    lastName: payload.last_name as string,
  };

  return prisma.user.upsert({
    where: { qfUserId },
    update: data,
    create: { qfUserId, ...data },
  });
}

async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const { tokenUrl, clientId, clientSecret, redirectUri } = getQfOAuthConfig();

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${authHeader}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "<unreadable>");
    throw new Error(`Token exchange failed [${res.status}]: ${errorBody}`);
  }

  return res.json() as Promise<TokenResponse>;
}
function clearOAuthCookies(res: NextResponse): NextResponse {
  const cookieOptions = {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  res.cookies.set("pkce_verifier", "", cookieOptions);
  res.cookies.set("oauth_state", "", cookieOptions);
  res.cookies.set("oauth_nonce", "", cookieOptions);

  return res;
}

export async function GET(req: NextRequest) {
  // 1. Validate callback params and cookies
  const validated = validateCallbackRequest(req);
  if (!validated) {
    console.warn("[oauth/callback] Invalid or mismatched state/cookies");
    return clearOAuthCookies(
      new NextResponse("Invalid auth request", { status: 400 }),
    );
  }

  const { code, cookies } = validated;
  const res = NextResponse.redirect(new URL("/", req.url));

  try {
    // 2. Exchange code for tokens
    const tokenData = await exchangeCodeForTokens(code, cookies.codeVerifier);

    if (!tokenData.id_token) {
      return clearOAuthCookies(
        new NextResponse("Missing ID token in response", {
          status: 502,
        }),
      );
    }

    // 3. Validate id_token claims
    const payload = validateIdToken(tokenData.id_token, cookies.storedNonce);

    // 4. Upsert user in DB
    const user = await upsertUser(payload.sub!, tokenData, payload);

    // 5. Create session
    await setSession(tokenData.access_token);
    await setUserIdInCookie(user.id);
    await setIdTokenCookie(tokenData.id_token);
    // 6. Redirect and clean up cookies

    return res;
  } catch (err) {
    console.error("[oauth/callback] Error:", err);

    const status =
      err instanceof Error && err.message.includes("nonce") ? 400 : 502;

    const message =
      status === 400 ? "Invalid ID token" : "Authentication failed";

    return clearOAuthCookies(new NextResponse(message, { status }));
  }
}
