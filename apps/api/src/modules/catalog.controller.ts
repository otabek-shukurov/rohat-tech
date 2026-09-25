import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../security/current-user.decorator';
import { JwtAuthGuard } from '../security/auth.guard';

const productInclude = {
  category: true,
  brand: true,
  images: { orderBy: { position: 'asc' as const } }
};

@Controller()
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('catalog/meta')
  async meta() {
    const [categories, brands] = await Promise.all([
      this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.brand.findMany({ orderBy: { name: 'asc' } })
    ]);
    return { categories, brands };
  }

  @Get('products')
  products(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string
  ) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(brand ? { brand: { slug: brand } } : {})
    };

    return this.prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get('products/:slug')
  product(@Param('slug') slug: string) {
    return this.prisma.product.findUniqueOrThrow({
      where: { slug },
      include: productInclude
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  favorites(@CurrentUser() user: { id: string }) {
    return this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: { product: { include: productInclude } },
      orderBy: { createdAt: 'desc' }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites')
  async addFavorite(@CurrentUser() user: { id: string }, @Body() body: { productId: string }) {
    return this.prisma.favorite.upsert({
      where: { userId_productId: { userId: user.id, productId: body.productId } },
      update: {},
      create: { userId: user.id, productId: body.productId }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favorites/:productId')
  removeFavorite(@CurrentUser() user: { id: string }, @Param('productId') productId: string) {
    return this.prisma.favorite.delete({
      where: { userId_productId: { userId: user.id, productId } }
    });
  }
}
