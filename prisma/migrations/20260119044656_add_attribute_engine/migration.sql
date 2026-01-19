/*
  Warnings:

  - You are about to drop the column `basePrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerKg` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `defaultWeightKg` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerKg` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `OptionGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OptionValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItemOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('SIMPLE', 'CONFIGURABLE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "AttributeInputType" AS ENUM ('RADIO', 'SELECT', 'CHECKBOX', 'MULTISELECT');

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "OptionGroup" DROP CONSTRAINT "OptionGroup_productId_fkey";

-- DropForeignKey
ALTER TABLE "OptionValue" DROP CONSTRAINT "OptionValue_optionGroupId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemOption" DROP CONSTRAINT "OrderItemOption_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_productId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_productId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "basePrice",
DROP COLUMN "pricePerKg",
ADD COLUMN     "basePricePerKg" INTEGER,
ADD COLUMN     "baseWeightKg" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "extraPrepDays" INTEGER DEFAULT 0,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "productSku" TEXT,
ADD COLUMN     "unitPrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "basePrice",
DROP COLUMN "defaultWeightKg",
DROP COLUMN "price",
DROP COLUMN "pricePerKg",
DROP COLUMN "type",
ADD COLUMN     "basePrepDays" INTEGER DEFAULT 0,
ADD COLUMN     "basePricePerKg" INTEGER,
ADD COLUMN     "baseWeightKg" DOUBLE PRECISION DEFAULT 1.0,
ADD COLUMN     "kind" "ProductKind" NOT NULL DEFAULT 'SIMPLE',
ADD COLUMN     "priceFixed" INTEGER,
ADD COLUMN     "weightFixedKg" DOUBLE PRECISION;

-- DropTable
DROP TABLE "OptionGroup";

-- DropTable
DROP TABLE "OptionValue";

-- DropTable
DROP TABLE "OrderItemOption";

-- DropEnum
DROP TYPE "OptionType";

-- DropEnum
DROP TYPE "ProductType";

-- CreateTable
CREATE TABLE "AttributeGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "inputType" "AttributeInputType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "condition" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeOption" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sku" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "priceModifierType" "PriceModifierType" NOT NULL DEFAULT 'NONE',
    "priceModifierValue" INTEGER,
    "weightMultiplier" DOUBLE PRECISION,
    "weightDeltaKg" DOUBLE PRECISION,
    "weightOverrideKg" DOUBLE PRECISION,
    "extraPrepDays" INTEGER DEFAULT 0,
    "yieldRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL DEFAULT 0,
    "requiredOverride" BOOLEAN,
    "condition" JSONB,

    CONSTRAINT "ProductAttributeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "childProductId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProductBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductComponent" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemSelection" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "groupId" TEXT,
    "optionId" TEXT,
    "groupCode" TEXT,
    "groupName" TEXT,
    "optionLabel" TEXT,
    "priceImpact" INTEGER,
    "weightImpactKg" DOUBLE PRECISION,
    "extraPrepDays" INTEGER,

    CONSTRAINT "OrderItemSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttributeGroup_code_key" ON "AttributeGroup"("code");

-- CreateIndex
CREATE INDEX "AttributeGroup_sort_idx" ON "AttributeGroup"("sort");

-- CreateIndex
CREATE INDEX "AttributeOption_groupId_sort_idx" ON "AttributeOption"("groupId", "sort");

-- CreateIndex
CREATE INDEX "ProductAttributeGroup_productId_stepOrder_idx" ON "ProductAttributeGroup"("productId", "stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeGroup_productId_groupId_key" ON "ProductAttributeGroup"("productId", "groupId");

-- CreateIndex
CREATE INDEX "ProductBundleItem_bundleId_idx" ON "ProductBundleItem"("bundleId");

-- CreateIndex
CREATE INDEX "ProductBundleItem_childProductId_idx" ON "ProductBundleItem"("childProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBundleItem_bundleId_childProductId_key" ON "ProductBundleItem"("bundleId", "childProductId");

-- CreateIndex
CREATE INDEX "ProductComponent_parentId_sort_idx" ON "ProductComponent"("parentId", "sort");

-- CreateIndex
CREATE INDEX "OrderItemSelection_orderItemId_idx" ON "OrderItemSelection"("orderItemId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_active_sort_idx" ON "Category"("active", "sort");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Product_active_kind_idx" ON "Product"("active", "kind");

-- CreateIndex
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeOption" ADD CONSTRAINT "AttributeOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AttributeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeGroup" ADD CONSTRAINT "ProductAttributeGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeGroup" ADD CONSTRAINT "ProductAttributeGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AttributeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_childProductId_fkey" FOREIGN KEY ("childProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductComponent" ADD CONSTRAINT "ProductComponent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSelection" ADD CONSTRAINT "OrderItemSelection_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
