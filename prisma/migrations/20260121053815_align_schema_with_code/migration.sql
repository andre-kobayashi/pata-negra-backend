/*
  Warnings:

  - You are about to drop the column `type` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('SIMPLE', 'CONFIGURABLE', 'BUNDLE');

-- DropIndex
DROP INDEX "Product_active_type_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "type",
ADD COLUMN     "kind" "ProductKind" NOT NULL DEFAULT 'SIMPLE',
ADD COLUMN     "weightFixedKg" DOUBLE PRECISION;

-- DropEnum
DROP TYPE "ProductType";

-- CreateIndex
CREATE INDEX "Product_active_kind_idx" ON "Product"("active", "kind");
