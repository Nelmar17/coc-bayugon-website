-- CreateEnum
CREATE TYPE "PreachingActivityType" AS ENUM ('gospel_meeting', 'midweek_service', 'sunday_service', 'visitation', 'mission_trip', 'youth_service', 'special_event');

-- CreateTable
CREATE TABLE "AboutWhoWeAre" (
    "id" SERIAL NOT NULL,
    "intro" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "belief" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutWhoWeAre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leader" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "imageId" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreachingActivity" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PreachingActivityType" NOT NULL,
    "preacher" TEXT NOT NULL,
    "description" TEXT,
    "outline" TEXT,
    "content" TEXT,
    "congregation" TEXT,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "scheduleId" INTEGER,
    "eventId" INTEGER,
    "coverImageUrl" TEXT,
    "coverImageId" TEXT,
    "gallery" TEXT[],
    "galleryIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreachingActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PreachingActivity" ADD CONSTRAINT "PreachingActivity_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreachingActivity" ADD CONSTRAINT "PreachingActivity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
