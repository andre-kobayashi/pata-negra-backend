import { Body, Controller, Post } from "@nestjs/common";
import { PricingService } from "./pricing.service";
import { PricingQuoteDto } from "./dto/pricing-quote.dto";
import { Public } from "../common/decorators/public.decorator";

@Controller("pricing")
export class PricingController {
  constructor(private readonly service: PricingService) {}

  // Público (frontend da loja)
  @Public()
  @Post("quote")
  quote(@Body() dto: PricingQuoteDto) {
    return this.service.quote(dto);
  }
}