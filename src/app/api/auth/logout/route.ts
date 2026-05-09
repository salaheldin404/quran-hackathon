import { clearSession } from "@/lib/oauth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await clearSession();
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.delete("pkce_verifier");
  res.cookies.delete("oauth_state");
  res.cookies.delete("oauth_nonce");
  return res;
}
