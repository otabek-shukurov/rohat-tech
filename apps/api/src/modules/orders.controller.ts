import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DeliveryMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../security/current-user.decorator';
import { JwtAuthGuard } from '../security/auth.guard';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService
  ) {}

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
    const [cart, customer] = await Promise.all([
      this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } }
      }),
      this.prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, phone: true }
      })
    ]);
    if (!cart?.items.length) throw new BadRequestException('Savat bo‘sh');
    if (!customer?.phone) throw new BadRequestException('Profilga telefon raqamini kiriting');
    const customerPhone = customer.phone;

    for (const item of cart.items) {
      if (!item.product.isActive || item.product.stock < item.quantity) {
        throw new BadRequestException(`${item.product.name} omborda yetarli emas`);
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);
    const deliveryFee = body.deliveryMethod === DeliveryMethod.DELIVERY ? 30000 : 0;
    const total = subtotal + deliveryFee;

    return this.prisma.$transaction(async (tx) => {
      const orderNumber = await this.orders.nextOrderNumber(tx);
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: customer.name,
          customerPhone,
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

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}
