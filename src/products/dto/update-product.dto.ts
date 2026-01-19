import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ProductKind } from "@prisma/client";

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsEnum(ProductKind)
  kind?: ProductKind;

  // SIMPLE
  @IsOptional()
  @IsInt()
  priceFixed?: number;

  @IsOptional()
  @IsNumber()
  weightFixedKg?: number;

  // CONFIGURABLE
  @IsOptional()
  @IsInt()
  basePricePerKg?: number;

  @IsOptional()
  @IsNumber()
  baseWeightKg?: number;

  @IsOptional()
  @IsInt()
  basePrepDays?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}