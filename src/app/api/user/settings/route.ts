import { Prisma } from "@/generated/prisma/client";
import { InputJsonValue } from "@/generated/prisma/internal/prismaNamespaceBrowser";

import { prisma } from "@/lib/prisma";
import { transformDBToResponse } from "@/lib/utils/setting";
import { ValidationError } from "@/server/errors/ValidationError";
import { SettingsValidator } from "@/server/validation/SettingsValidator";
import {
  DatabaseState,
  PlayHistoryDB,
  SettingsResponse,
  UserSettingsDB,
} from "@/types/settings";
import { WishlistReciterDB, WishlistSurahDB } from "@/types/wishlist";
import { requireUser } from "@/lib/oauth/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();

    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
      include: {
        wishlistSurahs: {
          orderBy: { createdAt: "desc" },
        },
        wishlistReciters: {
          orderBy: { createdAt: "desc" },
        },
        playHistory: true,
      },
      
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 },
      );
    }
    // Transform database response to match SettingsResponse type
    const response: SettingsResponse = transformDBToResponse(
      settings as unknown as UserSettingsDB & {
        wishlistSurahs: WishlistSurahDB[];
        wishlistReciters: WishlistReciterDB[];
        playHistory: PlayHistoryDB[];
      },
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();

    const data: DatabaseState = await request.json();
    // Validate all fields
    SettingsValidator.validate(data);
    const settingsPayload = {
      reciterId: data.reciterId,
      reciterName: data.reciterName?.trim() || "",
      volume: data.volume,
      fontStyle: data.fontStyle,
      fontSize: data.fontSize,
      ayahNumberStyle: data.ayahNumberStyle,
      language: data.language || "ar",
      lastRead: data.lastRead
        ? (data.lastRead as unknown as InputJsonValue)
        : Prisma.DbNull,
      lastReadAt: data.lastRead?.verse_number ? new Date() : null,
      lastPlayedSurahId: data.lastPlayedSurahId ?? null,
      lastPlayedAt: data.lastPlayedSurahId ? new Date().toISOString() : null,
      athkarData: (data.athkarData ?? {}) as InputJsonValue,
      athkarExpiration: data.athkarExpiration
        ? new Date(data.athkarExpiration)
        : null,
    };
    // Update user settings in the database
    await prisma.$transaction(
      async (tx) => {
        const settings = await tx.userSettings.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            ...settingsPayload,
          },
          update: {
            ...settingsPayload,
          },
        });
        if (data.playHistory !== undefined && data.playHistory.length > 0) {
          // Delete existing play history
          await tx.playHistory.deleteMany({
            where: { settingsId: settings.id },
          });

          // Insert new play history records
          await tx.playHistory.createMany({
            data: data.playHistory.map((play) => ({
              settingsId: settings.id,
              surahId: play.number,
              reciterId: play.reciterId ?? 0,
              reciterName: play.reciterName ?? "",
              mushafId:
                typeof play.mushafId === "number"
                  ? play.mushafId
                  : parseInt(String(play.mushafId ?? 0), 10),
              mushafName: play.mushafName ?? "",
              englishName: play.englishName ?? "",
              englishNameTranslation: play.englishNameTranslation ?? "",
              shortName: play.shortName ?? "",
              revelationType: play.revelationType ?? "",
              numberOfAyahs: play.numberOfAyahs,
              url: play.serverLink ?? "",
              surahName: play.name,
            })),
            skipDuplicates: true,
          });
        }

        // Update wishlist separately
        if (
          data.wishlistSurahs !== undefined &&
          data.wishlistSurahs.length > 0
        ) {
          await tx.wishlistSurah.deleteMany({
            where: { settingsId: settings.id },
          });

          if (data.wishlistSurahs.length > 0) {
            await tx.wishlistSurah.createMany({
              data: data.wishlistSurahs.map((surah) => ({
                settingsId: settings.id,
                surahId: surah.number,
                surahName: surah.name,
                mushafId:
                  typeof surah.mushafId === "number"
                    ? surah.mushafId
                    : parseInt(String(surah.mushafId ?? 0), 10),
                mushafName: surah.mushafName ?? "",
                reciterId: surah.reciterId ?? 0,
                reciterName: surah.reciterName ?? "",
                shortName: surah.shortName ?? "",
                revelationType: surah.revelationType ?? "",
                englishName: surah.englishName ?? "",
                englishNameTranslation: surah.englishNameTranslation ?? "",
                numberOfAyahs: surah.numberOfAyahs ?? 0,
                url: surah.serverLink ?? "",
              })),
              // All fields are guaranteed to be present after SettingsValidator.validate(data)
              skipDuplicates: true,
            });
          }
        }
        if (
          data.wishlistReciters !== undefined &&
          data.wishlistReciters.length > 0
        ) {
          // Always delete existing
          await tx.wishlistReciter.deleteMany({
            where: { settingsId: settings.id },
          });

          // Create new ones if array has items
          if (data.wishlistReciters.length > 0) {
            await tx.wishlistReciter.createMany({
              data: data.wishlistReciters.map((reciter) => ({
                reciterId: reciter.reciter_id,
                settingsId: settings.id,
                reciterName: reciter.reciter_name,
                reciterImage: reciter.reciter_image,
                mushafId: reciter.mushaf_id,
                mushafName: reciter.mushaf_name,
              })),
              skipDuplicates: true,
            });
          }
        }
      },
      { maxWait: 5000, timeout: 10000 },
    );

    return NextResponse.json("Settings updated", { status: 200 });
  } catch (error) {
    console.log(error,'error from update setting')
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(error.message, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Duplicate entry" }, { status: 409 });
      }
      // Record not found
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 },
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error: "Invalid reference",
            details: "Referenced record does not exist",
          },
          { status: 400 },
        );
      }
    }
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
