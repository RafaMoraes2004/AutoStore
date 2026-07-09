/*
  Warnings:

  - You are about to alter the column `preco_a_partir_rs` on the `carros` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "carros" ALTER COLUMN "preco_a_partir_rs" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE INDEX "carros_categoria_idx" ON "carros"("categoria");

-- CreateIndex
CREATE INDEX "carros_preco_a_partir_rs_idx" ON "carros"("preco_a_partir_rs");
