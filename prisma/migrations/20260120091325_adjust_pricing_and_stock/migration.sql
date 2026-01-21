/*
  Warnings:

  - You are about to drop the column `priceBase` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "priceBase",
ADD COLUMN     "priceRetail" INTEGER;

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;
