import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  DeliveryMethod,
  OrderStatus,
  PaymentStatus,
  Prisma
} from '@prisma/client';
import { PrismaService } from '../prisma.service';

const orderInclude = {
  items: true,
  payment: true,
  user: { select: { name: true, phone: true, email: true } },
  soldBy: { select: { id: true, name: true } }
} satisfies Prisma.OrderInclude;

type OrderWithDetails = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createGuestOrder(input: {
    productId?: string;
    quantity?: number;
    fullName?: string;
    phone?: string;
  }) {
    const customerName = input.fullName?.trim().replace(/\s+/g, ' ') ?? '';
    const customerPhone = this.normalizePhone(input.phone ?? '');
    const quantity = Number(input.quantity);

    if (customerName.split(' ').filter(Boolean).length < 2) {
      throw new BadRequestException('Ism va familiyani to‘liq kiriting');
    }
    if (!customerPhone) throw new BadRequestException('Telefon raqamini to‘liq kiriting');
    if (!input.productId) throw new BadRequestException('Mahsulot tanlanmagan');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new BadRequestException('Mahsulot soni noto‘g‘ri');
    }

    const product = await this.prisma.product.findFirst({
      where: { id: input.productId, isActive: true },
      include: { category: true }
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    if (product.stock < quantity) {
      throw new ConflictException(`Omborda faqat ${product.stock} dona mavjud`);
    }

    const unitPrice = product.discountPrice ?? product.price;
    const total = unitPrice.mul(quantity);
    const order = await this.prisma.$transaction(async (tx) => {
      const orderNumber = await this.nextOrderNumber(tx);
      return tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          status: OrderStatus.PENDING,
          deliveryMethod: DeliveryMethod.DELIVERY,
          customerNote: 'Yetkazib berish tafsilotlarini operator aniqlaydi',
          subtotal: total,
          total,
          items: {
            create: [{
              productId: product.id,
              productName: product.name,
              unitPrice,
              quantity,
              total
            }]
          },
          payment: {
            create: {
              method: 'cash',
              status: PaymentStatus.PENDING,
              amount: total
            }
          }
        },
        include: orderInclude
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    await this.notifyTelegram(order, product.category.name).catch((error) => {
      console.error('Telegram notification failed:', error);
    });

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      message: 'Buyurtma qabul qilindi'
    };
  }

  async listAdminOrders() {
    const orders = await this.prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' }
    });
    return orders.map((order) => this.toAdminOrder(order));
  }

  async updateStatus(id: string, status: OrderStatus) {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException('Buyurtma holati noto‘g‘ri');
    }
    if (status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Sotuvni yakunlash uchun “Sotildi” amalidan foydalaning');
    }

    const current = await this.prisma.order.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Buyurtma topilmadi');
    if (current.soldAt) throw new ConflictException('Sotilgan buyurtma holatini o‘zgartirib bo‘lmaydi');

    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: orderInclude
    });
    return this.toAdminOrder(order);
  }

  async markSold(id: string, adminId: string, method: string) {
    if (!['cash', 'bank_transfer'].includes(method)) {
      throw new BadRequestException('To‘lov turi naqd yoki bank o‘tkazmasi bo‘lishi kerak');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id },
        include: { items: true, payment: true }
      });
      if (!current) throw new NotFoundException('Buyurtma topilmadi');
      if (current.soldAt) {
        return tx.order.findUniqueOrThrow({ where: { id }, include: orderInclude });
      }
      if (current.status === OrderStatus.CANCELLED) {
        throw new ConflictException('Bekor qilingan buyurtmani sotilgan deb belgilab bo‘lmaydi');
      }

      for (const item of current.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } }
        });
        if (updated.count !== 1) {
          throw new ConflictException(`${item.productName} omborda yetarli emas`);
        }
      }

      const paidAt = new Date();
      await tx.payment.upsert({
        where: { orderId: id },
        create: {
          orderId: id,
          method,
          status: PaymentStatus.PAID,
          amount: current.total,
          paidAt
        },
        update: { method, status: PaymentStatus.PAID, amount: current.total, paidAt }
      });

      return tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.COMPLETED,
          soldAt: paidAt,
          soldById: adminId
        },
        include: orderInclude
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return this.toAdminOrder(order);
  }

  async nextOrderNumber(tx: Prisma.TransactionClient) {
    const counter = await tx.counter.upsert({
      where: { key: 'orders' },
      create: { key: 'orders', value: 1 },
      update: { value: { increment: 1 } }
    });
    return `RT-${String(counter.value).padStart(6, '0')}`;
  }

  toAdminOrder(order: OrderWithDetails) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      deliveryMethod: order.deliveryMethod === DeliveryMethod.PICKUP
        ? 'Magazindan olib ketish'
        : 'Yetkazib berish',
      address: order.deliveryAddress ?? 'Manzil operator bilan aniqlanadi',
      customer: {
        name: order.customerName || order.user?.name || 'Noma’lum mijoz',
        phone: order.customerPhone || order.user?.phone || ''
      },
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice)
      })),
      total: Number(order.total),
      paymentStatus: order.payment?.status ?? PaymentStatus.PENDING,
      paymentMethod: order.payment?.method ?? null,
      soldAt: order.soldAt,
      soldBy: order.soldBy
    };
  }

  private normalizePhone(value: string) {
    const digits = value.replace(/\D/g, '');
    const normalized = digits.startsWith('998') ? digits : `998${digits}`;
    if (!/^998\d{9}$/.test(normalized)) return null;
    return `+998 ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8, 10)} ${normalized.slice(10, 12)}`;
  }

  private async notifyTelegram(order: OrderWithDetails, category: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const item = order.items[0];
    const createdAt = new Intl.DateTimeFormat('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(order.createdAt);
    const text = [
      '<b>Yangi buyurtma</b>',
      '',
      `<b>Buyurtma:</b> ${this.escapeHtml(order.orderNumber)}`,
      `<b>Ism-familiya:</b> ${this.escapeHtml(order.customerName)}`,
      `<b>Telefon:</b> ${this.escapeHtml(order.customerPhone)}`,
      `<b>Mahsulot turi:</b> ${this.escapeHtml(category)}`,
      `<b>Mahsulot:</b> ${this.escapeHtml(item.productName)}`,
      `<b>Soni:</b> ${item.quantity} dona`,
      `<b>Jami:</b> ${Number(order.total).toLocaleString('uz-UZ')} so‘m`,
      `<b>Vaqti:</b> ${this.escapeHtml(createdAt)}`,
      '',
      'Holat: to‘lov kutilmoqda'
    ].join('\n');

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    if (!response.ok) throw new Error(`Telegram API ${response.status}`);
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] ?? character);
  }
}
