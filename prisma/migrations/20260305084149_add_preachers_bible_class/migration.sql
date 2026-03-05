/*
  Warnings:

  - You are about to drop the `NewsletterSubscriber` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "PreachingActivityType" ADD VALUE 'preachers_bible_class';

-- DropTable
DROP TABLE "NewsletterSubscriber";
