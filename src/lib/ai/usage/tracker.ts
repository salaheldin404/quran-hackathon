import { prisma } from "@/lib/prisma";
import { AI_LIMITS } from "./limit";
import { AIUsageStatus, TrackOptions, UserType } from "./types";

export class AIUsageTracker {
  static async getStatus(
    identifier: string,
    userId: string,
    userType: UserType = "authenticated",
  ): Promise<AIUsageStatus> {
    const limits = AI_LIMITS[userType];
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    // 1. Cooldown Protection (10s by default)
    const lastUsage = await prisma.aiUsage.findFirst({
      where: {
        AND: [{ OR: [{ userId }, { identifier }] }, { cached: false }],
      },
      orderBy: { createdAt: "desc" },
    });

    if (
      lastUsage &&
      now.getTime() - lastUsage.createdAt.getTime() <
        limits.cooldownSeconds * 1000
    ) {
      console.warn(
        `[AI_COOLDOWN] Request blocked for ${identifier}. Active cooldown.`,
      );
      const count = await this.getCount(identifier, userId, todayStart);
      return {
        canGenerate: false,
        remaining: Math.max(0, limits.daily - count),
        totalLimit: limits.daily,
        resetAt: todayEnd,
        reason: "cooldown_active",
      };
    }

    // 2. Daily Limit Check
    const count = await this.getCount(identifier, userId, todayStart);

    if (count >= limits.daily) {
      console.warn(
        `[AI_LIMIT] User exceeded daily quota for ${identifier} (${count}/${limits.daily})`,
      );
    }

    return {
      canGenerate: count < limits.daily,
      remaining: Math.max(0, limits.daily - count),
      totalLimit: limits.daily,
      resetAt: todayEnd,
      reason: count >= limits.daily ? "limit_reached" : undefined,
    };
  }

  /**
   * Helper to count successful AI generations since a given date.
   */
  private static async getCount(
    identifier: string,
    userId: string,
    since: Date,
  ): Promise<number> {
    return prisma.aiUsage.count({
      where: {
        AND: [
          { OR: [{ userId }, { identifier }] },
          { cached: false },
          { createdAt: { gte: since } },
        ],
      },
    });
  }

  static async track(options: TrackOptions): Promise<void> {
    const { userId, identifier, provider, model, cached = false } = options;

    try {
      await prisma.aiUsage.create({
        data: {
          userId,
          identifier,
          provider,
          model,
          cached,
        },
      });

      if (!cached) {
        console.info(
          `[AI_USAGE] ${provider} (${model}) generation recorded for ${identifier}`,
        );
      }
    } catch (error) {
      console.error("[AI_USAGE_TRACK_ERROR] Failed to record AI usage:", error);
    }
  }
}
