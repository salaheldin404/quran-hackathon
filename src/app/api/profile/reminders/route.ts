import { requireUser } from "@/lib/oauth/auth";
import { NextResponse } from "next/server";


import { prisma } from "@/lib/prisma";
import {
  profileReminderSchema,
  QuranReminderInput,
} from "@/lib/validations/reminderSchema";
import { normalizeDays } from "@/lib/utils/profile";

const MAX_QURAN_REMINDERS = 5;


function normalizeTimezone(timezone?: string) {
  return typeof timezone === "string" && timezone.trim().length > 0
    ? timezone.trim()
    : "UTC";
}

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function serverError(error: unknown, message: string) {
  console.error(message, error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

function buildReminderData(reminder: QuranReminderInput, timezone: string) {
  return {
    surahId: reminder.surahId,
    time: reminder.time,
    timezone,
    days: normalizeDays(reminder.days),
    isEnabled: reminder.isEnabled,
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id;

    const [userData, quranReminders, khatmaReminder] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              pushSubscriptions: true,
            },
          },
        },
      }),
      prisma.reminder.findMany({
        where: { userId },
        orderBy: [{ createdAt: "asc" }, { updatedAt: "asc" }],
      }),
      prisma.khatmaReminder.findUnique({
        where: { userId },
      }),
    ]);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        ...userData,
        createdAt: userData.createdAt.toISOString(),
        pushDeviceCount: userData._count.pushSubscriptions,
      },
      quranReminders,
      khatmaReminder,
    });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return unauthorized();
    }
    return serverError(error, "Error loading profile reminder settings");
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const userId = user.id;

    const payload = await request.json();
    const parseResult = profileReminderSchema.safeParse(payload);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.format()._errors.join("; ");

      return badRequest(`Invalid reminder settings: ${errorMessages}`);
    }
    const {
      quranReminders,
      khatmaReminder,
      timezone: rawZone,
    } = parseResult.data;
    const timezone = normalizeTimezone(rawZone);

    if (quranReminders.length > MAX_QURAN_REMINDERS) {
      return badRequest(
        `You can save up to ${MAX_QURAN_REMINDERS} Quran reminders`,
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingReminders = await tx.reminder.findMany({
        where: { userId },
        select: { id: true },
      });
      const existingReminderIds = new Set(
        existingReminders.map((reminder) => reminder.id),
      );
      const incomingIds = quranReminders
        .map((r) => r.id)
        .filter((id): id is string => typeof id === "string");
      if (incomingIds.length > 0) {
        // Delete only reminders not present in the incoming payload.
        await tx.reminder.deleteMany({
          where: { userId, id: { notIn: incomingIds } },
        });
      } else {
        await tx.reminder.deleteMany({ where: { userId } });
      }
      const savedQuranReminders: Awaited<
        ReturnType<typeof tx.reminder.update>
      >[] = [];

      for (const reminder of quranReminders) {
        const data = buildReminderData(reminder, timezone);
        const isOwnedRecord =
          typeof reminder.id === "string" &&
          existingReminderIds.has(reminder.id);

        // existingIds is already scoped to this userId (from the findMany above),
        // so any match here is guaranteed to belong to the current user.
        const saved = isOwnedRecord
          ? await tx.reminder.update({ where: { id: reminder.id }, data })
          : await tx.reminder.create({ data: { ...data, userId } });

        savedQuranReminders.push(saved);
      }

      const khatmaData = {
        time: khatmaReminder.time,
        timezone,
        isEnabled: khatmaReminder.isEnabled,
      };
      const savedKhatmaReminder = await tx.khatmaReminder.upsert({
        where: { userId },
        update: khatmaData,
        create: {
          userId,
          ...khatmaData,
        },
      });

      return {
        quranReminders: savedQuranReminders,
        khatmaReminder: savedKhatmaReminder,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return unauthorized();
    }
    return serverError(error, "Error saving profile reminder settings");
  }
}
