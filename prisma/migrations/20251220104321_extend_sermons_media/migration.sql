/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `Sermon` table. All the data in the column will be lost.
  - Added the required column `category` to the `Sermon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sermon" DROP COLUMN "thumbnail",
ADD COLUMN     "audioId" TEXT,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "documentId" TEXT,
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "videoId" TEXT;
