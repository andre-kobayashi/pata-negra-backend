import { Module } from "@nestjs/common";
import { PricingController } from "./pricing.controller";
import { PricingService } from "./pricing.service";

@Module({
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService], // 🔥 IMPORTANTE (OrdersService usa PricingService)
})
export class PricingModule {}