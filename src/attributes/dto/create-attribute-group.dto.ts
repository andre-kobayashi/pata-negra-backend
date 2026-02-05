import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { AttributeInputType } from "@prisma/client";

export class CreateAttributeGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsEnum(AttributeInputType)
  inputType: AttributeInputType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsInt()
  sort?: number;
}