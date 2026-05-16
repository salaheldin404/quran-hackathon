/*
  Warnings:

  - You are about to drop the column `accessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "KhatmaReminder" ADD COLUMN     "nextReminderAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "nextReminderAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessToken",
DROP COLUMN "expiresAt",
ADD COLUMN     "totalKhatmaCompletions" INTEGER NOT NULL DEFAULT 0;
