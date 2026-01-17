import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";

@Injectable()
export class ProductsService {
  private prisma = new PrismaClient();

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        sku: dto.sku ?? undefined,

        // 🔴 OBRIGATÓRIO PELO SCHEMA
        type: dto.type,

        // ✅ Decimal corretamente
        price: new Prisma.Decimal(dto.price),

        stock: {
          create: {
            quantity: dto.stock ?? 0,
          },
        },
      },
      include: {
        stock: true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { active: true },
      include: { stock: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        sku: dto.sku,
        active: dto.active,

        // só atualiza se vier
        ...(dto.price !== undefined && {
          price: new Prisma.Decimal(dto.price),
        }),

        ...(dto.type && {
          type: dto.type,
        }),
      },
    });

    if (dto.stock !== undefined) {
      await this.prisma.stock.upsert({
        where: { productId: id },
        update: { quantity: dto.stock },
        create: {
          productId: id,
          quantity: dto.stock,
        },
      });
    }

    return product;
  }
}