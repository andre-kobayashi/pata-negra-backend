import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaClient, ProductKind, StorageType } from "@prisma/client";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import sharp from "sharp";
import { join } from "path";
import { promises as fs } from "fs";

@Injectable()
export class ProductsService {
  private prisma = new PrismaClient();

  /* =========================
     🔢 CÁLCULO PREÇO ONLINE
  ========================= */
  private calculateOnlinePrice(
    basePrice: number,
    markupPercent: number
  ): number {
    if (!basePrice || !markupPercent) return basePrice;
    return Math.round(basePrice * (1 + markupPercent / 100));
  }

  /* =========================
     🖼️ PROCESSAMENTO DE IMAGEM
  ========================= */
  private async processImage(
    file: Express.Multer.File
  ): Promise<string> {
    try {
      const filename = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.webp`;

      const uploadPath = join(process.cwd(), "uploads", "products");

      await fs.mkdir(uploadPath, { recursive: true });

      await sharp(file.buffer)
        .resize(1000, 1000, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(join(uploadPath, filename));

      return `/uploads/products/${filename}`;
    } catch (error) {
      console.error("Erro no processamento da imagem:", error);
      throw new InternalServerErrorException(
        "Falha ao salvar imagem do produto"
      );
    }
  }

  /* =========================
     CREATE
  ========================= */
  async create(dto: CreateProductDto, file?: Express.Multer.File) {
    /* === REGRA DE MARKUP POR CATEGORIA === */
    let mainCategory: {
      onlineMarkupActive: boolean;
      onlineMarkupPercent: number;
    } | null = null;

    if (dto.categoryIds?.length) {
      mainCategory = await this.prisma.category.findUnique({
        where: { id: dto.categoryIds[0] },
        select: {
          onlineMarkupActive: true,
          onlineMarkupPercent: true,
        },
      });
    }

    let finalPriceOnline = dto.priceOnline ?? null;

    if (
      finalPriceOnline == null &&
      dto.priceRetail &&
      mainCategory?.onlineMarkupActive
    ) {
      finalPriceOnline = this.calculateOnlinePrice(
        dto.priceRetail,
        mainCategory.onlineMarkupPercent
      );
    }

    /* === IMAGEM === */
    let imagePath: string | null = null;
    if (file) {
      imagePath = await this.processImage(file);
    }

    try {
      return await this.prisma.product.create({
        data: {
          name: dto.name,
          description: dto.description || null,
          sku: dto.sku || null,
          kind: dto.kind,
          active: true,

          storageType: dto.storageType || StorageType.SECO,
          image: imagePath,

          seoTitle: dto.seoTitle || null,
          seoDescription: dto.seoDescription || null,

          /* FINANCEIRO */
          costPrice: dto.costPrice ?? null,
          priceRetail: dto.priceRetail ?? null,
          priceOnline: finalPriceOnline ?? dto.priceRetail ?? null,
          promoPrice: dto.promoPrice ?? null,

          /* CONFIGURÁVEL */
          basePricePerKg:
            dto.kind === ProductKind.CONFIGURABLE
              ? dto.basePricePerKg ?? dto.priceRetail ?? 0
              : null,

          baseWeightKg:
            dto.kind === ProductKind.CONFIGURABLE
              ? dto.baseWeightKg ?? 1
              : null,

          basePrepDays: dto.basePrepDays ?? 0,

          /* RELAÇÕES */
          categories: dto.categoryIds?.length
            ? {
                create: dto.categoryIds.map((id) => ({
                  categoryId: id,
                })),
              }
            : undefined,

          attributes: dto.attributeGroupIds?.length
            ? {
                create: dto.attributeGroupIds.map((groupId, index) => ({
                  groupId,
                  stepOrder: index,
                })),
              }
            : undefined,

          stock:
            dto.stock !== undefined
              ? {
                  create: {
                    quantity: parseFloat(String(dto.stock)),
                  },
                }
              : undefined,
        },
        include: {
          stock: true,
          categories: { include: { category: true } },
          attributes: { include: { group: true } },
        },
      });
    } catch (error) {
      console.error("Erro Prisma Create:", error);
      throw new InternalServerErrorException(
        "Erro ao salvar no banco de dados. Verifique os campos."
      );
    }
  }

  /* =========================
     UPDATE
  ========================= */
  async update(
    id: string,
    dto: UpdateProductDto,
    file?: Express.Multer.File
  ) {
    const data: any = { ...dto };

    delete data.categoryIds;
    delete data.attributeGroupIds;
    delete data.stock;

    if (file) {
      data.image = await this.processImage(file);
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...data,

        categories: dto.categoryIds
          ? {
              deleteMany: {},
              create: dto.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,

        attributes: dto.attributeGroupIds
          ? {
              deleteMany: {},
              create: dto.attributeGroupIds.map((groupId, index) => ({
                groupId,
                stepOrder: index,
              })),
            }
          : undefined,
      },
    });

    if (dto.stock !== undefined) {
      await this.prisma.stock.upsert({
        where: { productId: id },
        update: { quantity: parseFloat(String(dto.stock)) },
        create: {
          productId: id,
          quantity: parseFloat(String(dto.stock)),
        },
      });
    }

    return this.findOne(id);
  }

  /* =========================
     FIND ALL
  ========================= */
  async findAll() {
    return this.prisma.product.findMany({
      include: {
        stock: true,
        categories: { include: { category: true } },
        attributes: { include: { group: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /* =========================
     FIND ONE
  ========================= */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        stock: true,
        categories: { include: { category: true } },
        attributes: {
          orderBy: { stepOrder: "asc" },
          include: {
            group: { include: { options: true } },
          },
        },
      },
    });

    if (!product) {
      throw new BadRequestException("Produto não encontrado");
    }

    return product;
  }

  /* =========================
     DELETE
  ========================= */
  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}