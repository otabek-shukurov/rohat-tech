import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../security/auth.guard';
import { Roles, RolesGuard } from '../security/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  async dashboard() {
    const [orders, products, customers, revenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true }
      })
    ]);
    const latestOrders = await this.prisma.order.findMany({
      take: 6,
      include: { user: { select: { name: true, phone: true } }, items: true },
      orderBy: { createdAt: 'desc' }
    });
    return {
      stats: {
        orders,
        products,
        customers,
        revenue: Number(revenue._sum.total ?? 0)
      },
      latestOrders
    };
  }

  @Get('products')
  products() {
    return this.prisma.product.findMany({
      include: { category: true, brand: true, images: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('products')
  createProduct(@Body() body: ProductBody) {
    return this.prisma.product.create({
      data: this.productData(body),
      include: { category: true, brand: true, images: true }
    });
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: Partial<ProductBody>) {
    return this.prisma.product.update({
      where: { id },
      data: this.productData(body),
      include: { category: true, brand: true, images: true }
    });
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  @Get('categories')
  categories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('categories')
  createCategory(@Body() body: { name: string; slug: string; description?: string }) {
    return this.prisma.category.create({ data: body });
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: { name?: string; slug?: string; description?: string }) {
    return this.prisma.category.update({ where: { id }, data: body });
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  @Get('brands')
  brands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('brands')
  createBrand(@Body() body: { name: string; slug: string }) {
    return this.prisma.brand.create({ data: body });
  }

  @Patch('brands/:id')
  updateBrand(@Param('id') id: string, @Body() body: { name?: string; slug?: string }) {
    return this.prisma.brand.update({ where: { id }, data: body });
  }

  @Delete('brands/:id')
  deleteBrand(@Param('id') id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }

  @Get('orders')
  orders() {
    return this.prisma.order.findMany({
      include: { user: { select: { name: true, phone: true, email: true } }, items: true, payment: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.prisma.order.update({ where: { id }, data: { status: body.status } });
  }

  @Get('customers')
  customers() {
    return this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get('promotions')
  promotions() {
    return this.prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('promotions')
  createPromotion(@Body() body: PromotionBody) {
    return this.prisma.promotion.create({
      data: {
        ...body,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt)
      }
    });
  }

  @Patch('promotions/:id')
  updatePromotion(@Param('id') id: string, @Body() body: Partial<PromotionBody>) {
    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...body,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt ? new Date(body.endsAt) : undefined
      }
    });
  }

  @Get('reports')
  async reports() {
    const byStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { total: true }
    });
    return { byStatus };
  }

  private productData(body: Partial<ProductBody>): any {
    return {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price === undefined ? undefined : new Prisma.Decimal(body.price),
      discountPrice:
        body.discountPrice === undefined || body.discountPrice === null
          ? body.discountPrice
          : new Prisma.Decimal(body.discountPrice),
      stock: body.stock,
      specs: body.specs,
      categoryId: body.categoryId,
      brandId: body.brandId,
      images: body.imageUrl
        ? {
            deleteMany: {},
            create: [{ url: body.imageUrl, alt: body.name, position: 0 }]
          }
        : undefined
    };
  }
}

type ProductBody = {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  specs?: Prisma.InputJsonValue;
  categoryId: string;
  brandId: string;
  imageUrl?: string;
};

type PromotionBody = {
  title: string;
  code?: string;
  description?: string;
  discountPct: number;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
};
