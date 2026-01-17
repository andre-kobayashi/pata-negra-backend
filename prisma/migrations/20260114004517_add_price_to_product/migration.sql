/*
  Warnings:

  - You are about to drop the column `price` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - Added the required column `total` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('FIXED', 'WEIGHT_BASED');

-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('RADIO', 'SELECT', 'CHECKBOX', 'MULTISELECT');

-- CreateEnum
CREATE TYPE "PriceModifierType" AS ENUM ('NONE', 'FIXED', 'PER_KG', 'PERCENT');

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "price",
ADD COLUMN     "basePrice" INTEGER,
ADD COLUMN     "finalWeightKg" DOUBLE PRECISION,
ADD COLUMN     "pricePerKg" INTEGER,
ADD COLUMN     "total" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
ADD COLUMN     "basePrice" INTEGER,
ADD COLUMN     "defaultWeightKg" DOUBLE PRECISION,
ADD COLUMN     "maxWeightKg" DOUBLE PRECISION,
ADD COLUMN     "minWeightKg" DOUBLE PRECISION,
ADD COLUMN     "pricePerKg" INTEGER,
ADD COLUMN     "type" "ProductType" NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "OptionGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "OptionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "condition" JSONB,

    CONSTRAINT "OptionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionValue" (
    "id" TEXT NOT NULL,
    "optionGroupId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceModifierType" "PriceModifierType" NOT NULL DEFAULT 'NONE',
    "priceModifierValue" INTEGER,
    "weightDeltaKg" DOUBLE PRECISION,
    "weightOverrideKg" DOUBLE PRECISION,
    "yieldRules" JSONB,

    CONSTRAINT "OptionValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemOption" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "optionGroupId" TEXT NOT NULL,
    "optionValueId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceImpact" INTEGER,
    "weightImpactKg" DOUBLE PRECISION,

    CONSTRAINT "OrderItemOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionGroup" ADD CONSTRAINT "OptionGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionValue" ADD CONSTRAINT "OptionValue_optionGroupId_fkey" FOREIGN KEY ("optionGroupId") REFERENCES "OptionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemOption" ADD CONSTRAINT "OrderItemOption_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
