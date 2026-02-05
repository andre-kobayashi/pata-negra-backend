import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ProductKind, StorageType, PriceType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import sharp from "sharp";
import { join } from "path";
import { promises as fs } from "fs";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /* =========================
     🔢 CÁLCULO PREÇO ONLINE
  ========================= */
  private calculateOnlinePrice(basePrice: number, markupPercent: number): number {
    if (!basePrice || !markupPercent) return basePrice;
    return Math.round(basePrice * (1 + markupPercent / 100));
  }

  /* =========================
     🖼️ PROCESSAMENTO DE IMAGEM
  ========================= */
  private async processImage(file: Express.Multer.File): Promise<string> {
    try {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const uploadPath = join(process.cwd(), "uploads", "products");

      await fs.mkdir(uploadPath, { recursive: true });

      await sharp(file.buffer)
        .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(join(uploadPath, filename));

      // Mantém seu padrão atual
      return `/uploads/products/${filename}`;
    } catch (error) {
      console.error("Erro no processamento da imagem:", error);
      throw new InternalServerErrorException("Falha ao salvar imagem do produto");
    }
  }

  /* =========================
     🔥 PARSE DE BUNDLE ITEMS
     (aceita string JSON ou array)
  ========================= */
  private parseBundleItems(raw: any): { productId: string; quantity: number }[] {
    if (!raw) return [];

    let parsed: any = raw;

    if (typeof raw === "string") {
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new BadRequestException("bundleItems inválido (JSON malformado).");
      }
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException("bundleItems inválido (deve ser um array).");
    }

    return parsed.map((item: any) => ({
      productId: String(item.productId),
      quantity: Number(item.quantity) || 1,
    }));
  }

  /* =========================
     CREATE (COM TRANSACTION)
     - cria produto
     - cria relações
     - cria bundleItems se BUNDLE
     - cria stock APENAS se NÃO for BUNDLE
  ========================= */
 async create(dto: CreateProductDto, file?: Express.Multer.File) {
    // 1️⃣ Extrai campos especiais
    const {
      categoryIds,
      attributeGroupIds,
      bundleItems: rawBundleItems,
      stock,
      ...rest
    } = dto as any;

    // 2️⃣ Normalização de tipos (🔥 CORREÇÃO PRINCIPAL)
    const data = {
      ...rest,

      // preços INT
      priceRetail: rest.priceRetail ? parseInt(rest.priceRetail, 10) : null,
      priceOnline: rest.priceOnline ? parseInt(rest.priceOnline, 10) : null,
      costPrice: rest.costPrice ? parseInt(rest.costPrice, 10) : null,
      promoPrice: rest.promoPrice ? parseInt(rest.promoPrice, 10) : null,
      priceFixed: rest.priceFixed ? parseInt(rest.priceFixed, 10) : null,

      // configurável
      basePricePerKg: rest.basePricePerKg
        ? parseInt(rest.basePricePerKg, 10)
        : null,
      baseWeightKg: rest.baseWeightKg
        ? parseFloat(rest.baseWeightKg)
        : null,
      basePrepDays: rest.basePrepDays
        ? parseInt(rest.basePrepDays, 10)
        : 0,

      // boolean
      active: String(rest.active) === "true" || rest.active === true,
    };

    // 3️⃣ Markup por categoria
    let mainCategory: { onlineMarkupActive: boolean; onlineMarkupPercent: number } | null =
      null;

    if (Array.isArray(categoryIds) && categoryIds.length) {
      mainCategory = await this.prisma.category.findUnique({
        where: { id: categoryIds[0] },
        select: { onlineMarkupActive: true, onlineMarkupPercent: true },
      });
    }

    if (
      data.priceOnline == null &&
      data.priceRetail &&
      mainCategory?.onlineMarkupActive
    ) {
      data.priceOnline = this.calculateOnlinePrice(
        data.priceRetail,
        mainCategory.onlineMarkupPercent
      );
    }

    // 4️⃣ Imagem
    let imagePath: string | null = null;
    if (file) {
      imagePath = await this.processImage(file);
    }

    // 5️⃣ Bundle items
    const bundleItems =
      dto.kind === ProductKind.BUNDLE && rawBundleItems
        ? this.parseBundleItems(rawBundleItems)
        : [];

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 6️⃣ Produto
        const product = await tx.product.create({
          data: {
            ...data,
            kind: dto.kind,
            priceType: data.priceType ?? PriceType.FIXED,
            storageType: data.storageType ?? StorageType.SECO,
            image: imagePath,

            categories: Array.isArray(categoryIds)
              ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
              : undefined,

            attributes: Array.isArray(attributeGroupIds)
              ? {
                  create: attributeGroupIds.map((id: string, index: number) => ({
                    groupId: id,
                    stepOrder: index,
                  })),
                }
              : undefined,

            bundleItems:
              dto.kind === ProductKind.BUNDLE && bundleItems.length
                ? {
                    create: bundleItems.map((item) => ({
                      productId: item.productId,
                      quantity: item.quantity,
                    })),
                  }
                : undefined,
          },
        });

        // 7️⃣ Estoque (não cria para kit)
        if (dto.kind !== ProductKind.BUNDLE) {
          await tx.stock.create({
            data: {
              productId: product.id,
              quantity: parseFloat(String(stock ?? 0)) || 0,
            },
          });
        }

        // 8️⃣ Retorno completo
        return tx.product.findUnique({
          where: { id: product.id },
          include: {
            stock: true,
            categories: { include: { category: true } },
            attributes: { include: { group: true } },
            bundleItems: { include: { product: true } },
          },
        });
      });
    } catch (error) {
      console.error("Erro Prisma Create (transaction):", error);
      throw new InternalServerErrorException(
        "Erro ao salvar no banco de dados. Verifique os campos."
      );
    }
  }


  /* =========================
     UPDATE
     - atualiza produto + relações
     - sincroniza bundleItems se vier
     - estoque: só se produto final NÃO for BUNDLE
       (se virar BUNDLE, apaga stock)
  ========================= */
  async update(id: string, dto: UpdateProductDto, file?: Express.Multer.File) {
    // precisamos saber o kind final para regra do estoque
    const current = await this.prisma.product.findUnique({
      where: { id },
      select: { kind: true },
    });

    if (!current) {
      throw new BadRequestException("Produto não encontrado");
    }

    const nextKind = (dto as any).kind ?? current.kind;

    const data: any = { ...dto };

    delete data.categoryIds;
    delete data.attributeGroupIds;
    delete data.stock;
    delete data.bundleItems;

    if (file) {
      data.image = await this.processImage(file);
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...data,

        categories: (dto as any).categoryIds
          ? {
              deleteMany: {},
              create: (dto as any).categoryIds.map((categoryId: string) => ({
                categoryId,
              })),
            }
          : undefined,

        attributes: (dto as any).attributeGroupIds
          ? {
              deleteMany: {},
              create: (dto as any).attributeGroupIds.map(
                (groupId: string, index: number) => ({
                  groupId,
                  stepOrder: index,
                })
              ),
            }
          : undefined,
      },
    });

    // 🔥 Estoque (regra do kit: estoque virtual)
    if (nextKind === ProductKind.BUNDLE) {
      // se virou kit, remove estoque físico (se existir)
      await this.prisma.stock.deleteMany({ where: { productId: id } });
    } else {
      // se não é kit, atualiza/insere estoque se vier
      if ((dto as any).stock !== undefined) {
        await this.prisma.stock.upsert({
          where: { productId: id },
          update: { quantity: parseFloat(String((dto as any).stock)) },
          create: {
            productId: id,
            quantity: parseFloat(String((dto as any).stock)),
          },
        });
      }
    }

    // 🔥 Sincronização de bundleItems (se vier no update)
    if ((dto as any).bundleItems !== undefined) {
      const items = this.parseBundleItems((dto as any).bundleItems);

      await this.prisma.productBundleItem.deleteMany({
        where: { bundleId: id },
      });

      if (items.length) {
        await this.prisma.product.update({
          where: { id },
          data: {
            bundleItems: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        });
      }
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
   FIND ALL PUBLIC (STORE)
   - suporta search
   - suporta filtro por categorySlug
   - NÃO expõe dados internos
========================= */
async findAllPublic(search?: string, categorySlug?: string) {
  return this.prisma.product.findMany({
    where: {
      active: true,

      // 🔎 BUSCA POR TEXTO
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),

      // 🏷️ FILTRO POR CATEGORIA (slug)
      ...(categorySlug
        ? {
            categories: {
              some: {
                category: {
                  slug: categorySlug,
                },
              },
            },
          }
        : {}),
    },

    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      kind: true,

      // ✅ PREÇOS VISÍVEIS NA LOJA
      priceOnline: true,
      promoPrice: true,
      priceType: true,

      image: true,

      // 🏷️ categorias (para filtros no front)
      categories: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },

      // 📦 necessário para KIT funcionar
      bundleItems: {
        select: {
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              priceOnline: true,
            },
          },
        },
      },
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
          include: { group: { include: { options: true } } },
        },
        bundleItems: { include: { product: true } },
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
    return this.prisma.product.delete({ where: { id } });
  }
}