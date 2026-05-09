import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE_NAME = "session";
const SESSION_SECRET = process.env.SESSION_SECRET!;

interface SessionPayload {
  userId: string;
  exp: number;
}

export function sign(payload: string): string {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not defined");
  }

  return createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

export async function setSession(userId: string) {
  const expiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  const payload: SessionPayload = { userId, exp: expiresAt };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadStr);
  const sessionValue = `${payloadStr}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionValue) return null;

  const [payloadStr, signature] = sessionValue.split(".");
  if (!payloadStr || !signature) return null;

  const expectedSignature = sign(payloadStr);
  const signatureBuffer = Buffer.from(signature, "base64url");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64url");

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString(),
    ) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
