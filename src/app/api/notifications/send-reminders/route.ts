import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DateTime } from "luxon";
import { KhatmaReminderWithUser, ReminderWithUser } from "@/types/notification";
import sendNotification from "@/lib/notifications/sendNotification";
import sendKhatmaReminderNotification from "@/lib/notifications/sendKhatmaReminderNotification";

function getLocalTimeAndDay(timezone: string) {
  const now = DateTime.now().setZone(timezone);
  return {
    day: now.weekday % 7, // Convert to 0-6 (Sunday-Saturday)
    time: now.toFormat("HH:mm"),
  };
}

function isReminderDue(
  reminder: Pick<ReminderWithUser, "time" | "days" | "timezone">,
): boolean {
  const { time, day } = getLocalTimeAndDay(reminder.timezone);
  return reminder.time === time && reminder.days.includes(day);
}

function isKhatmaReminderDue(
  reminder: Pick<KhatmaReminderWithUser, "time" | "timezone">,
): boolean {
  const { time } = getLocalTimeAndDay(reminder.timezone);
  return reminder.time === time;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [reminders, khatmaReminders] = await prisma.$transaction([
      prisma.reminder.findMany({
        where: { isEnabled: true },
        include: {
          user: {
            include: { pushSubscriptions: true },
          },
        },
      }),
      prisma.khatmaReminder.findMany({
        where: { isEnabled: true },
        include: {
          user: {
            include: { pushSubscriptions: true },
          },
        },
      }),
    ]);

    const due = reminders.filter(isReminderDue);
    const dueKhatma = khatmaReminders.filter(isKhatmaReminderDue);
    const results = await Promise.allSettled([
      ...due.map(sendNotification),
      ...dueKhatma.map(sendKhatmaReminderNotification),
    ]);
    // 4. Summarise
    const summary = results.reduce(
      (acc, result) => {
        if (result.status === "fulfilled") {
          acc[result.value.status]++;
        } else {
          acc.failed++;
        }
        return acc;
      },
      { sent: 0, skipped: 0, failed: 0 },
    );

    return NextResponse.json({
      success: true,
      checked: reminders.length + khatmaReminders.length,
      due: due.length + dueKhatma.length,
      quranDue: due.length,
      khatmaDue: dueKhatma.length,
      ...summary,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
