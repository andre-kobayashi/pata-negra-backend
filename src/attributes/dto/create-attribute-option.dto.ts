import { PriceModifierType } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, IsNumber, IsUUID } from "class-validator";

export class CreateAttributeOptionDto { // Nome corrigido aqui
  @IsUUID()
  groupId: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsEnum(PriceModifierType)
  priceModifierType?: PriceModifierType;

  @IsOptional()
  @IsNumber()
  priceModifierValue?: number;

  @IsOptional()
  @IsNumber()
  weightMultiplier?: number;

  @IsOptional()
  @IsNumber()
  weightDeltaKg?: number;

  @IsOptional()
  @IsNumber()
  weightOverrideKg?: number;

  @IsOptional()
  @IsInt()
  extraPrepDays?: number;

  @IsOptional()
  @IsInt()
  sort?: number;
}