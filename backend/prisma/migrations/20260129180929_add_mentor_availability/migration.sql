-- CreateTable
CREATE TABLE "mentor_availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "slotType" TEXT NOT NULL DEFAULT 'REGULAR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "mentor_availability_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "mentor_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "mentor_availability_mentorId_idx" ON "mentor_availability"("mentorId");

-- CreateIndex
CREATE INDEX "mentor_availability_dayOfWeek_idx" ON "mentor_availability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "mentor_availability_isActive_idx" ON "mentor_availability"("isActive");
