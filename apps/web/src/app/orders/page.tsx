'use client';

import { PackageOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeading } from '@/components/page-heading';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  deliveryMethod: string;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number; total: string }>;
};

const statusLabels: Record<string, string> = {
  NEW: 'Yangi', CONFIRMED: 'Tasdiqlangan', PROCESSING: 'Tayyorlanmoqda', SHIPPED: 'Yo‘lda', DELIVERED: 'Yetkazilgan', CANCELLED: 'Bekor qilingan'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Order[]>('/orders').then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[60vh] bg-slate-50">
      <PageHeading title="Buyurtmalarim" description="Joriy buyurtmalar holati va avvalgi xaridlar tarixi." />
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-5">
        {loading ? <div className="skeleton-pulse h-44 rounded-lg border bg-white" /> : orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><h2 className="font-semibold text-slate-950">Buyurtma #{order.orderNumber}</h2><p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString('uz-UZ')}</p></div>
                  <Badge className="self-start bg-blue-50 text-blue-700">{statusLabels[order.status] ?? order.status}</Badge>
                </div>
                <div className="p-5">
                  <div className="space-y-3">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="text-slate-700">{item.productName} <span className="text-slate-400">× {item.quantity}</span></span><span className="shrink-0 font-medium text-slate-900">{formatPrice(item.total)}</span></div>)}</div>
                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm text-slate-500">{order.deliveryMethod === 'DELIVERY' ? 'Yetkazib berish' : 'Magazindan olib ketish'}</span><span className="text-lg font-bold text-slate-950">{formatPrice(order.total)}</span></div>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState icon={PackageOpen} title="Hali buyurtma yo‘q" description="Birinchi xaridingizni katalogdan boshlang. Buyurtma holatini shu yerda kuzatasiz." />}
      </div>
    </div>
  );
}
