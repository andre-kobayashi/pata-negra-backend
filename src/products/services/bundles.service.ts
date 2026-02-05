import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductKind, PriceType } from '@prisma/client';
import { CreateBundleDto } from '../dto/create-bundle.dto';

@Injectable()
export class BundlesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, file?: Express.Multer.File) {
    const { categoryIds, attributeGroupIds, bundleItems, stock, ...data } = dto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...data,
          image: file ? file.filename : null,
          categories: {
            create: categoryIds?.map((id: string) => ({ categoryId: id })) || [],
          },
          attributes: {
            create: attributeGroupIds?.map((id: string) => ({ groupId: id })) || [],
          },
          bundleItems: dto.kind === 'BUNDLE' && bundleItems ? {
            create: bundleItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          } : undefined,
        },
      });
      
      if (dto.kind !== 'BUNDLE') {
        await tx.stock.create({
          data: {
            productId: product.id,
            quantity: parseFloat(stock) || 0,
          },
        });
      }

      return product;
    });
  }

  // ✅ ESTOQUE DISPONÍVEL DO KIT (para Frontend)
  async getAvailableStock(bundleId: string) {
    const bundle = await this.prisma.product.findUnique({
      where: { id: bundleId },
      include: {
        bundleItems: {
          include: {
            product: {
              include: { stock: true },
            },
          },
        },
      },
    });

    if (!bundle) {
      throw new NotFoundException('Kit não encontrado');
    }

    if (bundle.kind !== ProductKind.BUNDLE) {
      return 0;
    }

    // O estoque do kit é limitado pelo item com menor disponibilidade proporcional
    const availability = bundle.bundleItems.map((item) => {
      const stockQty = item.product.stock?.quantity || 0;
      return Math.floor(stockQty / item.quantity);
    });

    return availability.length > 0 ? Math.min(...availability) : 0;
  }
}