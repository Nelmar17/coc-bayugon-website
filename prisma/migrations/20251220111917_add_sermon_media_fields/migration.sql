/*
  Warnings:

  - You are about to drop the column `content` on the `Sermon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sermon" DROP COLUMN "content",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "category" DROP NOT NULL;
