import { UserType, AIUsageLimit } from "./types";

export const AI_LIMITS: Record<UserType, AIUsageLimit> = {
  authenticated: {
    daily: 3,
    cooldownSeconds: 10,
  },
};

export const DEFAULT_USER_TYPE: UserType = "authenticated";
