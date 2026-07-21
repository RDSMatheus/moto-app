/*
  Warnings:

  - You are about to drop the column `address` on the `Store` table. All the data in the column will be lost.
  - Added the required column `city` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "neighborhood" TEXT NOT NULL,
ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;
