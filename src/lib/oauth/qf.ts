import { prisma } from "@/lib/prisma";

import { User } from "@/generated/prisma/browser";

type QfOAuthConfig = {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  redirectUri: string;
  baseApiUrl: string;
};

export const getQfOAuthConfig = (): QfOAuthConfig => {
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

  return {
    clientId: QF_CLIENT_ID,
    clientSecret: QF_CLIENT_SECRET,
    authUrl: QF_AUTH_URL,
    tokenUrl: QF_TOKEN_URL,
    redirectUri: QF_REDIRECT_URI,
    baseApiUrl: QF_BASE_API_URL,
  };
};
export async function refreshToken(user: User) {
  const { tokenUrl, clientId, clientSecret } = getQfOAuthConfig();
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
      refresh_token: user.refreshToken!,
      client_id: clientId,
    }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error_description || "Failed to refresh token");
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });
  return updatedUser;
}

export async function callQF(
  userId: string,
  endpoint: string,
  options?: RequestInit,
) {
  const { baseApiUrl, clientId } = getQfOAuthConfig();
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.expiresAt && user.expiresAt.getTime() - Date.now() < 60000) {
    // Refresh if less than 1 min left
    user = await refreshToken(user);
  }

  const res = await fetch(`${baseApiUrl}${endpoint}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      "Content-Type": "application/json",
      "x-auth-token": user.accessToken!,
      "x-client-id": clientId,
    },
  });
  if (res.status === 401) {
    user = await refreshToken(user);
    return await fetch(`${baseApiUrl}${endpoint}`, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        "Content-Type": "application/json",
        "x-auth-token": user.accessToken!,
        "x-client-id": clientId,
      },
    });
  }
  return res;
}
