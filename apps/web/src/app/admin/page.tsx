'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Clock3,
  PackagePlus,
  ShoppingBag,
  TrendingUp,
  Users
} from 'lucide-react';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { Button } from '@/components/ui/button';
import {
  type AdminOrder,
  demoAdminOrders,
  formatAdminOrderDate,
  getAdminMetrics,
  loadAdminOrders,
  lowStockProducts,
  weeklySales
} from '@/lib/admin-demo';
import { formatPrice } from '@/lib/utils';

export default function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(demoAdminOrders);

  useEffect(() => {
    const refresh = () => setOrders(loadAdminOrders());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('rohat:admin-orders', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('rohat:admin-orders', refresh);
    };
  }, []);

  const metrics = useMemo(() => getAdminMetrics(orders), [orders]);
  const maxSale = Math.max(...weeklySales.map((item) => item.value));
  const stats = [
    {
      label: 'Jami savdo',
      value: formatPrice(metrics.revenue),
      note: 'Haftalik tushum',
      icon: CircleDollarSign,
      iconClass: 'bg-emerald-50 text-emerald-700',
      trend: '+12.4%'
    },
    {
      label: 'Buyurtmalar',
      value: metrics.orders,
      note: `${metrics.activeOrders} tasi jarayonda`,
      icon: ShoppingBag,
      iconClass: 'bg-blue-50 text-blue-700',
      trend: '+8.2%'
    },
    {
      label: 'Mahsulotlar',
      value: metrics.products,
      note: `${lowStockProducts.length} ta kam qolgan`,
      icon: Boxes,
      iconClass: 'bg-violet-50 text-violet-700',
      trend: '+4 yangi'
    },
    {
      label: 'Mijozlar',
      value: metrics.customers,
      note: 'Noyob telefon raqamlari',
      icon: Users,
      iconClass: 'bg-amber-50 text-amber-700',
      trend: '+5.6%'
    }
  ];

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-6 md:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">2-oktabr, 2026</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Xayrli kun, Administrator</h1>
          <p className="mt-1 text-sm text-slate-500">Magazinning bugungi holati va tezkor ko‘rsatkichlari.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/products">
            <PackagePlus className="h-4 w-4" />
            Mahsulot qo‘shish
          </Link>
        </Button>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Asosiy ko‘rsatkichlar">
        {stats.map(({ label, value, note, icon: Icon, iconClass, trend }) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 whitespace-nowrap text-xl font-bold text-slate-950 md:text-2xl xl:text-xl 2xl:text-2xl">{value}</p>
              </div>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${iconClass}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="truncate text-xs text-slate-500">{note}</span>
              <span className="shrink-0 text-xs font-bold text-emerald-600">{trend}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Haftalik savdo dinamikasi</h2>
              <p className="mt-1 text-xs text-slate-500">So‘nggi 7 kunlik tushum</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              {formatPrice(92400000)}
            </div>
          </div>
          <div className="px-4 pb-5 pt-6 sm:px-6">
            <div className="grid h-64 grid-cols-7 items-end gap-2 border-b border-slate-200 sm:gap-4">
              {weeklySales.map((item) => (
                <div key={item.label} className="flex h-full min-w-0 flex-col justify-end gap-2">
                  <div className="group relative flex flex-1 items-end justify-center">
                    <span className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                      {formatCompactPrice(item.value)}
                    </span>
                    <div
                      className="w-full max-w-12 rounded-t bg-blue-500 transition-[height,background-color] duration-500 hover:bg-blue-600"
                      style={{ height: `${Math.max(16, Math.round((item.value / maxSale) * 100))}%` }}
                      aria-label={`${item.label}: ${formatPrice(item.value)}`}
                    />
                  </div>
                  <span className="text-center text-xs font-medium text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Ombor nazorati</h2>
              <p className="mt-1 text-xs text-slate-500">Kam qolgan mahsulotlar</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">{product.brand.name.slice(0, 2).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{product.category.name}</p>
                </div>
                <span className="shrink-0 rounded bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{product.stock} dona</span>
              </div>
            ))}
          </div>
          <Link href="/admin/products" className="flex min-h-11 items-center justify-center gap-2 border-t border-slate-200 text-xs font-bold text-blue-700 transition hover:bg-blue-50">
            Omborni boshqarish <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-950">So‘nggi buyurtmalar</h2>
            <p className="mt-1 text-xs text-slate-500">Bugun kelib tushgan va jarayondagi buyurtmalar</p>
          </div>
          <Link href="/admin/orders" className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900">
            Barchasi <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Buyurtma</th>
                <th className="px-5 py-3">Mijoz</th>
                <th className="px-5 py-3">Vaqt</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="text-sm transition hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-bold text-slate-950">{order.orderNumber}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{order.customer.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{order.customer.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{formatAdminOrderDate(order.createdAt)}</td>
                  <td className="px-5 py-3.5"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-950">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 md:hidden">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.customer.name}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-500"><Clock3 className="h-3.5 w-3.5" />{formatAdminOrderDate(order.createdAt)}</span>
                <strong className="text-slate-950">{formatPrice(order.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatCompactPrice(value: number) {
  return `${(value / 1000000).toFixed(1)} mln`;
}
