import { prisma } from "../prisma";
import { getSessionPayload } from "./session";

export async function getSession() {
  const payload = await getSessionPayload();
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
}

export async function requireUser() {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
