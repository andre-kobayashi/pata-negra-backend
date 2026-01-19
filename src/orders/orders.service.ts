import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PricingService } from "../pricing/pricing.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  private prisma = new PrismaClient();

  constructor(private readonly pricing: PricingService) {}

  async create(dto: CreateOrderDto) {
    let orderTotal = 0;

    const order = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        status: "PENDING",
        total: 0,
      },
    });

    for (const item of dto.items) {
      // 1️⃣ Gera quote definitivo
      const quote = await this.pricing.quote({
        productId: item.productId,
        quantity: item.quantity,
        selections: item.selections,
      });

      orderTotal += quote.total;

      // 2️⃣ Cria OrderItem (snapshot)
      const orderItem = await this.prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: quote.quantity,

          productName: quote.productName,
          productSku: null,

          basePricePerKg: quote.kind === "CONFIGURABLE" ? quote.unitPrice : null,
          baseWeightKg: quote.weightKg,

          finalWeightKg: quote.weightKg,
          unitPrice: quote.unitPrice,
          total: quote.total,

          extraPrepDays: quote.extraPrepDays,
        },
      });

      // 3️⃣ Salva seleções (snapshot)
      for (const sel of quote.breakdown) {
        await this.prisma.orderItemSelection.create({
          data: {
            orderItemId: orderItem.id,

            groupCode: sel.groupCode,
            groupName: sel.groupName,
            optionId: sel.optionId,
            optionLabel: sel.optionLabel,

            priceImpact: sel.priceImpact,
            weightImpactKg: sel.weightImpactKg,
            extraPrepDays: sel.extraPrepDays,
          },
        });
      }
    }

    // 4️⃣ Atualiza total do pedido
    await this.prisma.order.update({
      where: { id: order.id },
      data: { total: orderTotal },
    });

    return {
      orderId: order.id,
      total: orderTotal,
      status: "PENDING",
    };
  }
}