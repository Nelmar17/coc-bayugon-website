/*
  Warnings:

  - You are about to drop the column `image` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "image",
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
