-- AlterTable
ALTER TABLE "Business" ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'Africa/Nairobi';

-- CreateTable
CREATE TABLE "StaffSchedule" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffSchedule_businessId_staffId_weekday_startMinute_key" ON "StaffSchedule"("businessId", "staffId", "weekday", "startMinute");

-- CreateIndex
CREATE INDEX "StaffSchedule_businessId_staffId_weekday_idx" ON "StaffSchedule"("businessId", "staffId", "weekday");

-- AddForeignKey
ALTER TABLE "StaffSchedule" ADD CONSTRAINT "StaffSchedule_staffId_businessId_fkey" FOREIGN KEY ("staffId", "businessId") REFERENCES "StaffMember"("id", "businessId") ON DELETE CASCADE ON UPDATE CASCADE;
