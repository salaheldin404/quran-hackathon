import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import ProfilePageClient from "@/components/profile/ProfilePageClient";

import { prisma } from "@/lib/prisma";
import { getUserIdFromCookie } from "@/lib/oauth/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProfilePage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/profile`,
      languages: {
        en: "/en/profile",
        ar: "/ar/profile",
      },
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: "en" | "ar" }>;
}) {
  const { locale } = await params;
  const userId = await getUserIdFromCookie();
  if (!userId) {
    redirect(`/${locale}/auth/signin`);
  }
  const [user, quranReminders, khatmaReminder] = await prisma.$transaction([
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
      where: { userId: userId },
      orderBy: [{ createdAt: "asc" }, { updatedAt: "asc" }],
    }),
    prisma.khatmaReminder.findUnique({
      where: { userId: userId },
    }),
  ]);

  if (!user?.email) {
    redirect(`/${locale}/auth/signin`);
  }

  return (
    <ProfilePageClient
      profile={{
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : null,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        pushDeviceCount: user._count.pushSubscriptions,
      }}
      initialQuranReminders={quranReminders.map((quranReminder) => ({
        id: quranReminder.id,
        surahId: quranReminder.surahId,
        days: quranReminder.days,
        time: quranReminder.time,
        timezone: quranReminder.timezone,
        isEnabled: quranReminder.isEnabled,
      }))}
      initialKhatmaReminder={{
        id: khatmaReminder?.id,
        time: khatmaReminder?.time ?? "20:30",
        timezone: khatmaReminder?.timezone ?? "UTC",
        isEnabled: khatmaReminder?.isEnabled ?? false,
      }}
    />
  );
}
