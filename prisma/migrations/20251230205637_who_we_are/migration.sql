-- CreateTable
CREATE TABLE "WhoWeAre" (
    "id" SERIAL NOT NULL,
    "intro" TEXT,
    "mission" TEXT NOT NULL,
    "belief" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhoWeAre_pkey" PRIMARY KEY ("id")
);
