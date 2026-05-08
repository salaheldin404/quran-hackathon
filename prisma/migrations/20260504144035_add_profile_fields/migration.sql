-- DropIndex
DROP INDEX "User_qfUserId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "expiresAt" DROP NOT NULL;
