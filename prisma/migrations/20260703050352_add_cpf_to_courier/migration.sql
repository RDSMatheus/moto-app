/*
  Warnings:

  - Added the required column `cpf` to the `Courier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Courier" ADD COLUMN     "cpf" TEXT NOT NULL;
