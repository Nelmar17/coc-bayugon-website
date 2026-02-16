-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ContactReply" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "sentBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactReply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactReply" ADD CONSTRAINT "ContactReply_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ContactMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
