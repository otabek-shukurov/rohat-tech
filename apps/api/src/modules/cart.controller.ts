import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../security/current-user.decorator';
import { JwtAuthGuard } from '../security/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async cart(@CurrentUser() user: { id: string }) {
    const cart = await this.prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
      include: {
        items: {
          include: { product: { include: { images: true, category: true, brand: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);
    return { ...cart, subtotal };
  }

  @Post('items')
  async addItem(@CurrentUser() user: { id: string }, @Body() body: { productId: string; quantity?: number }) {
    const cart = await this.prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });
    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: body.productId } },
      update: { quantity: { increment: body.quantity ?? 1 } },
      create: { cartId: cart.id, productId: body.productId, quantity: body.quantity ?? 1 }
    });
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.prisma.cartItem.update({
      where: { id },
      data: { quantity: Math.max(1, body.quantity) }
    });
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.prisma.cartItem.delete({ where: { id } });
  }
}
