import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { StockController } from "./stock.controller"; // Importe o novo controlador
import { ProductsService } from "./services/products.service";
import { BundlesService } from "./services/bundles.service"; // Importe o novo serviço
import { PrismaService } from "../prisma/prisma.service";  // Importe o serviço do Prisma
import { StockService } from "./services/stock.service"; // Importe o novo serviço de Estoque
import { ProductsPublicController } from "./products-public.controller";

@Module({
  controllers: [
    ProductsController, 
    StockController, 
    ProductsPublicController // 👈 DEVE ESTAR AQUI (array de controllers)
  ], 
  providers: [
    ProductsService, 
    BundlesService, 
    PrismaService,
    StockService,
    // REMOVA o ProductsPublicController daqui de baixo!
  ],
})
export class ProductsModule {}