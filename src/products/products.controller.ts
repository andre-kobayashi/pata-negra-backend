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
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductsService } from "./services/products.service";
import { BundlesService } from "./services/bundles.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateBundleDto } from "./dto/create-bundle.dto";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("admin/products")
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly bundlesService: BundlesService
  ) {}

  /* =========================
     LISTAR PRODUTOS
  ========================= */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /* =========================
     BUSCAR PRODUTO
  ========================= */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    if (!id || id === "undefined") {
      throw new BadRequestException("ID inválido");
    }
    return this.service.findOne(id);
  }

  /* =========================
     CRIAR PRODUTO
  ========================= */
  @Roles("ADMIN")
  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    this.parseJsonFields(dto);
    return this.service.create(dto, file);
  }

  /* =========================
     🔥 CRIAR KIT (BUNDLE)
  ========================= */
  @Roles("ADMIN")
  @Post("bundle")
  async createBundle(@Body() dto: CreateBundleDto) {
    return this.bundlesService.create(dto);
  }

  /* =========================
     ATUALIZAR PRODUTO
  ========================= */
  @Roles("ADMIN")
  @Patch(":id")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Param("id") id: string,
    @Body() dto: any, // 👈 any para permitir parse manual
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (!id || id === "undefined") {
      throw new BadRequestException("ID inválido");
    }

    this.parseJsonFields(dto); // 🔥 resolve erro 400
    return this.service.update(id, dto, file);
  }

  /* =========================
     REMOVER PRODUTO
  ========================= */
  @Roles("ADMIN")
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  /* =========================
     🔧 HELPER: parse JSON do FormData
  ========================= */
  private parseJsonFields(dto: any) {
    const fields = [
      "categoryIds",
      "attributeGroupIds",
      "bundleItems", // 👈 agora incluso corretamente
    ];

    fields.forEach((field) => {
      if (typeof dto[field] === "string") {
        try {
          dto[field] = JSON.parse(dto[field]);
        } catch {
          dto[field] = [];
        }
      }
    });
  }
}