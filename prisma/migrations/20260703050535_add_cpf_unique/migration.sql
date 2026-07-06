/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `Courier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Courier_cpf_key" ON "Courier"("cpf");
