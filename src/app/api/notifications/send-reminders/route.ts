import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pLimit from "p-limit";
import { NotificationStatus } from "@/types/notification";
import {
  sendAndAdvanceKhatmaReminder,
  sendAndAdvanceReminder,
} from "@/lib/notifications";

function summarise(
  results: PromiseSettledResult<{ status: NotificationStatus }>[],
) {
  return results.reduce(
    (acc, result) => {
      const key =
        result.status === "fulfilled" ? result.value.status : "failed";
      acc[key]++;
      return acc;
    },
    { sent: 0, skipped: 0, failed: 0 },
  );
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const now = new Date();
    const [reminders, khatmaReminders] = await prisma.$transaction([
      prisma.reminder.findMany({
        where: { isEnabled: true, nextReminderAt: { lte: now } },
        select: {
          id: true,
          timezone: true,
          time: true,
          days: true,
          surahId: true,
          isEnabled: true,
          user: {
            select: {
              id: true,
              pushSubscriptions: true,
            },
          },
        },
      }),
      prisma.khatmaReminder.findMany({
        where: { isEnabled: true, nextReminderAt: { lte: now } },
        select: {
          id: true,
          timezone: true,
          time: true,
          isEnabled: true,
          user: {
            select: { id: true, pushSubscriptions: true },
          },
        },
      }),
    ]);
    if (reminders.length === 0 && khatmaReminders.length === 0) {
      return NextResponse.json({
        success: true,
        due: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
      });
    }

    const limit = pLimit(10);
    const results = await Promise.allSettled([
      ...reminders.map((r) => limit(() => sendAndAdvanceReminder(r))),
      ...khatmaReminders.map((r) =>
        limit(() => sendAndAdvanceKhatmaReminder(r)),
      ),
    ]);
    return NextResponse.json({
      success: true,
      due: reminders.length + khatmaReminders.length,
      quranDue: reminders.length,
      khatmaDue: khatmaReminders.length,
      ...summarise(results),
    });
  } catch (error) {
    console.error("Error sending reminders:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
