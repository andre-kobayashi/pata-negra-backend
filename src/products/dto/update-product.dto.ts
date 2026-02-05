import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {
  /* =========================
     STATUS
  ========================= */

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /* =========================
     ESTOQUE
  ========================= */

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}