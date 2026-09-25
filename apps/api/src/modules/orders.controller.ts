import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DeliveryMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../security/current-user.decorator';
import { JwtAuthGuard } from '../security/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get(':id')
  get(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.prisma.order.findFirstOrThrow({
      where: { id, userId: user.id },
      include: { items: true, payment: true }
    });
  }

  @Post()
  async checkout(
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      deliveryMethod: DeliveryMethod;
      deliveryAddress?: string;
      customerNote?: string;
    }
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } }
    });
    if (!cart?.items.length) throw new BadRequestException('Savat bo‘sh');

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);
    const deliveryFee = body.deliveryMethod === DeliveryMethod.DELIVERY ? 30000 : 0;
    const total = subtotal + deliveryFee;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: `RT-${Date.now()}`,
          userId: user.id,
          deliveryMethod: body.deliveryMethod,
          deliveryAddress: body.deliveryAddress,
          customerNote: body.customerNote,
          subtotal: new Prisma.Decimal(subtotal),
          deliveryFee: new Prisma.Decimal(deliveryFee),
          total: new Prisma.Decimal(total),
          items: {
            create: cart.items.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;
              return {
                productId: item.productId,
                productName: item.product.name,
                unitPrice: price,
                quantity: item.quantity,
                total: new Prisma.Decimal(Number(price) * item.quantity)
              };
            })
          },
          payment: {
            create: {
              method: 'cash',
              amount: new Prisma.Decimal(total)
            }
          }
        },
        include: { items: true, payment: true }
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  }
}
