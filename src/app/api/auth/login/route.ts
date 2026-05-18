import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { getQfOAuthConfig } from "@/lib/oauth/qf";


const SCOPES = "openid offline_access note activity_day streak";

function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function GET() {
  const { authUrl, clientId, redirectUri } = getQfOAuthConfig();
  const codeVerifier = base64url(randomBytes(32));
  const codeChallenge = base64url(createHash("sha256").update(codeVerifier).digest());
  const state = randomBytes(16).toString("hex");
  const nonce = randomBytes(16).toString("hex");

  const url = new URL(authUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);

  const res = NextResponse.redirect(url.toString());

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600, // 10 minutes
    path: "/",
  };

  res.cookies.set("pkce_verifier", codeVerifier, cookieOptions);
  res.cookies.set("oauth_state", state, cookieOptions);
  res.cookies.set("oauth_nonce", nonce, cookieOptions);

  return res;
}
