-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "acknowledgementStatus" "NotificationStatus",
ADD COLUMN     "notificationAttemptedAt" TIMESTAMPTZ,
ADD COLUMN     "notificationError" TEXT,
ADD COLUMN     "notificationStatus" "NotificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
