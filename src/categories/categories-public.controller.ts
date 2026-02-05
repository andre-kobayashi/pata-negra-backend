import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from '../common/decorators/public.decorator';

@Public() // 🔓 libera tudo
@Controller('store/categories') // 🌍 ROTA PÚBLICA DA LOJA
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * 🔓 LISTA TODAS AS CATEGORIAS ATIVAS (LOJA)
   * GET /store/categories
   */
  @Get()
  async findAll() {
    return this.categoriesService.findAllPublic();
  }

  /**
   * 🔓 BUSCA CATEGORIA PELO SLUG
   * GET /store/categories/:slug
   */
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}