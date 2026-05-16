import { prisma } from "@/lib/prisma";
import { decryptToken, encryptToken } from "./token-encryption";
import { SessionPayload, setSession } from "./session";

type QfOAuthConfig = {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  redirectUri: string;
  baseApiUrl: string;
};

let cachedConfig: QfOAuthConfig | null = null;

export const getQfOAuthConfig = (): QfOAuthConfig => {
  if (cachedConfig) return cachedConfig;

  const {
    QF_CLIENT_ID,
    QF_CLIENT_SECRET,
    QF_AUTH_URL,
    QF_TOKEN_URL,
    QF_REDIRECT_URI,
    QF_BASE_API_URL,
  } = process.env;

  if (
    !QF_CLIENT_ID ||
    !QF_CLIENT_SECRET ||
    !QF_AUTH_URL ||
    !QF_TOKEN_URL ||
    !QF_REDIRECT_URI ||
    !QF_BASE_API_URL
  ) {
    throw new Error("Missing QF OAuth environment variables");
  }

  cachedConfig = {
    clientId: QF_CLIENT_ID,
    clientSecret: QF_CLIENT_SECRET,
    authUrl: QF_AUTH_URL,
    tokenUrl: QF_TOKEN_URL,
    redirectUri: QF_REDIRECT_URI,
    baseApiUrl: QF_BASE_API_URL,
  };

  return cachedConfig;
};

// Map to track ongoing refresh operations to prevent race conditions
const refreshPromises = new Map<string, Promise<SessionPayload>>();

export async function refreshToken(userId: string): Promise<SessionPayload> {
  console.log(`Attempting to refresh token for user ${userId}`);
  // If there's already an ongoing refresh for this user, return that promise
  const existingPromise = refreshPromises.get(userId);
  if (existingPromise) return existingPromise;

  const { tokenUrl, clientId, clientSecret } = getQfOAuthConfig();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.refreshToken) {
    throw new Error("No refresh token available for user");
  }
  const decryptedRefreshToken = decryptToken(user.refreshToken);
  const refreshPromise = (async () => {
    try {
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
          grant_type: "refresh_token",
          refresh_token: decryptedRefreshToken,
          client_id: clientId,
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error_description || "Failed to refresh token");
      }
      const encryptRefreshToken = encryptToken(data.refresh_token);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: encryptRefreshToken,
        },
      });

      await setSession(data.access_token);
      return {
        accessToken: data.access_token,
        exp: Date.now() + data.expires_in * 1000,
      };
    } finally {
      // Always remove the promise from the map when finished
      refreshPromises.delete(user.id);
    }
  })();

  refreshPromises.set(user.id, refreshPromise);
  return refreshPromise;
}

export async function callQF(
  sessionPayload: SessionPayload,
  endpoint: string,
  options?: RequestInit,
) {
  const { baseApiUrl, clientId } = getQfOAuthConfig();

  const makeRequest = async (accessToken: string) => {
    return fetch(`${baseApiUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
        "x-auth-token": accessToken,
        "x-client-id": clientId,
      },
    });
  };

  return await makeRequest(sessionPayload.accessToken);
}
