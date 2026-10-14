import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class GuestOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('guest')
  create(@Body() body: { productId?: string; quantity?: number; fullName?: string; phone?: string }) {
    return this.orders.createGuestOrder(body);
  }

  @Post('guest/cart')
  createCartOrder(@Body() body: {
    items?: Array<{ productId?: string; quantity?: number }>;
    fullName?: string;
    phone?: string;
    deliveryMethod?: string;
    deliveryAddress?: string;
    customerNote?: string;
  }) {
    return this.orders.createGuestCartOrder(body);
  }
}
