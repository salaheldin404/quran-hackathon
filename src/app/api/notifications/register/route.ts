import { NextResponse } from "next/server";
import { requireUser } from "@/lib/oauth/auth";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const { token, userAgent } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { token },
      update: {
        userId: user.id,
        userAgent,
      },
      create: {
        token,
        userId: user.id,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error registering push token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        token,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error unregistering push token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
