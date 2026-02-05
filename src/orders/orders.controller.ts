import { Controller, Post, Body, Get, Param, BadRequestException } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 🚀 Criar um novo pedido (Venda)
   * Este endpoint aciona a cotação de preços e a baixa de estoque (incluindo Kits)
   */
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    try {
      return await this.ordersService.create(dto);
    } catch (error) {
      // Repassa o erro de negócio (ex: estoque insuficiente) para o Frontend
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Opcional: Buscar detalhes de um pedido específico
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    // Aqui você implementaria um método no service para buscar o pedido
    // return this.ordersService.findOne(id);
  }
}