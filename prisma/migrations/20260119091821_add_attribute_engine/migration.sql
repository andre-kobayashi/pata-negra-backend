/*
  Warnings:

  - You are about to drop the column `condition` on the `AttributeGroup` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AttributeGroup` table. All the data in the column will be lost.
  - You are about to drop the column `baseWeightKg` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productSku` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `groupCode` on the `OrderItemSelection` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AttributeGroup_sort_idx";

-- DropIndex
DROP INDEX "OrderItem_orderId_idx";

-- DropIndex
DROP INDEX "OrderItem_productId_idx";

-- DropIndex
DROP INDEX "OrderItemSelection_orderItemId_idx";

-- DropIndex
DROP INDEX "ProductAttributeGroup_productId_stepOrder_idx";

-- DropIndex
DROP INDEX "ProductBundleItem_bundleId_idx";

-- DropIndex
DROP INDEX "ProductBundleItem_childProductId_idx";

-- DropIndex
DROP INDEX "ProductCategory_categoryId_idx";

-- DropIndex
DROP INDEX "ProductComponent_parentId_sort_idx";

-- AlterTable
ALTER TABLE "AttributeGroup" DROP COLUMN "condition",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "AttributeOption" ALTER COLUMN "priceModifierValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "baseWeightKg",
DROP COLUMN "productSku";

-- AlterTable
ALTER TABLE "OrderItemSelection" DROP COLUMN "groupCode",
ALTER COLUMN "priceImpact" SET DATA TYPE DOUBLE PRECISION;
