// backend/src/categories/categories.controller.ts
import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  UseInterceptors, UploadedFile, ParseIntPipe
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CategoriesService } from "./categories.service";
import { CategoryImageService } from "./image.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

//import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Verifique o caminho
import { UseGuards } from '@nestjs/common';


@Controller("admin/categories") // Adicionei admin/ para manter o padrão
export class CategoriesController {
  constructor(
    private readonly service: CategoriesService,
    private readonly imageService: CategoryImageService,
  ) {}

  //@UseGuards(JwtAuthGuard) // Protege o endpoint
  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let image: string | undefined;

    if (file) {
      // O seu imageService já deve converter para WebP aqui dentro
      image = await this.imageService.processImage(file.buffer);
    }

    return this.service.create({
      ...dto,
      image,
      // Garantir que tipos numéricos/booleanos sejam convertidos se vierem como string
      active: String(dto.active) === 'true',
      sort: Number(dto.sort) || 0,
    });
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let image: string | undefined;

    if (file) {
      image = await this.imageService.processImage(file.buffer);
    }

    return this.service.update(id, {
      ...dto,
      ...(image && { image }),
      active: dto.active !== undefined ? String(dto.active) === 'true' : undefined,
      sort: dto.sort !== undefined ? Number(dto.sort) : undefined,
    });
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}