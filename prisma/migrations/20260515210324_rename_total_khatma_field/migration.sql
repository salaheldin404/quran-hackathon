/*
  Warnings:

  - You are about to drop the column `totalKhatmaCompletions` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "totalKhatmaCompletions",
ADD COLUMN     "completedKhatmas" INTEGER NOT NULL DEFAULT 0;
