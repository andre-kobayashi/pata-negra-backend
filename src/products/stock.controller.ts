import { Controller, Get, Param } from '@nestjs/common';
import { StockService } from './services/stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get(':productId/available')
  async getAvailable(@Param('productId') productId: string) {
    const quantity = await this.stockService.getAvailableQuantity(productId);
    return {
      productId,
      availableQuantity: quantity
    };
  }
}