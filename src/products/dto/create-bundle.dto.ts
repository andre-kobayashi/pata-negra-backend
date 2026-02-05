// src/products/dto/create-bundle.dto.ts
import { IsString, IsArray, IsEnum, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceType } from '@prisma/client';

class BundleItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number; // Ex: 0.500 para 500g
}

export class CreateBundleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  sku: string;

  @IsEnum(PriceType)
  priceType: PriceType;

  @IsNumber()
  @IsOptional()
  priceFixed?: number; // Usado se priceType for FIXED

  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items: BundleItemDto[];
}