/*
  Warnings:

  - You are about to drop the column `nextReminderAt` on the `KhatmaReminder` table. All the data in the column will be lost.
  - You are about to drop the column `nextReminderAt` on the `Reminder` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "KhatmaReminder_isEnabled_nextReminderAt_idx";

-- DropIndex
DROP INDEX "Reminder_isEnabled_nextReminderAt_idx";

-- AlterTable
ALTER TABLE "KhatmaReminder" DROP COLUMN "nextReminderAt";

-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "nextReminderAt";
