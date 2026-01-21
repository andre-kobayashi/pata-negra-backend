import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaClient, PriceModifierType, ProductKind } from "@prisma/client";
import { PricingQuoteDto } from "./dto/pricing-quote.dto";

@Injectable()
export class PricingService {
  private prisma = new PrismaClient();

  async quote(dto: PricingQuoteDto) {
    const quantity = dto.quantity ?? 1;

    // 1️⃣ Buscar produto
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        attributes: {
          include: {
            group: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!product || !product.active) {
      throw new BadRequestException("Produto não encontrado ou inativo");
    }

    let weightKg: number | null = null;
    let pricePerKg = 0;        // 👉 preço por KG (CONFIGURABLE)
    let unitPrice = 0;         // 👉 preço unitário final
    let extraPrepDays = product.basePrepDays ?? 0;

    /* =======================
       2️⃣ PREÇO BASE
    ======================= */
    switch (product.kind) {
      case ProductKind.SIMPLE:
        if (product.priceRetail == null) {
          throw new BadRequestException("Produto SIMPLE sem priceRetail");
        }
        unitPrice = product.priceRetail;
        weightKg = product.weightFixedKg ?? null;
        break;

      case ProductKind.CONFIGURABLE:
        if (product.basePricePerKg == null) {
          throw new BadRequestException(
            "Produto CONFIGURABLE sem basePricePerKg"
          );
        }
        weightKg = product.baseWeightKg ?? 1;
        pricePerKg = product.basePricePerKg;
        break;

      case ProductKind.BUNDLE:
        throw new BadRequestException("BUNDLE ainda não implementado");
    }

    const breakdown: any[] = [];

    /* =======================
       3️⃣ APLICAR ATRIBUTOS
    ======================= */
    for (const selection of dto.selections) {
      const attributeGroup = product.attributes.find(
        (ag) => ag.group.code === selection.groupCode
      );

      if (!attributeGroup) {
        throw new BadRequestException(
          `Grupo inválido: ${selection.groupCode}`
        );
      }

      const option = attributeGroup.group.options.find(
        (opt) => opt.id === selection.optionId
      );

      if (!option) {
        throw new BadRequestException(
          `Opção inválida para ${selection.groupCode}`
        );
      }

      let priceImpact = 0;
      let weightImpactKg: number | null = null;

      /* ===== 💰 PREÇO ===== */
      if (product.kind === ProductKind.CONFIGURABLE) {
        switch (option.priceModifierType) {
          case PriceModifierType.FIXED:
            priceImpact = option.priceModifierValue ?? 0;
            pricePerKg += priceImpact;
            break;

          case PriceModifierType.PER_KG:
            priceImpact = option.priceModifierValue ?? 0;
            pricePerKg += priceImpact;
            break;

          case PriceModifierType.PERCENT:
            priceImpact = Math.round(
              pricePerKg * ((option.priceModifierValue ?? 0) / 100)
            );
            pricePerKg += priceImpact;
            break;
        }
      } else {
        // SIMPLE
        switch (option.priceModifierType) {
          case PriceModifierType.FIXED:
            priceImpact = option.priceModifierValue ?? 0;
            unitPrice += priceImpact;
            break;

          case PriceModifierType.PERCENT:
            priceImpact = Math.round(
              unitPrice * ((option.priceModifierValue ?? 0) / 100)
            );
            unitPrice += priceImpact;
            break;
        }
      }

      /* ===== ⚖️ PESO ===== */
      if (option.weightMultiplier != null) {
        weightKg = option.weightMultiplier;
        weightImpactKg = weightKg;
      }

      if (option.weightDeltaKg != null) {
        weightKg = (weightKg ?? 0) + option.weightDeltaKg;
        weightImpactKg = option.weightDeltaKg;
      }

      if (option.weightOverrideKg != null) {
        weightKg = option.weightOverrideKg;
        weightImpactKg = option.weightOverrideKg;
      }

      /* ===== ⏱ PRAZO ===== */
      if (option.extraPrepDays) {
        extraPrepDays += option.extraPrepDays;
      }

      breakdown.push({
        groupCode: attributeGroup.group.code,
        groupName: attributeGroup.group.name,
        optionId: option.id,
        optionLabel: option.label,
        priceImpact,
        weightImpactKg,
        extraPrepDays: option.extraPrepDays ?? 0,
      });
    }

    /* =======================
       4️⃣ CLAMP DE PESO
    ======================= */
    if (weightKg != null) {
      if (product.minWeightKg != null) {
        weightKg = Math.max(weightKg, product.minWeightKg);
      }
      if (product.maxWeightKg != null) {
        weightKg = Math.min(weightKg, product.maxWeightKg);
      }
    }

    /* =======================
       5️⃣ PREÇO FINAL
    ======================= */
    if (product.kind === ProductKind.CONFIGURABLE) {
      if (weightKg == null) {
        throw new BadRequestException("Peso final inválido");
      }
      unitPrice = Math.round(pricePerKg * weightKg);
    }

    const total = unitPrice * quantity;

    return {
      productId: product.id,
      productName: product.name,
      kind: product.kind,

      quantity,
      unitPrice,
      total,

      weightKg: weightKg != null ? Number(weightKg.toFixed(2)) : null,
      extraPrepDays,

      breakdown,
    };
  }
}