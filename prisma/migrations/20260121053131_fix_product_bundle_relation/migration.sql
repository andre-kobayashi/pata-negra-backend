/*
  Warnings:

  - You are about to drop the column `kind` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `weightFixedKg` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `childProductId` on the `ProductBundleItem` table. All the data in the column will be lost.
  - You are about to drop the `ProductComponent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bundleId,productId]` on the table `ProductBundleItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `ProductBundleItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'CONFIGURABLE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'DYNAMIC');

-- DropForeignKey
ALTER TABLE "ProductBundleItem" DROP CONSTRAINT "ProductBundleItem_childProductId_fkey";

-- DropForeignKey
ALTER TABLE "ProductComponent" DROP CONSTRAINT "ProductComponent_parentId_fkey";

-- DropIndex
DROP INDEX "Product_active_kind_idx";

-- DropIndex
DROP INDEX "ProductBundleItem_bundleId_childProductId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "kind",
DROP COLUMN "weightFixedKg",
ADD COLUMN     "priceType" "PriceType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SIMPLE';

-- AlterTable
ALTER TABLE "ProductBundleItem" DROP COLUMN "childProductId",
ADD COLUMN     "productId" TEXT NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1.0,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "ProductComponent";

-- DropEnum
DROP TYPE "ProductKind";

-- CreateIndex
CREATE INDEX "Product_active_type_idx" ON "Product"("active", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBundleItem_bundleId_productId_key" ON "ProductBundleItem"("bundleId", "productId");

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
