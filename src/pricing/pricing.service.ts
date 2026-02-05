import { Injectable, BadRequestException } from "@nestjs/common";
import { PriceModifierType, ProductKind, PriceType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PricingQuoteDto } from "./dto/pricing-quote.dto";

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async quote(dto: PricingQuoteDto) {
    const quantity = dto.quantity ?? 1;

    // 1️⃣ Buscar produto + kits + atributos
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        bundleItems: {
          include: { product: true },
        },
        attributes: {
          include: {
            group: { include: { options: true } },
          },
        },
      },
    });

    if (!product || !product.active) {
      throw new BadRequestException("Produto não encontrado ou inativo");
    }

    let weightKg: number | null = null;
    let pricePerKg = 0;
    let unitPrice = 0;
    let extraPrepDays = product.basePrepDays ?? 0;

    /* =======================
       2️⃣ PREÇO BASE
    ======================= */
    switch (product.kind) {
      case ProductKind.SIMPLE:
        unitPrice = product.priceOnline ?? product.priceRetail ?? 0;
        weightKg = product.weightFixedKg ?? null;
        break;

      case ProductKind.CONFIGURABLE:
        weightKg = product.baseWeightKg ?? 1;
        pricePerKg = product.basePricePerKg ?? 0;
        break;

      case ProductKind.BUNDLE:
        if (product.priceType === PriceType.FIXED) {
          unitPrice = product.priceFixed ?? 0;
        } else {
          unitPrice = product.bundleItems.reduce((acc, item) => {
            const itemPrice =
              item.product.priceOnline ??
              item.product.priceRetail ??
              0;
            return acc + itemPrice * item.quantity;
          }, 0);
        }

        weightKg = product.bundleItems.reduce((acc, item) => {
          const itemWeight =
            item.product.weightFixedKg ??
            item.product.baseWeightKg ??
            0;
          return acc + itemWeight * item.quantity;
        }, 0);
        break;
    }

    /* =======================
       3️⃣ PROMOÇÃO / CAMPANHA
    ======================= */
    const isPromotion = await this.isPromoActive(product.id, product);

    if (isPromotion) {
      if (product.promoPrice) {
        unitPrice = product.promoPrice;
      }
    }

    const breakdown: any[] = [];

    /* =======================
       4️⃣ ATRIBUTOS
    ======================= */
    for (const selection of dto.selections || []) {
      const attributeGroup = product.attributes.find(
        (ag) => ag.group.code === selection.groupCode
      );
      if (!attributeGroup) continue;

      const option = attributeGroup.group.options.find(
        (opt) => opt.id === selection.optionId
      );
      if (!option) continue;

      let priceImpact = 0;

      if (product.kind === ProductKind.CONFIGURABLE) {
        priceImpact = option.priceModifierValue ?? 0;
        pricePerKg += priceImpact;
      } else if (product.kind === ProductKind.SIMPLE) {
        priceImpact = option.priceModifierValue ?? 0;
        unitPrice += priceImpact;
      }

      breakdown.push({
        groupCode: attributeGroup.group.code,
        optionLabel: option.label,
        priceImpact,
      });
    }

    /* =======================
       5️⃣ PREÇO FINAL
    ======================= */
    if (product.kind === ProductKind.CONFIGURABLE) {
      unitPrice = Math.round(pricePerKg * (weightKg ?? 1));
    }

    return {
      productId: product.id,
      productName: product.name,
      kind: product.kind,
      quantity,
      unitPrice: Math.round(unitPrice),
      total: Math.round(unitPrice * quantity),
      weightKg: weightKg ? Number(weightKg.toFixed(3)) : null,
      extraPrepDays,
      breakdown,
      isPromotion,
    };
  }

  /* =======================
     🔥 PROMOÇÃO INTELIGENTE
  ======================= */
  private async isPromoActive(
    productId: string,
    productData: any
  ): Promise<boolean> {
    if (!productData.promoPrice) return false;

    const now = new Date();
    const today = now.getDay();

    const activeCampaign = await this.prisma.campaign.findFirst({
      where: {
        active: true,
        products: {
          some: { id: productId },
        },
        OR: [
          {
            type: "WEEKLY",
            dayOfWeek: today,
          },
          {
            type: "DATE_RANGE",
            startDate: { lte: now },
            endDate: { gte: now },
          },
        ],
      },
    });

    return !!activeCampaign;
  }
}