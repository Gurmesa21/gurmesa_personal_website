-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_COMMENT';

-- AlterTable
ALTER TABLE "BlogComment" ALTER COLUMN "isApproved" SET DEFAULT false;
