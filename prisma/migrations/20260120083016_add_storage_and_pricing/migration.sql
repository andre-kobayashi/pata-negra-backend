-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('SECO', 'REFRIGERADO', 'CONGELADO');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "onlineMarkupActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onlineMarkupPercent" DOUBLE PRECISION NOT NULL DEFAULT 12.0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "costPrice" INTEGER,
ADD COLUMN     "priceBase" INTEGER,
ADD COLUMN     "priceOnline" INTEGER,
ADD COLUMN     "promoPrice" INTEGER,
ADD COLUMN     "storageType" "StorageType" NOT NULL DEFAULT 'SECO';
