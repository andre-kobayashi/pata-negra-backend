import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ProductsService } from "./services/products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("products")
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // público (ou autenticado, você decide depois)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ADMIN
  @Roles("ADMIN")
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  // ADMIN
  @Roles("ADMIN")
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }
}