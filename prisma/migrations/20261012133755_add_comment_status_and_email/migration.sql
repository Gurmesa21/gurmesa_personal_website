-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "BlogComment" ADD COLUMN     "authorEmail" TEXT,
ADD COLUMN     "moderatedAt" TIMESTAMPTZ,
ADD COLUMN     "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "isApproved" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "BlogComment_status_idx" ON "BlogComment"("status");

-- Backfill status from isApproved
UPDATE "BlogComment" SET "status" = CASE WHEN "isApproved" = true THEN 'APPROVED'::"CommentStatus" ELSE 'PENDING'::"CommentStatus" END;
