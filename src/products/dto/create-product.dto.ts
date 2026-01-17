import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ProductType } from "@prisma/client";

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  // 🔴 OBRIGATÓRIO PELO PRISMA
  @IsEnum(ProductType)
  type: ProductType;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}