-- CreateEnum
CREATE TYPE "ScheduleRecurrence" AS ENUM ('WEEKLY', 'MONTHLY_LAST');

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "recurrence" "ScheduleRecurrence";
