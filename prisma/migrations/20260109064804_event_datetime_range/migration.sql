/*
  Warnings:

  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "eventDate" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;
