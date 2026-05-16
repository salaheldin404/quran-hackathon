import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "session";
const SESSION_SECRET = process.env.SESSION_SECRET!;
const USER_SECRET_KEY = process.env.USER_SECRET_KEY!;

export interface SessionPayload {
  exp: number;
  accessToken: string;
}

type VerifyOptions = {
  cookieName: string;
  signFn: (payload: string) => string;
};

 async function verifySignedCookie<T>({
  cookieName,
  signFn,
}: VerifyOptions): Promise<T | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(cookieName)?.value;

  if (!value) return null;

  const [payloadStr, signature] = value.split(".");

  if (!payloadStr || !signature) {
    return null;
  }

  const expectedSignature = signFn(payloadStr);

  const signatureBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString(),
    ) as T & { exp?: number };

    if (payload.exp && payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function sign(payload: string): string {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not defined");
  }

  return createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}
function signUserId(payload: string): string {
  if (!USER_SECRET_KEY) {
    throw new Error("USER_SECRET is not defined");
  }
  return createHmac("sha256", USER_SECRET_KEY)
    .update(payload)
    .digest("base64url");
}

export async function setSession(accessToken: string) {
  const expiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  const payload: SessionPayload = { exp: expiresAt, accessToken };
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

export async function setUserIdInCookie(userId: string) {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = { exp: expiresAt, userId };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signUserId(payloadStr);
  const sessionValue = `${payloadStr}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set("userId", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getUserIdFromCookie(): Promise<string | null> {
  const payload = await verifySignedCookie<{ userId: string }>({
    cookieName: "userId",
    signFn: signUserId,
  });
  return payload?.userId || null;
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const payload = await verifySignedCookie<SessionPayload>({
    cookieName: SESSION_COOKIE_NAME,
    signFn: sign,
  });
  return payload;
}

export async function clearSession() {
  const userId = await getUserIdFromCookie();
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("userId");
}
