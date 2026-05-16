import { prisma } from "@/lib/prisma";
import { calculateDaysAndTarget } from "@/lib/utils/khatma";
import type { UpdateKhatmaPlanData } from "@/types/khatma";
import { requireUser } from "@/lib/oauth/auth";
import { getLocale } from "next-intl/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const notFound = () =>
  NextResponse.json({ error: "Plan not found" }, { status: 404 });

const serverError = (action: string, error: unknown) => {
  if (error instanceof Error && error.message === "Unauthorized") {
    return unauthorized();
  }
  console.error(`Error ${action} khatma plan:`, error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
};

async function revalidateKhatma() {
  const locale = await getLocale();
  revalidateTag("khatmaPlans");
  revalidatePath(`/${locale}/khatma`);
}

async function findOwnedPlan(id: string, userId: string) {
  return prisma.khatmaPlan.findFirst({ where: { id, userId } });
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();

    const { id } = await params;
    const plan = await findOwnedPlan(id, user.id);
    if (!plan) return notFound();

    return NextResponse.json(plan, { status: 200 });
  } catch (error) {
    return serverError("fetching", error);
  }
}

// ─── PATCH ──────────────────────────────────────────────────────────────────

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();

    const { id } = await params;
    const plan = await findOwnedPlan(id, user.id);
    if (!plan) return notFound();

    const body: UpdateKhatmaPlanData = await request.json();
    const update: Record<string, unknown> = {};

    if (body.currentPage !== undefined) update.currentPage = body.currentPage;
    if (body.completedPages !== undefined)
      update.completedPages = body.completedPages;
    if (body.isActive !== undefined) update.isActive = body.isActive;
    if (body.title !== undefined) update.title = body.title;
    if (body.notes !== undefined) update.notes = body.notes;

    // Handle completion
    if (body.isCompleted !== undefined) {
      update.isCompleted = body.isCompleted;
      update.completedAt = body.isCompleted ? new Date() : null;
      if (body.isCompleted) {
        update.isActive = false;
        update.completedPages = plan.totalPages;
        update.currentPage = plan.totalPages;
      }
    }

    // Recalculate target when pace changes
    if (
      body.pagesPerDay !== undefined &&
      body.pagesPerDay !== plan.pagesPerDay
    ) {
      update.pagesPerDay = body.pagesPerDay;
      const remaining = plan.totalPages - plan.completedPages;
      const { targetDate } = calculateDaysAndTarget(
        body.pagesPerDay,
        remaining,
      );
      update.targetEndDate = targetDate;
    }

    const updated = await prisma.khatmaPlan.update({
      where: { id },
      data: update,
    });
    if (updated.isCompleted) {
      await prisma.user.update({
        where: { id: user.id },
        data: { completedKhatmas: { increment: 1 } },
      });
    }

    await revalidateKhatma();
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return serverError("updating", error);
  }
}

// ─── DELETE ─────────────────────────────────────────────────────────────────

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();

    const { id } = await params;
    const plan = await findOwnedPlan(id, user.id);
    if (!plan) return notFound();

    await prisma.khatmaPlan.delete({ where: { id } });

    await revalidateKhatma();
    return NextResponse.json(
      { message: "Plan deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return serverError("deleting", error);
  }
}
