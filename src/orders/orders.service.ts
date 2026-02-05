import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { ProductKind } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service"; // 👈 Use o Service global
import { PricingService } from "../pricing/pricing.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  // 👈 Removido o "new PrismaClient()" e adicionado no constructor
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService
  ) {}

  async create(dto: CreateOrderDto) {
    // 🔥 Tudo dentro de uma transação: ou grava tudo ou nada.
    return this.prisma.$transaction(async (tx) => {
      let orderTotal = 0;

      // 1. Cria o cabeçalho do pedido
      const order = await tx.order.create({
        data: {
          userId: dto.userId,
          status: "PENDING",
          total: 0,
        },
      });

      for (const item of dto.items) {
        // 2. Busca o produto para validar o tipo (Simples ou Kit)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { bundleItems: true, stock: true },
        });

        if (!product) throw new NotFoundException(`Produto ${item.productId} não encontrado`);

        // 3. Obter cotação definitiva de preço
        const quote = await this.pricing.quote({
          productId: item.productId,
          quantity: item.quantity,
          selections: item.selections,
        });

        orderTotal += quote.total;

        // 4. BAIXA DE ESTOQUE (Lógica integrada para Kits)
        if (product.kind === ProductKind.BUNDLE) {
          // Se for Kit, percorre os itens filhos
          for (const bundleItem of product.bundleItems) {
            const quantityToSubtract = bundleItem.quantity * item.quantity;
            
            // Verifica se tem estoque antes de baixar (Opcional, mas seguro para açougue)
            await tx.stock.update({
              where: { productId: bundleItem.productId },
              data: {
                quantity: { decrement: quantityToSubtract },
              },
            });
          }
        } else {
          // Produto simples ou configurável
          await tx.stock.update({
            where: { productId: item.productId },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }

        // 5. Cria o registro do Item no Pedido (Snapshot)
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            productName: quote.productName,
            productSku: product.sku,
            basePricePerKg: product.kind === "CONFIGURABLE" ? quote.unitPrice : null,
            baseWeightKg: quote.weightKg,
            finalWeightKg: quote.weightKg,
            unitPrice: quote.unitPrice,
            total: quote.total,
            extraPrepDays: quote.extraPrepDays,
          },
        });

        // 6. Grava as seleções (se houver - atributos do açougue)
        if (quote.breakdown && quote.breakdown.length > 0) {
          await tx.orderItemSelection.createMany({
            data: quote.breakdown.map((sel) => ({
              orderItemId: orderItem.id,
              groupCode: sel.groupCode,
              groupName: sel.groupName,
              optionId: sel.optionId,
              optionLabel: sel.optionLabel,
              priceImpact: sel.priceImpact,
              weightImpactKg: sel.weightImpactKg,
              extraPrepDays: sel.extraPrepDays,
            })),
          });
        }
      }

      // 7. Atualiza o total final do pedido
      return await tx.order.update({
        where: { id: order.id },
        data: { total: orderTotal },
        include: { items: true }
      });
    });
  }
}