'use client';

import Link from 'next/link';
import { ArrowUpRight, Boxes, CircleDollarSign, PackageSearch, ShoppingBag, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Dashboard = {
  stats: { orders: number; products: number; customers: number; revenue: number };
  latestOrders: Array<{ id: string; orderNumber: string; status: string; total: string; user: { name: string; phone?: string } }>;
};

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api<Dashboard>('/admin/dashboard').then(setDashboard).catch(() => setDashboard(null)).finally(() => setLoading(false)); }, []);

  const stats = [
    { label: 'Buyurtmalar', value: dashboard?.stats.orders ?? 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
    { label: 'Mahsulotlar', value: dashboard?.stats.products ?? 0, icon: Boxes, color: 'bg-violet-50 text-violet-700' },
    { label: 'Mijozlar', value: dashboard?.stats.customers ?? 0, icon: Users, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Jami daromad', value: formatPrice(dashboard?.stats.revenue ?? 0), icon: CircleDollarSign, color: 'bg-amber-50 text-amber-700' }
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase text-blue-700">Umumiy ko‘rinish</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Dashboard</h1><p className="mt-1 text-sm text-slate-500">Savdo, buyurtmalar va ombor holati.</p></div>
        <Button asChild><Link href="/admin/products"><Boxes className="h-4 w-4" /> Mahsulot qo‘shish</Link></Button>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{label}</p>{loading ? <div className="skeleton-pulse mt-3 h-8 w-20 rounded bg-slate-100" /> : <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>}</div><span className={`grid h-10 w-10 place-items-center rounded-md ${color}`}><Icon className="h-5 w-5" /></span></div>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-950">So‘nggi buyurtmalar</h2><p className="mt-1 text-xs text-slate-500">Yaqinda kelib tushgan buyurtmalar</p></div><Link href="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">Barchasi <ArrowUpRight className="h-4 w-4" /></Link></div>
          {dashboard?.latestOrders.length ? (
            <div className="divide-y divide-slate-200">{dashboard.latestOrders.map((order) => <div key={order.id} className="grid items-center gap-3 px-5 py-4 text-sm sm:grid-cols-[1fr_1fr_auto_auto]"><div><p className="font-semibold text-slate-900">#{order.orderNumber}</p><p className="mt-1 text-xs text-slate-500">{order.user.phone ?? 'Telefon kiritilmagan'}</p></div><p className="text-slate-600">{order.user.name}</p><Badge>{order.status}</Badge><p className="font-semibold text-slate-950">{formatPrice(order.total)}</p></div>)}</div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center"><PackageSearch className="h-8 w-8 text-slate-300" /><h3 className="mt-3 text-sm font-semibold text-slate-900">Yangi buyurtmalar yo‘q</h3><p className="mt-1 text-xs text-slate-500">Buyurtmalar kelib tushganda shu yerda ko‘rinadi.</p></div>
          )}
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Tezkor amallar</h2>
          <div className="mt-4 space-y-2">
            {[['Mahsulotlar ombori', '/admin/products'], ['Buyurtmalarni ko‘rish', '/admin/orders'], ['Yangi aksiya yaratish', '/admin/promotions'], ['Savdo hisobotlari', '/admin/reports']].map(([label, href]) => <Link key={href} href={href} className="flex min-h-11 items-center justify-between rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><span>{label}</span><ArrowUpRight className="h-4 w-4" /></Link>)}
          </div>
        </aside>
      </div>
    </div>
  );
}
