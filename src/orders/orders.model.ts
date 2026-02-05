// src/orders/orders.module.ts
import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { PricingModule } from "../pricing/pricing.module";
// Não precisa importar o PrismaModule se ele for @Global()

@Module({
  imports: [PricingModule], 
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}