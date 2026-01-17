import { Body, Controller, Post } from "@nestjs/common";
import { PricingService } from "./pricing.service";
import { PricingQuoteDto } from "./dto/pricing-quote.dto";
import { Public } from "../common/decorators/public.decorator";

@Controller("pricing")
export class PricingController {
  constructor(private readonly service: PricingService) {}

  // Quote precisa ser público (frontend da loja vai usar)
  @Public()
  @Post("quote")
  quote(@Body() dto: PricingQuoteDto) {
    return this.service.quote(dto);
  }
}