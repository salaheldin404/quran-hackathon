import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/oauth/session";
import { getQfOAuthConfig } from "@/lib/oauth/qf";

function decodeJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { tokenUrl, clientId, clientSecret, redirectUri } = getQfOAuthConfig();
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const storedState = req.cookies.get("oauth_state")?.value;
  const codeVerifier = req.cookies.get("pkce_verifier")?.value;

  if (!code || !state || state !== storedState || !codeVerifier) {
    return new NextResponse("Invalid auth request", { status: 400 });
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const tokenRes = await fetch(tokenUrl, {
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

  if (!tokenRes.ok) {
    return new NextResponse("Token exchange failed", { status: 500 });
  }

  const tokenData = await tokenRes.json();
  const payload = decodeJwt(tokenData.id_token);
  const storedNonce = req.cookies.get("oauth_nonce")?.value;

  if (!payload || payload.nonce !== storedNonce) {
    return new NextResponse("Invalid nonce", { status: 400 });
  }

  const qfUserId = payload.sub;
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  const user = await prisma.user.upsert({
    where: { qfUserId },
    update: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
    },
    create: {
      qfUserId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
    },
  });

  await setSession(user.id);

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.delete("pkce_verifier");
  res.cookies.delete("oauth_state");
  res.cookies.delete("oauth_nonce");

  return res;
}
