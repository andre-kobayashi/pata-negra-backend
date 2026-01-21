// src/products/products.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException, // 👈 Adicionado import necessário
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductsService } from "./services/products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("admin/products")
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  /* =========================
     LISTAR TODOS
  ========================= */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /* =========================
     BUSCAR UM (ID Único)
  ========================= */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    // 🔥 Proteção contra 'undefined' vindo do Frontend
    if (!id || id === "undefined") {
      throw new BadRequestException("ID do produto é obrigatório e não pode ser undefined");
    }
    return this.service.findOne(id);
  }

  /* =========================
     CREATE (FormData + Upload)
  ========================= */
  @Roles("ADMIN")
  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // Conversão de arrays vindos do FormData
    if (typeof (dto as any).categoryIds === "string") {
      try {
        (dto as any).categoryIds = JSON.parse((dto as any).categoryIds);
      } catch (e) {
        (dto as any).categoryIds = [];
      }
    }

    if (typeof (dto as any).attributeGroupIds === "string") {
      try {
        (dto as any).attributeGroupIds = JSON.parse((dto as any).attributeGroupIds);
      } catch (e) {
        (dto as any).attributeGroupIds = [];
      }
    }

    return this.service.create(dto, file);
  }

  /* =========================
     UPDATE (FormData + Upload)
  ========================= */
  @Roles("ADMIN")
  @Patch(":id")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // 🔥 Proteção contra 'undefined'
    if (!id || id === "undefined") {
      throw new BadRequestException("ID do produto inválido para atualização");
    }

    // Conversão de arrays vindos do FormData
    if (typeof (dto as any).categoryIds === "string") {
      try {
        (dto as any).categoryIds = JSON.parse((dto as any).categoryIds);
      } catch (e) {
        (dto as any).categoryIds = [];
      }
    }

    if (typeof (dto as any).attributeGroupIds === "string") {
      try {
        (dto as any).attributeGroupIds = JSON.parse((dto as any).attributeGroupIds);
      } catch (e) {
        (dto as any).attributeGroupIds = [];
      }
    }

    return this.service.update(id, dto, file);
  }

  /* =========================
     DELETE
  ========================= */
  @Roles("ADMIN")
  @Delete(":id")
  async remove(@Param("id") id: string) {
    if (!id || id === "undefined") {
      throw new BadRequestException("ID do produto inválido para exclusão");
    }
    return this.service.remove(id);
  }
}