import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaClient, PriceModifierType, ProductType } from "@prisma/client";
import { PricingQuoteDto } from "./dto/pricing-quote.dto";

const prisma = new PrismaClient();

type BreakdownLine = {
  label: string;
  priceImpact: number;
  weightImpactKg?: number | null;
};

@Injectable()
export class PricingService {
  async quote(dto: PricingQuoteDto) {
    const quantity = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;

    const product = await prisma.product.findUnique({
      where: { id: dto.productId },
      select: {
        id: true,
        name: true,
        type: true,
        basePrice: true,
        pricePerKg: true,
        defaultWeightKg: true,
        minWeightKg: true,
        maxWeightKg: true,
        active: true,
      },
    });

    if (!product || !product.active) throw new NotFoundException("Produto não encontrado");

    // carrega option values selecionados + seus groups (pra validação)
    const optionValues = await prisma.optionValue.findMany({
      where: { id: { in: dto.optionValueIds } },
      include: {
        optionGroup: {
          select: { id: true, productId: true, title: true },
        },
      },
    });

    // validação: todos os optionValues pertencem ao produto
    for (const ov of optionValues) {
      if (ov.optionGroup.productId !== product.id) {
        throw new BadRequestException("Opção inválida para este produto");
      }
    }

    // ====== PESO FINAL ======
    let weightKg: number | null = null;

    if (product.type === ProductType.WEIGHT_BASED) {
      const base = product.defaultWeightKg ?? 0;

      const override = optionValues.find(v => v.weightOverrideKg !== null && v.weightOverrideKg !== undefined);
      const deltaSum = optionValues.reduce((acc, v) => acc + (v.weightDeltaKg ?? 0), 0);

      weightKg = (override?.weightOverrideKg ?? base) + deltaSum;

      // clamps
      if (product.minWeightKg !== null && product.minWeightKg !== undefined) {
        weightKg = Math.max(weightKg, product.minWeightKg);
      }
      if (product.maxWeightKg !== null && product.maxWeightKg !== undefined) {
        weightKg = Math.min(weightKg, product.maxWeightKg);
      }
    }

    // ====== PREÇO BASE ======
    let basePrice = 0;

    if (product.type === ProductType.FIXED) {
      if (product.basePrice == null) throw new BadRequestException("Produto FIXED sem basePrice");
      basePrice = product.basePrice;
    } else {
      if (product.pricePerKg == null) throw new BadRequestException("Produto WEIGHT_BASED sem pricePerKg");
      if (weightKg == null) throw new BadRequestException("Peso não calculado");
      basePrice = Math.round(weightKg * product.pricePerKg);
    }

    // ====== MODIFICADORES ======
    const breakdown: BreakdownLine[] = [];
    breakdown.push({
      label:
        product.type === ProductType.FIXED
          ? "Preço base"
          : `Preço base (${weightKg?.toFixed(2)}kg × ¥${product.pricePerKg}/kg)`,
      priceImpact: basePrice,
      weightImpactKg: product.type === ProductType.WEIGHT_BASED ? weightKg : null,
    });

    let extraFixed = 0;
    let extraPerKg = 0;
    let percentSum = 0;

    for (const ov of optionValues) {
      const t = ov.priceModifierType as PriceModifierType;

      if (t === PriceModifierType.FIXED) extraFixed += ov.priceModifierValue ?? 0;
      if (t === PriceModifierType.PER_KG) extraPerKg += ov.priceModifierValue ?? 0;
      if (t === PriceModifierType.PERCENT) percentSum += ov.priceModifierValue ?? 0;

      breakdown.push({
        label: `${ov.optionGroup.title}: ${ov.label}`,
        priceImpact: 0,
        weightImpactKg: (ov.weightDeltaKg ?? ov.weightOverrideKg) ?? null,
      });
    }

    let total = basePrice;

    if (extraFixed !== 0) {
      total += extraFixed;
      breakdown.push({ label: "Extras fixos", priceImpact: extraFixed });
    }

    if (extraPerKg !== 0) {
      if (product.type !== ProductType.WEIGHT_BASED || weightKg == null) {
        throw new BadRequestException("Modificador PER_KG só é válido em produto por peso");
      }
      const v = Math.round(weightKg * extraPerKg);
      total += v;
      breakdown.push({ label: `Extras por kg (${weightKg.toFixed(2)}kg × ¥${extraPerKg}/kg)`, priceImpact: v });
    }

    if (percentSum !== 0) {
      const v = Math.round(total * (percentSum / 100));
      total += v;
      breakdown.push({ label: `Percentual (+${percentSum}%)`, priceImpact: v });
    }

    const totalWithQty = total * quantity;

 // ====== YIELD RULES (ex: alcatra/picanha) ======
// pega o último yieldRules válido entre as opções selecionadas
const yieldRules = optionValues
  .map(v => v.yieldRules)
  .find(r => r && typeof r === "object") as Record<string, number> | undefined;

let yields: Record<string, number> | null = null;

if (yieldRules && product.type === ProductType.WEIGHT_BASED && weightKg != null) {
  const parts: Record<string, number> = {};

  for (const key of Object.keys(yieldRules)) {
    const ratio = Number(yieldRules[key]);
    if (!Number.isFinite(ratio) || ratio <= 0) continue;

    parts[key] = Number((weightKg * ratio).toFixed(2));
  }

  yields = parts;
}

    return {
      product: {
        id: product.id,
        name: product.name,
        type: product.type,
      },
      quantity,
      weightKg: product.type === ProductType.WEIGHT_BASED ? Number(weightKg?.toFixed(2)) : null,
      basePrice,
      total,
      totalWithQty,
      yields,
      breakdown,
    };
  }
}