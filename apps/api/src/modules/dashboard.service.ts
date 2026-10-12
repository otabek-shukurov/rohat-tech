import { Injectable } from '@nestjs/common';
import { DeliveryMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export type DashboardPeriod = 'week' | 'month' | 'two-months' | 'six-months' | 'year' | 'all';

type DashboardOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string | null;
  total: unknown;
  createdAt: Date;
  soldAt: Date | null;
  returnedAt: Date | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: unknown;
    total: unknown;
  }>;
  payment: { status: PaymentStatus; method: string } | null;
  soldBy: { id: string; name: string } | null;
  returnedBy: { id: string; name: string } | null;
};

type DashboardAdminOrder = Omit<DashboardOrder, 'items'> & {
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: unknown;
  }>;
};

const periodLabels: Record<DashboardPeriod, string> = {
  week: 'Haftalik',
  month: 'Oylik',
  'two-months': '2 oylik',
  'six-months': '6 oylik',
  year: 'Yillik',
  all: 'Butun davr'
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(requestedPeriod?: string) {
    const period = this.normalizePeriod(requestedPeriod);
    const now = new Date();
    const firstOrder = period === 'all'
      ? await this.prisma.order.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } })
      : null;
    const range = this.getRange(period, now, firstOrder?.createdAt ?? now);
    const queryStart = range.previousStart ?? range.start;

    const [orders, products, recentOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: queryStart ? {
          OR: [
            { createdAt: { gte: queryStart } },
            { soldAt: { gte: queryStart } },
            { returnedAt: { gte: queryStart } }
          ]
        } : undefined,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          status: true,
          deliveryMethod: true,
          deliveryAddress: true,
          total: true,
          createdAt: true,
          soldAt: true,
          returnedAt: true,
          items: {
            select: {
              id: true,
              productId: true,
              productName: true,
              quantity: true,
              unitPrice: true,
              total: true
            }
          },
          payment: { select: { status: true, method: true } },
          soldBy: { select: { id: true, name: true } },
          returnedBy: { select: { id: true, name: true } }
        }
      }),
      this.prisma.product.findMany({
        select: {
          id: true,
          name: true,
          stock: true,
          isActive: true,
          category: { select: { name: true } },
          brand: { select: { name: true } }
        },
        orderBy: { stock: 'asc' }
      }),
      this.prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          status: true,
          deliveryMethod: true,
          deliveryAddress: true,
          total: true,
          createdAt: true,
          soldAt: true,
          returnedAt: true,
          items: { select: { id: true, productName: true, quantity: true, unitPrice: true } },
          payment: { select: { status: true, method: true } },
          soldBy: { select: { id: true, name: true } },
          returnedBy: { select: { id: true, name: true } }
        }
      })
    ]);

    const current = this.calculateMetrics(orders, range.start, range.end);
    const previous = range.previousStart
      ? this.calculateMetrics(orders, range.previousStart, range.start)
      : null;
    const buckets = this.buildBuckets(period, range.start, range.end);
    const series = buckets.map((bucket) => ({
      key: bucket.start.toISOString(),
      label: bucket.label,
      revenue: 0,
      sales: 0,
      orders: 0,
      returns: 0
    }));

    for (const order of orders) {
      this.addToSeries(series, buckets, order.createdAt, 'orders', 1);
      if (order.soldAt) {
        this.addToSeries(series, buckets, order.soldAt, 'sales', 1);
        this.addToSeries(series, buckets, order.soldAt, 'revenue', Number(order.total));
      }
      if (order.returnedAt) {
        this.addToSeries(series, buckets, order.returnedAt, 'returns', 1);
        this.addToSeries(series, buckets, order.returnedAt, 'revenue', -Number(order.total));
      }
    }

    const topProducts = this.calculateTopProducts(orders, range.start, range.end);
    const activeProducts = products.filter((product) => product.isActive);

    return {
      period,
      periodLabel: periodLabels[period],
      range: { start: range.start, end: range.end },
      stats: {
        netRevenue: current.netRevenue,
        grossRevenue: current.grossRevenue,
        returnedRevenue: current.returnedRevenue,
        sales: current.sales,
        newOrders: current.orders,
        returns: current.returns,
        customers: current.customers,
        averageOrder: current.averageOrder,
        trends: previous ? {
          netRevenue: this.trend(current.netRevenue, previous.netRevenue),
          sales: this.trend(current.sales, previous.sales),
          newOrders: this.trend(current.orders, previous.orders),
          customers: this.trend(current.customers, previous.customers),
          averageOrder: this.trend(current.averageOrder, previous.averageOrder),
          returns: this.trend(current.returns, previous.returns)
        } : null
      },
      inventory: {
        products: activeProducts.length,
        totalUnits: activeProducts.reduce((sum, product) => sum + product.stock, 0),
        lowStock: activeProducts.filter((product) => product.stock <= 5).length,
        outOfStock: activeProducts.filter((product) => product.stock === 0).length,
        lowStockProducts: activeProducts.slice(0, 6)
      },
      status: {
        new: current.newState,
        sold: current.sales,
        returned: current.returns
      },
      series,
      topProducts,
      recentOrders: recentOrders.map((order) => this.toAdminOrder(order))
    };
  }

  private calculateMetrics(orders: DashboardOrder[], start: Date, end: Date) {
    const created = orders.filter((order) => this.inRange(order.createdAt, start, end));
    const sold = orders.filter((order) => order.soldAt && this.inRange(order.soldAt, start, end));
    const returned = orders.filter((order) => order.returnedAt && this.inRange(order.returnedAt, start, end));
    const grossRevenue = sold.reduce((sum, order) => sum + Number(order.total), 0);
    const returnedRevenue = returned.reduce((sum, order) => sum + Number(order.total), 0);
    return {
      grossRevenue,
      returnedRevenue,
      netRevenue: grossRevenue - returnedRevenue,
      sales: sold.length,
      orders: created.length,
      returns: returned.length,
      customers: new Set(created.map((order) => order.customerPhone)).size,
      newState: created.filter((order) => !order.soldAt && !order.returnedAt).length,
      averageOrder: sold.length ? Math.round(grossRevenue / sold.length) : 0
    };
  }

  private calculateTopProducts(orders: DashboardOrder[], start: Date, end: Date) {
    const totals = new Map<string, { productId: string; name: string; units: number; revenue: number }>();
    const apply = (order: DashboardOrder, direction: 1 | -1) => {
      for (const item of order.items) {
        const current = totals.get(item.productId) ?? {
          productId: item.productId,
          name: item.productName,
          units: 0,
          revenue: 0
        };
        current.units += item.quantity * direction;
        current.revenue += Number(item.total) * direction;
        totals.set(item.productId, current);
      }
    };
    for (const order of orders) {
      if (order.soldAt && this.inRange(order.soldAt, start, end)) apply(order, 1);
      if (order.returnedAt && this.inRange(order.returnedAt, start, end)) apply(order, -1);
    }
    return [...totals.values()]
      .filter((item) => item.units > 0 || item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }

  private toAdminOrder(order: DashboardAdminOrder) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.returnedAt ? 'RETURNED' : order.soldAt ? 'SOLD' : 'NEW',
      createdAt: order.createdAt,
      deliveryMethod: order.deliveryMethod === DeliveryMethod.PICKUP ? 'Magazindan olib ketish' : 'Yetkazib berish',
      address: order.deliveryAddress ?? 'Manzil operator bilan aniqlanadi',
      customer: { name: order.customerName, phone: order.customerPhone },
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
      soldBy: order.soldBy,
      returnedAt: order.returnedAt,
      returnedBy: order.returnedBy
    };
  }

  private buildBuckets(period: DashboardPeriod, start: Date, end: Date) {
    const buckets: Array<{ start: Date; end: Date; label: string }> = [];
    let cursor = new Date(start);
    const mode = period === 'two-months' ? 'week' : ['six-months', 'year', 'all'].includes(period) ? 'month' : 'day';
    while (cursor < end) {
      const next = new Date(cursor);
      if (mode === 'month') next.setMonth(next.getMonth() + 1, 1);
      else next.setDate(next.getDate() + (mode === 'week' ? 7 : 1));
      const bucketEnd = next < end ? next : end;
      buckets.push({
        start: new Date(cursor),
        end: new Date(bucketEnd),
        label: this.bucketLabel(cursor, mode)
      });
      cursor = next;
    }
    return buckets;
  }

  private bucketLabel(date: Date, mode: string) {
    return new Intl.DateTimeFormat('uz-UZ', mode === 'month'
      ? { month: 'short', year: '2-digit', timeZone: 'Asia/Tashkent' }
      : { day: '2-digit', month: 'short', timeZone: 'Asia/Tashkent' }).format(date);
  }

  private addToSeries(
    series: Array<{ revenue: number; sales: number; orders: number; returns: number }>,
    buckets: Array<{ start: Date; end: Date }>,
    date: Date,
    field: 'revenue' | 'sales' | 'orders' | 'returns',
    value: number
  ) {
    const index = buckets.findIndex((bucket) => this.inRange(date, bucket.start, bucket.end));
    if (index >= 0) series[index][field] += value;
  }

  private getRange(period: DashboardPeriod, now: Date, firstOrder: Date) {
    const end = new Date(now.getTime() + 1);
    let start: Date;
    if (period === 'week') start = this.daysAgo(now, 6);
    else if (period === 'month') start = this.daysAgo(now, 29);
    else if (period === 'two-months') start = this.daysAgo(now, 59);
    else if (period === 'six-months') start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    else if (period === 'year') start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    else start = new Date(firstOrder.getFullYear(), firstOrder.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const previousStart = period === 'all'
      ? null
      : new Date(start.getTime() - (end.getTime() - start.getTime()));
    return { start, end, previousStart };
  }

  private daysAgo(now: Date, days: number) {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private inRange(value: Date, start: Date, end: Date) {
    return value >= start && value < end;
  }

  private trend(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
  }

  private normalizePeriod(value?: string): DashboardPeriod {
    return value && value in periodLabels ? value as DashboardPeriod : 'week';
  }
}
