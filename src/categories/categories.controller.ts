import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CategoriesService } from "./categories.service";
import { CategoryImageService } from "./image.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("admin/categories")
export class CategoriesController {
  constructor(
    private readonly service: CategoriesService,
    private readonly imageService: CategoryImageService
  ) {}

  /* =========================
     CREATE
  ========================= */
  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    let image: string | undefined;

    if (file) {
      image = await this.imageService.processImage(file.buffer);
    }

    return this.service.create({
      ...dto,
      image,

      // Garantir tipos corretos (FormData → string)
      active: String(dto.active) === "true",
      sort: Number(dto.sort) || 0,

      onlineMarkupActive: String((dto as any).onlineMarkupActive) === "true",
      onlineMarkupPercent: (dto as any).onlineMarkupPercent
        ? Number((dto as any).onlineMarkupPercent)
        : 12,

      // ✅ NUNCA use null aqui (DTO aceita string | undefined)
      parentId:
        dto.parentId === "null" || dto.parentId === ""
          ? undefined
          : dto.parentId,
    });
  }

  /* =========================
     UPDATE
  ========================= */
  @Patch(":id")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Param("id") id: string,
    @Body() dto: any, // 🔥 any para tratar conversões manuais
    @UploadedFile() file?: Express.Multer.File
  ) {
    let image: string | undefined;

    if (file) {
      image = await this.imageService.processImage(file.buffer);
    }

    const updateDto: UpdateCategoryDto = {
      ...dto,
      ...(image && { image }),

      active: String(dto.active) === "true",
      sort: dto.sort ? Number(dto.sort) : 0,

      onlineMarkupActive: String(dto.onlineMarkupActive) === "true",
      onlineMarkupPercent: dto.onlineMarkupPercent
        ? Number(dto.onlineMarkupPercent)
        : 12,

      // ✅ undefined em vez de null
      parentId:
        dto.parentId === "null" || dto.parentId === ""
          ? undefined
          : dto.parentId,
    };

    return this.service.update(id, updateDto);
  }

  /* =========================
     LISTAGEM
  ========================= */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /* =========================
     DELETE
  ========================= */
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}