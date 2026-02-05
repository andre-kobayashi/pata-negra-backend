import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { CategoryImageService } from "./image.service";
import { CategoriesPublicController } from "./categories-public.controller";
import { PrismaService } from "../prisma/prisma.service";
@Module({
  controllers: [CategoriesController, CategoriesPublicController],
  providers: [CategoriesService, CategoryImageService, PrismaService],  
})
export class CategoriesModule {}