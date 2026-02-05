import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, IsArray } from "class-validator";
import { ProductKind, StorageType } from "@prisma/client";
import { Transform, Type } from "class-transformer"; // 👈 Importante

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsEnum(ProductKind)
  kind: ProductKind;

  @IsOptional()
  @IsEnum(StorageType)
  storageType?: StorageType;

  // 🔥 Conversão Automática de String para Number
  @IsOptional()
  @IsNumber()
  @Type(() => Number) 
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  promoPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceOnline?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceRetail?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  basePricePerKg?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  baseWeightKg?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  basePrepDays?: number;

  // 🔥 Conversão de String JSON para Array Real
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  attributeGroupIds?: string[];

  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
}