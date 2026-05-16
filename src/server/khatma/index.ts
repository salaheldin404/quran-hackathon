"use server";


import { TOTAL_QURAN_PAGES } from "@/lib/constants/khatma";
import { prisma } from "@/lib/prisma";
import { calculateDaysAndTarget } from "@/lib/utils/khatma";
import {
  getKhatmaSchema,
  type KhatmaInput,
} from "@/lib/validations/khatmaSchema";
import type {
  KhatmaActionResult,
  UpdateKhatmaPlanData,
} from "@/types/khatma";
import { getLocale, getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { getUserIdFromCookie } from "@/lib/oauth/session";

// ─── Helpers ────────────────────────────────────────────────────────────────



/** Revalidate khatma-related caches. */
async function revalidateKhatma() {
  const locale = await getLocale();
  // revalidateTag("khatmaPlans");
  revalidatePath(`/${locale}/khatma`);
}

/** Find a plan owned by the given user, or return null. */
export async function findOwnedPlan(id: string, userId: string) {
  return prisma.khatmaPlan.findFirst({ where: { id, userId } });
}

const unauthorized: KhatmaActionResult = {
  message: "Unauthorized",
  status: 401,
};

// ─── Actions ────────────────────────────────────────────────────────────────

export async function createKhatmaPlan(
  data: KhatmaInput,
): Promise<KhatmaActionResult> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Khatma" });
  const tVal = await getTranslations({
    locale,
    namespace: "KhatmaValidation",
  });

  try {
    const userId = await getUserIdFromCookie();
    if (!userId) return unauthorized;

    // Validate with schema
    const validation = getKhatmaSchema(tVal).safeParse(data);
    if (!validation.success) {
      const firstError = Object.values(
        validation.error.flatten().fieldErrors,
      ).flat()[0];
      return { message: firstError ?? tVal("pagesPerDayInvalid"), status: 400 };
    }

    // Only one active plan allowed
    const existing = await prisma.khatmaPlan.findFirst({
      where: { userId, isCompleted: false },
    });
    if (existing) {
      return { message: t("existingPlanError"), status: 400 };
    }

    const { pagesPerDay, title, notes } = validation.data;
    const startDate = new Date();
    const { targetDate } = calculateDaysAndTarget(
      pagesPerDay,
      TOTAL_QURAN_PAGES,
    );

    await prisma.khatmaPlan.create({
      data: {
        userId,
        pagesPerDay,
        totalPages: TOTAL_QURAN_PAGES,
        startDate,
        targetEndDate: targetDate,
        title: title || null,
        notes: notes || null,
      },
    });

    await revalidateKhatma();
    return { message: t("planCreated"), status: 201 };
  } catch (error) {
    console.error("Error creating khatma plan:", error);
    return { message: t("createError"), status: 500 };
  }
}

export async function updateKhatma(
  id: string,
  data: UpdateKhatmaPlanData,
): Promise<KhatmaActionResult> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Khatma" });

  try {
    const userId = await getUserIdFromCookie();
    if (!userId) return unauthorized;

    const plan = await findOwnedPlan(id, userId);
    if (!plan) return { message: t("planNotFound"), status: 404 };

    // Build update payload — only include defined fields
    const update: Record<string, unknown> = {};

    if (data.currentPage !== undefined) update.currentPage = data.currentPage;
    if (data.completedPages !== undefined)
      update.completedPages = data.completedPages;
    if (data.isActive !== undefined) update.isActive = data.isActive;
    if (data.title !== undefined) update.title = data.title;
    if (data.notes !== undefined) update.notes = data.notes;
    if  (data.pausedAt !== undefined) update.pausedAt = data.pausedAt;
    if (data.totalPausedDays !== undefined) update.totalPausedDays = data.totalPausedDays;  
    if (data.bookMarkIndex !== undefined) update.bookMarkIndex = data.bookMarkIndex;

    // Handle completion
    if (data.isCompleted !== undefined) {
      update.isCompleted = data.isCompleted;
      update.completedAt = data.isCompleted ? new Date() : null;
      if (data.isCompleted) {
        update.isActive = false;
        update.completedPages = plan.totalPages;
        update.currentPage = plan.totalPages;
      }
    }

    // Recalculate target date when pace changes
    if (
      data.pagesPerDay !== undefined &&
      data.pagesPerDay !== plan.pagesPerDay
    ) {
      update.pagesPerDay = data.pagesPerDay;
      const remaining = plan.totalPages - plan.completedPages;
      const { targetDate } = calculateDaysAndTarget(
        data.pagesPerDay,
        remaining,
      );
      update.targetEndDate = targetDate;
    }

    await prisma.khatmaPlan.update({ where: { id }, data: update });

    await revalidateKhatma();
    return { message: t("planUpdated"), status: 200 };
  } catch (error) {
    console.error("Error updating khatma plan:", error);
    return { message: t("updateError"), status: 500 };
  }
}

export async function deleteKhatmaPlan(
  id: string,
): Promise<KhatmaActionResult> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Khatma" });

  try {
    const userId = await getUserIdFromCookie();
    if (!userId) return unauthorized;

    const plan = await findOwnedPlan(id, userId);
    if (!plan) return { message: t("planNotFound"), status: 404 };

    await prisma.khatmaPlan.delete({ where: { id } });

    await revalidateKhatma();
    return { message: t("planDeleted"), status: 200 };
  } catch (error) {
    console.error("Error deleting khatma plan:", error);
    return { message: t("deleteError"), status: 500 };
  }
}
