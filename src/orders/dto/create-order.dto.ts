import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsArray()
  items: {
    productId: string;
    quantity: number;
    selections: {
      groupCode: string;
      optionId: string;
    }[];
  }[];
}