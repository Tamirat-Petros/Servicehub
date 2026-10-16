-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'KES',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffService" (
    "businessId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffService_pkey" PRIMARY KEY ("businessId", "staffId", "serviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_id_businessId_key" ON "Service"("id", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_businessId_name_key" ON "Service"("businessId", "name");

-- CreateIndex
CREATE INDEX "Service_businessId_isActive_idx" ON "Service"("businessId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_id_businessId_key" ON "StaffMember"("id", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_businessId_email_key" ON "StaffMember"("businessId", "email");

-- CreateIndex
CREATE INDEX "StaffMember_businessId_isActive_idx" ON "StaffMember"("businessId", "isActive");

-- CreateIndex
CREATE INDEX "StaffService_businessId_serviceId_idx" ON "StaffService"("businessId", "serviceId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffService" ADD CONSTRAINT "StaffService_staffId_businessId_fkey" FOREIGN KEY ("staffId", "businessId") REFERENCES "StaffMember"("id", "businessId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffService" ADD CONSTRAINT "StaffService_serviceId_businessId_fkey" FOREIGN KEY ("serviceId", "businessId") REFERENCES "Service"("id", "businessId") ON DELETE CASCADE ON UPDATE CASCADE;
