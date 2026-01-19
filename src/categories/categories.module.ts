import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { CategoryImageService } from "./image.service";

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryImageService],
})
export class CategoriesModule {}