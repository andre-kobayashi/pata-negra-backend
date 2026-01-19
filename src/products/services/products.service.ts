// src/products/services/products.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";

@Injectable()
export class ProductsService {
  private prisma = new PrismaClient();

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        sku: dto.sku ?? undefined,
        kind: dto.kind,

        // SIMPLE
        priceFixed: dto.priceFixed ?? null,
        weightFixedKg: dto.weightFixedKg ?? null,

        // CONFIGURABLE
        basePricePerKg: dto.basePricePerKg ?? null,
        baseWeightKg: dto.baseWeightKg ?? 1,
        basePrepDays: dto.basePrepDays ?? 0,

        active: true,

        stock:
          dto.stock !== undefined
            ? { create: { quantity: dto.stock } }
            : undefined,
      },
      include: {
        stock: true,
        attributes: {
          include: {
            group: { include: { options: true } },
          },
        },
      },
    });

    return product;
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { active: true },
      include: {
        stock: true,
        attributes: {
          include: {
            group: { include: { options: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
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

        kind: dto.kind,

        // SIMPLE
        priceFixed: dto.priceFixed,
        weightFixedKg: dto.weightFixedKg,

        // CONFIGURABLE
        basePricePerKg: dto.basePricePerKg,
        baseWeightKg: dto.baseWeightKg,
        basePrepDays: dto.basePrepDays,
      },
      include: { stock: true },
    });

    // ✅ isso precisa ficar FORA do prisma.product.update()
    if (dto.stock !== undefined) {
      await this.prisma.stock.upsert({
        where: { productId: id },
        update: { quantity: dto.stock },
        create: { productId: id, quantity: dto.stock },
      });
    }

    return product;
  }
}