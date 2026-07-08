/*
  Warnings:

  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StoreCourierStatus" AS ENUM ('PENDING', 'ACTIVE', 'BLOCKED', 'KICKED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_ROUTE', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "StoreCourier" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "status" "StoreCourierStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreCourier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreCourier_storeId_status_idx" ON "StoreCourier"("storeId", "status");

-- CreateIndex
CREATE INDEX "StoreCourier_courierId_status_idx" ON "StoreCourier"("courierId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCourier_storeId_courierId_key" ON "StoreCourier"("storeId", "courierId");

-- AddForeignKey
ALTER TABLE "StoreCourier" ADD CONSTRAINT "StoreCourier_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCourier" ADD CONSTRAINT "StoreCourier_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
