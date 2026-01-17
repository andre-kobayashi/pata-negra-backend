import { IsArray, IsOptional, IsString } from "class-validator";

export class PricingQuoteDto {
  @IsString()
  productId: string;

  // IDs dos OptionValues selecionados
  @IsArray()
  optionValueIds: string[];

  // opcional: quantidade (padrão 1)
  @IsOptional()
  quantity?: number;
}