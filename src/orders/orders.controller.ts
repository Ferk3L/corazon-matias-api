import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /api/v1/orders
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // GET /api/v1/orders/stats
  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  // GET /api/v1/orders/client/:uid
  @Get('client/:uid')
  findByClient(@Param('uid') uid: string) {
    return this.ordersService.findByClient(uid);
  }

  // GET /api/v1/orders/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // POST /api/v1/orders
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // PATCH /api/v1/orders/:id/status
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
