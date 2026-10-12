import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CurrentUser } from '../security/current-user.decorator';
import { JwtAuthGuard } from '../security/auth.guard';
import { Roles, RolesGuard } from '../security/roles.guard';
import { DashboardService } from './dashboard.service';
import { OrdersService } from './orders.service';
import { StorageService } from './storage.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly dashboardService: DashboardService,
    private readonly storageService: StorageService
  ) {}

  @Get('dashboard')
  dashboard(@Query('period') period?: string) {
    return this.dashboardService.getDashboard(period);
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
    this.validateProductBody(body, false);
    return this.prisma.product.create({
      data: this.productData(body, false),
      include: { category: true, brand: true, images: true }
    });
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: Partial<ProductBody>) {
    this.validateProductBody(body, true);
    return this.prisma.product.update({
      where: { id },
      data: this.productData(body, true),
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
    return this.ordersService.listAdminOrders();
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.ordersService.updateStatus(id, body.status);
  }

  @Post('orders/:id/mark-sold')
  markOrderSold(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: { method?: string }
  ) {
    return this.ordersService.markSold(id, user.id, body.method ?? 'cash');
  }

  @Post('uploads/product-image')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024, files: 1 }
  }))
  uploadProductImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Rasm fayli tanlanmagan');
    return this.storageService.uploadProductImage(file);
  }

  @Post('orders/:id/mark-returned')
  markOrderReturned(
    @CurrentUser() user: { id: string },
    @Param('id') id: string
  ) {
    return this.ordersService.markReturned(id, user.id);
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
    const [byStatus, sales, returns] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      this.prisma.order.aggregate({
        where: { soldAt: { not: null }, returnedAt: null },
        _count: { id: true },
        _sum: { total: true }
      }),
      this.prisma.order.aggregate({
        where: { returnedAt: { not: null } },
        _count: { id: true },
        _sum: { total: true }
      })
    ]);
    return {
      byStatus,
      sales: { count: sales._count.id, revenue: Number(sales._sum.total ?? 0) },
      returns: { count: returns._count.id, revenue: Number(returns._sum.total ?? 0) }
    };
  }

  private productData(body: Partial<ProductBody>, replaceImage: boolean): any {
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
            ...(replaceImage ? { deleteMany: {} } : {}),
            create: [{ url: body.imageUrl, alt: body.name, position: 0 }]
          }
        : undefined
    };
  }

  private validateProductBody(body: Partial<ProductBody>, partial: boolean) {
    const requiredTextFields: Array<keyof ProductBody> = ['name', 'slug', 'description', 'categoryId', 'brandId'];
    for (const field of requiredTextFields) {
      if ((!partial || body[field] !== undefined) && (typeof body[field] !== 'string' || !String(body[field]).trim())) {
        throw new BadRequestException(`${field} maydoni to‘ldirilishi kerak`);
      }
    }

    if ((!partial || body.slug !== undefined) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug ?? '')) {
      throw new BadRequestException('Slug faqat kichik lotin harflari, raqam va chiziqchadan iborat bo‘lishi kerak');
    }

    if (!partial || body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price <= 0) throw new BadRequestException('Narx 0 dan katta bo‘lishi kerak');
    }
    if (body.discountPrice !== undefined && body.discountPrice !== null) {
      const discountPrice = Number(body.discountPrice);
      if (!Number.isFinite(discountPrice) || discountPrice <= 0) throw new BadRequestException('Chegirma narxi 0 dan katta bo‘lishi kerak');
      if (body.price !== undefined && discountPrice >= Number(body.price)) throw new BadRequestException('Chegirma narxi asosiy narxdan kichik bo‘lishi kerak');
    }
    if (!partial || body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) throw new BadRequestException('Ombordagi son 0 yoki undan katta butun son bo‘lishi kerak');
    }

    if (!partial && !body.imageUrl) throw new BadRequestException('Mahsulot rasmi kiritilishi kerak');
    if (body.imageUrl) {
      let imageUrl: URL;
      try {
        imageUrl = new URL(body.imageUrl);
      } catch {
        throw new BadRequestException('Rasm URL noto‘g‘ri formatda');
      }
      if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new BadRequestException('Rasm URL HTTP yoki HTTPS bo‘lishi kerak');
    }
    if (body.specs !== undefined && (typeof body.specs !== 'object' || body.specs === null || Array.isArray(body.specs))) {
      throw new BadRequestException('Texnik xususiyatlar obyekt ko‘rinishida bo‘lishi kerak');
    }
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
