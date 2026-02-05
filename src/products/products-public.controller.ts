import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { Public } from '../common/decorators/public.decorator';

@Public() // 🔓 Libera TODAS as rotas deste controller
@Controller('store/products') // 🌍 ROTA FINAL DA LOJA
export class ProductsPublicController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 🔓 LISTAGEM PÚBLICA DA LOJA
   *
   * GET /store/products
   * GET /store/products?search=texto
   * GET /store/products?categorySlug=carnes
   * GET /store/products?search=kit&categorySlug=selecoes
   */
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categorySlug') categorySlug?: string, // ✅ AGORA PASSA TAMBÉM
  ) {
    return this.productsService.findAllPublic(search, categorySlug);
  }
}