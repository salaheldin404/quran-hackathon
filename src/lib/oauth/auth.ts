import { prisma } from "../prisma";
import { getUserIdFromCookie } from "./session";

export async function getSession() {
  const userId = await getUserIdFromCookie();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) return null;
  return user;
}

export async function requireUser() {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
