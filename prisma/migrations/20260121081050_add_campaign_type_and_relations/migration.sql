/*
  Warnings:

  - You are about to drop the column `bannerUrl` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercent` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `campaignId` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('WEEKLY', 'DATE_RANGE');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_campaignId_fkey";

-- DropIndex
DROP INDEX "Campaign_active_idx";

-- DropIndex
DROP INDEX "Product_campaignId_idx";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "bannerUrl",
DROP COLUMN "discountPercent",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "bannerDesktop" TEXT,
ADD COLUMN     "bannerMobile" TEXT,
ADD COLUMN     "themeColor" TEXT,
ADD COLUMN     "type" "CampaignType" NOT NULL DEFAULT 'WEEKLY';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "campaignId";

-- CreateTable
CREATE TABLE "_ProductCampaigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductCampaigns_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryCampaigns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryCampaigns_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductCampaigns_B_index" ON "_ProductCampaigns"("B");

-- CreateIndex
CREATE INDEX "_CategoryCampaigns_B_index" ON "_CategoryCampaigns"("B");

-- CreateIndex
CREATE INDEX "Campaign_active_type_idx" ON "Campaign"("active", "type");

-- AddForeignKey
ALTER TABLE "_ProductCampaigns" ADD CONSTRAINT "_ProductCampaigns_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCampaigns" ADD CONSTRAINT "_ProductCampaigns_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryCampaigns" ADD CONSTRAINT "_CategoryCampaigns_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryCampaigns" ADD CONSTRAINT "_CategoryCampaigns_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
