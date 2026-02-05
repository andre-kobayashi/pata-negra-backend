import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { CreateAttributeGroupDto } from "./dto/create-attribute-group.dto";
import { CreateAttributeOptionDto } from "./dto/create-attribute-option.dto";

@Injectable()
export class AttributesService {
  private prisma = new PrismaClient();

  async findAllGroups() {
    return this.prisma.attributeGroup.findMany({
      orderBy: { sort: "asc" },
      include: { _count: { select: { options: true } } } // Útil para ver quantas opções cada etapa tem
    });
  }

  async createGroup(dto: CreateAttributeGroupDto) {
    return this.prisma.attributeGroup.create({
      data: {
        name: dto.name,
        code: slugify(dto.code ?? dto.name, {
          lower: true,
          strict: true,
        }).toUpperCase(),
        inputType: dto.inputType,
        required: dto.required ?? false,
        sort: dto.sort ?? 0,
      },
    });
  }

  async createOption(dto: CreateAttributeOptionDto) {
    return this.prisma.attributeOption.create({
      data: {
        groupId: dto.groupId,
        label: dto.label,
        sku: dto.sku,
        sort: dto.sort ?? 0,
        
        // Lógica de Preço
        priceModifierType: dto.priceModifierType ?? 'NONE',
        priceModifierValue: dto.priceModifierValue ?? 0,

        // Lógica de Peso (Essencial para carnes)
        weightMultiplier: dto.weightMultiplier ?? null,
        weightDeltaKg: dto.weightDeltaKg ?? null,
        weightOverrideKg: dto.weightOverrideKg ?? null,

        // Lógica de Prazo
        extraPrepDays: dto.extraPrepDays ?? 0,
      },
    });
  }

  async findOptionsByGroup(groupId: string) {
    return this.prisma.attributeOption.findMany({
      where: { groupId },
      orderBy: { sort: "asc" },
    });
  }
}