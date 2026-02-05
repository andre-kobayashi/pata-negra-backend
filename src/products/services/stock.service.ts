import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductKind } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula quanto temos disponível para venda.
   * Se for Kit, calcula o "gargalo" baseado nos itens filhos.
   */
  async getAvailableQuantity(productId: string): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        stock: true,
        bundleItems: {
          include: {
            product: { include: { stock: true } }
          }
        }
      }
    });

    if (!product) throw new NotFoundException('Produto não encontrado');

    // Se for Produto Simples ou Configurável, retorna o estoque direto
    if (product.kind !== ProductKind.BUNDLE) {
      return product.stock?.quantity || 0;
    }

    // Se for KIT (BUNDLE), o estoque é o menor resultado de: EstoqueTotal / QtdNoKit
    if (product.bundleItems.length === 0) return 0;

    const possibilities = product.bundleItems.map(item => {
      const childStock = item.product.stock?.quantity || 0;
      if (childStock <= 0) return 0;
      return Math.floor(childStock / item.quantity);
    });

    return Math.min(...possibilities);
  }

  /**
   * Realiza a baixa de estoque após uma venda
   */
  async decreaseStock(productId: string, quantitySold: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { bundleItems: true }
    });

    if (!product) return;

    if (product.kind === ProductKind.BUNDLE) {
      // Baixa o estoque de cada componente do kit
      for (const item of product.bundleItems) {
        const totalToDecrease = item.quantity * quantitySold;
        await this.prisma.stock.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: totalToDecrease } }
        });
      }
    } else {
      // Baixa estoque normal
      await this.prisma.stock.update({
        where: { productId },
        data: { quantity: { decrement: quantitySold } }
      });
    }
  }
}