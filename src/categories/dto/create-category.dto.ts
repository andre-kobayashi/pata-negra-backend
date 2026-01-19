// backend/src/categories/dto/create-category.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString, IsNotEmpty } from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === "" || value === "null" ? null : value))
  parentId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;
}