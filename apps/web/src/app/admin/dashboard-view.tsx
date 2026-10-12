'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  PackagePlus,
  ReceiptText,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Users
} from 'lucide-react';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { Button } from '@/components/ui/button';
import { type AdminOrder, demoAdminOrders } from '@/lib/admin-demo';
import { api, isDemoMode } from '@/lib/api';
import { demoProducts } from '@/lib/demo-catalog';
import { cn, formatPrice } from '@/lib/utils';

type Period = 'week' | 'month' | 'two-months' | 'six-months' | 'year' | 'all';
type TrendSet = {
  netRevenue: number;
  sales: number;
  newOrders: number;
  customers: number;
  averageOrder: number;
  returns: number;
};
type DashboardData = {
  period: Period;
  periodLabel: string;
  range: { start: string; end: string };
  stats: {
    netRevenue: number;
    grossRevenue: number;
    returnedRevenue: number;
    sales: number;
    newOrders: number;
    returns: number;
    customers: number;
    averageOrder: number;
    trends: TrendSet | null;
  };
  inventory: {
    products: number;
    totalUnits: number;
    lowStock: number;
    outOfStock: number;
    lowStockProducts: Array<{ id: string; name: string; stock: number; category: { name: string }; brand: { name: string } }>;
  };
  status: { new: number; sold: number; returned: number };
  series: Array<{ key: string; label: string; revenue: number; sales: number; orders: number; returns: number }>;
  topProducts: Array<{ productId: string; name: string; units: number; revenue: number }>;
  recentOrders: AdminOrder[];
};

const periods: Array<{ value: Period; label: string }> = [
  { value: 'week', label: 'Haftalik' },
  { value: 'month', label: 'Oylik' },
  { value: 'two-months', label: '2 oylik' },
  { value: 'six-months', label: '6 oylik' },
  { value: 'year', label: 'Yillik' },
  { value: 'all', label: 'Butun davr' }
];

export default function DashboardView() {
  const [period, setPeriod] = useState<Period>('month');
  const [reloadKey, setReloadKey] = useState(0);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayLabel, setTodayLabel] = useState('');

  useEffect(() => {
    setTodayLabel(formatUzbekDate(new Date()));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const request = isDemoMode
      ? Promise.resolve(createDemoDashboard(period))
      : api<DashboardData>(`/admin/dashboard?period=${period}`);
    request
      .then((result) => active && setDashboard(result))
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'Statistikani yuklab bo‘lmadi'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [period, reloadKey]);

  const rangeLabel = useMemo(() => {
    if (!dashboard) return '';
    return `${formatUzbekShortDate(new Date(dashboard.range.start))} — ${formatUzbekShortDate(new Date(dashboard.range.end))}`;
  }, [dashboard]);

  const stats = dashboard ? [
    { label: 'Sof tushum', value: formatPrice(dashboard.stats.netRevenue), note: `Brutto ${formatCompactPrice(dashboard.stats.grossRevenue)}`, trend: dashboard.stats.trends?.netRevenue, icon: CircleDollarSign, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Sotilgan', value: dashboard.stats.sales, note: 'Pul olingan buyurtmalar', trend: dashboard.stats.trends?.sales, icon: ReceiptText, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Yangi buyurtma', value: dashboard.stats.newOrders, note: `${dashboard.status.new} tasi hali yangi`, trend: dashboard.stats.trends?.newOrders, icon: ShoppingBag, tone: 'bg-cyan-50 text-cyan-700' },
    { label: 'Mijozlar', value: dashboard.stats.customers, note: 'Noyob telefon raqamlari', trend: dashboard.stats.trends?.customers, icon: Users, tone: 'bg-violet-50 text-violet-700' },
    { label: 'O‘rtacha chek', value: formatPrice(dashboard.stats.averageOrder), note: 'Har bir sotuvga', trend: dashboard.stats.trends?.averageOrder, icon: TrendingUp, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Qaytarilgan', value: dashboard.stats.returns, note: formatPrice(dashboard.stats.returnedRevenue), trend: dashboard.stats.trends?.returns, reverseTrend: true, icon: RotateCcw, tone: 'bg-rose-50 text-rose-700' }
  ] : [];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="min-h-5 text-sm font-medium text-slate-500">{todayLabel}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Savdo boshqaruv markazi</h1>
          <p className="mt-1 text-sm text-slate-500">Tushum, tovar holati va ombor ko‘rsatkichlari bir joyda.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="scrollbar-hidden flex max-w-full overflow-x-auto rounded-md border border-slate-200 bg-white p-1" role="tablist" aria-label="Statistika davri">
            {periods.map((item) => (
              <button key={item.value} type="button" role="tab" aria-selected={period === item.value} onClick={() => setPeriod(item.value)} className={cn('min-h-9 shrink-0 rounded px-3 text-xs font-bold transition', period === item.value ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')}>{item.label}</button>
            ))}
          </div>
          <Button asChild><Link href="/admin/products"><PackagePlus className="h-4 w-4" />Mahsulot qo‘shish</Link></Button>
        </div>
      </div>

      {error ? <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button type="button" onClick={() => setReloadKey((key) => key + 1)} className="font-bold">Qayta urinish</button></div> : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Asosiy ko‘rsatkichlar">
        {loading && !dashboard ? Array.from({ length: 6 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-lg bg-slate-200" />) : stats.map((stat) => (
          <article key={stat.label} className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold text-slate-500">{stat.label}</p><p className="mt-2 truncate text-xl font-bold text-slate-950">{stat.value}</p></div><span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-md', stat.tone)}><stat.icon className="h-[18px] w-[18px]" /></span></div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3"><span className="truncate text-[11px] text-slate-500">{stat.note}</span><TrendBadge value={stat.trend} reverse={stat.reverseTrend} /></div>
          </article>
        ))}
      </section>

      {dashboard ? (
        <>
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.65fr)]">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <SectionHeader title="Sof tushum dinamikasi" description={`${dashboard.periodLabel} natija · ${rangeLabel}`} value={formatPrice(dashboard.stats.netRevenue)} />
              <RevenueChart series={dashboard.series} />
            </section>
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-sm font-bold text-slate-950">Tovar holati</h2><p className="mt-1 text-xs text-slate-500">Tanlangan davrdagi harakatlar</p></div>
              <StatusBreakdown status={dashboard.status} />
              <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200"><InventoryMetric label="Ombordagi dona" value={dashboard.inventory.totalUnits} /><InventoryMetric label="Mahsulot turi" value={dashboard.inventory.products} /><InventoryMetric label="Kam qolgan" value={dashboard.inventory.lowStock} warning /><InventoryMetric label="Tugagan" value={dashboard.inventory.outOfStock} danger /></div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-sm font-bold text-slate-950">Buyurtma faolligi</h2><p className="mt-1 text-xs text-slate-500">Yangi, sotilgan va qaytarilgan tovarlar soni</p></div><ActivityChart series={dashboard.series} /></section>
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-950">Eng ko‘p sotilganlar</h2><p className="mt-1 text-xs text-slate-500">Sof sotuv bo‘yicha</p></div><Boxes className="h-5 w-5 text-blue-600" /></div><TopProducts products={dashboard.topProducts} /></section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]"><RecentOrders orders={dashboard.recentOrders} /><LowStock products={dashboard.inventory.lowStockProducts} /></div>
        </>
      ) : null}
    </div>
  );
}

function TrendBadge({ value, reverse = false }: { value?: number; reverse?: boolean }) {
  if (value === undefined) return <span className="text-[11px] font-semibold text-slate-400">Taqqoslash yo‘q</span>;
  const positive = value >= 0;
  const good = reverse ? !positive : positive;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return <span className={cn('inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold', good ? 'text-emerald-600' : 'text-rose-600')}><Icon className="h-3.5 w-3.5" />{Math.abs(value).toFixed(1)}%</span>;
}

function SectionHeader({ title, description, value }: { title: string; description: string; value: string }) {
  return <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-bold text-slate-950">{title}</h2><p className="mt-1 text-xs text-slate-500">{description}</p></div><div className="flex items-center gap-2 text-sm font-bold text-slate-950"><TrendingUp className="h-4 w-4 text-emerald-600" />{value}</div></div>;
}

function RevenueChart({ series }: { series: DashboardData['series'] }) {
  const width = 900;
  const height = 280;
  const padding = { top: 24, right: 24, bottom: 42, left: 76 };
  const values = series.map((item) => item.revenue);
  const max = Math.max(1, ...values, 0);
  const min = Math.min(0, ...values);
  const range = max - min || 1;
  const x = (index: number) => padding.left + (index / Math.max(1, series.length - 1)) * (width - padding.left - padding.right);
  const y = (value: number) => padding.top + ((max - value) / range) * (height - padding.top - padding.bottom);
  const line = series.map((item, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(item.revenue)}`).join(' ');
  const baseline = y(0);
  const area = series.length ? `${line} L ${x(series.length - 1)} ${baseline} L ${x(0)} ${baseline} Z` : '';
  const labelStep = Math.max(1, Math.ceil(series.length / 7));
  return <div className="overflow-x-auto px-3 pb-4 pt-5 sm:px-5"><svg viewBox={`0 0 ${width} ${height}`} className="h-[280px] min-w-[760px] w-full" role="img" aria-label="Sof tushum chizig‘i">{Array.from({ length: 5 }, (_, index) => { const value = min + ((max - min) * index) / 4; const lineY = y(value); return <g key={index}><line x1={padding.left} y1={lineY} x2={width - padding.right} y2={lineY} stroke="#e2e8f0" strokeDasharray="4 6" /><text x={padding.left - 12} y={lineY + 4} textAnchor="end" fill="#64748b" fontSize="11">{formatCompactPrice(value)}</text></g>; })}{area ? <path d={area} fill="#dbeafe" opacity="0.75" /> : null}<line x1={padding.left} y1={baseline} x2={width - padding.right} y2={baseline} stroke="#94a3b8" />{line ? <path d={line} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}{series.map((item, index) => <g key={item.key}><circle cx={x(index)} cy={y(item.revenue)} r={series.length <= 14 ? 4 : 2.5} fill="#fff" stroke="#2563eb" strokeWidth="2"><title>{item.label}: {formatPrice(item.revenue)}</title></circle>{(index % labelStep === 0 || index === series.length - 1) ? <text x={x(index)} y={height - 14} textAnchor="middle" fill="#64748b" fontSize="11">{item.label}</text> : null}</g>)}</svg></div>;
}

function ActivityChart({ series }: { series: DashboardData['series'] }) {
  const max = Math.max(1, ...series.flatMap((item) => [item.orders, item.sales, item.returns]));
  const labelStep = Math.max(1, Math.ceil(series.length / 8));
  return <div className="px-4 pb-5 pt-6"><div className="mb-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-600"><Legend color="bg-blue-500" label="Yangi" /><Legend color="bg-emerald-500" label="Sotildi" /><Legend color="bg-rose-500" label="Qaytarildi" /></div><div className="flex h-56 min-w-0 items-end gap-1 border-b border-slate-200">{series.map((item, index) => <div key={item.key} className="flex h-full min-w-0 flex-1 flex-col justify-end"><div className="flex flex-1 items-end justify-center gap-px"><ChartBar value={item.orders} max={max} tone="bg-blue-500" title={`${item.label}: ${item.orders} yangi`} /><ChartBar value={item.sales} max={max} tone="bg-emerald-500" title={`${item.label}: ${item.sales} sotildi`} /><ChartBar value={item.returns} max={max} tone="bg-rose-500" title={`${item.label}: ${item.returns} qaytarildi`} /></div><span className="mt-2 h-5 truncate text-center text-[10px] font-medium text-slate-500">{index % labelStep === 0 || index === series.length - 1 ? item.label : ''}</span></div>)}</div></div>;
}

function ChartBar({ value, max, tone, title }: { value: number; max: number; tone: string; title: string }) {
  return <span title={title} className={cn('w-full max-w-3 rounded-t transition-[height] duration-500', tone)} style={{ height: value ? `${Math.max(5, (value / max) * 100)}%` : '2px', opacity: value ? 1 : 0.2 }} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className={cn('h-2.5 w-2.5 rounded-sm', color)} />{label}</span>;
}

function StatusBreakdown({ status }: { status: DashboardData['status'] }) {
  const total = Math.max(1, status.new + status.sold + status.returned);
  const items = [{ label: 'Yangi', value: status.new, tone: 'bg-blue-500', text: 'text-blue-700' }, { label: 'Sotildi', value: status.sold, tone: 'bg-emerald-500', text: 'text-emerald-700' }, { label: 'Qaytarildi', value: status.returned, tone: 'bg-rose-500', text: 'text-rose-700' }];
  return <div className="space-y-5 p-5">{items.map((item) => <div key={item.label}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-600">{item.label}</span><span className={cn('font-bold', item.text)}>{item.value} · {Math.round((item.value / total) * 100)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={cn('h-full rounded-full transition-[width] duration-500', item.tone)} style={{ width: `${(item.value / total) * 100}%` }} /></div></div>)}</div>;
}

function InventoryMetric({ label, value, warning, danger }: { label: string; value: number; warning?: boolean; danger?: boolean }) {
  return <div className="bg-white p-4"><p className="text-[11px] font-semibold text-slate-500">{label}</p><p className={cn('mt-1 text-xl font-bold', danger ? 'text-rose-700' : warning ? 'text-amber-700' : 'text-slate-950')}>{value}</p></div>;
}

function TopProducts({ products }: { products: DashboardData['topProducts'] }) {
  if (!products.length) return <EmptyCompact icon={ReceiptText} text="Bu davrda sotuv yo‘q" />;
  const max = Math.max(...products.map((product) => product.revenue), 1);
  return <div className="divide-y divide-slate-100">{products.map((product, index) => <div key={product.productId} className="px-5 py-3.5"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{product.name}</p><p className="mt-0.5 text-xs text-slate-500">{product.units} dona</p></div><strong className="shrink-0 text-xs text-slate-950">{formatCompactPrice(product.revenue)}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(product.revenue / max) * 100}%` }} /></div></div></div></div>)}</div>;
}

function RecentOrders({ orders }: { orders: AdminOrder[] }) {
  return <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-950">So‘nggi buyurtmalar</h2><p className="mt-1 text-xs text-slate-500">Eng yangi tovar harakatlari</p></div><Link href="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-blue-700">Barchasi <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500"><tr><th className="px-5 py-3">Buyurtma</th><th className="px-5 py-3">Mijoz</th><th className="px-5 py-3">Vaqt</th><th className="px-5 py-3">Tovar holati</th><th className="px-5 py-3 text-right">Summa</th></tr></thead><tbody className="divide-y divide-slate-100">{orders.map((order) => <tr key={order.id} className="text-sm hover:bg-slate-50"><td className="px-5 py-3.5 font-bold text-slate-950">{order.orderNumber}</td><td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{order.customer.name}</p><p className="mt-0.5 text-xs text-slate-500">{order.customer.phone}</p></td><td className="px-5 py-3.5 text-xs text-slate-500">{formatShortDate(order.createdAt)}</td><td className="px-5 py-3.5"><OrderStatusBadge status={order.status} /></td><td className="px-5 py-3.5 text-right font-bold text-slate-950">{formatPrice(order.total)}</td></tr>)}</tbody></table></div></section>;
}

function LowStock({ products }: { products: DashboardData['inventory']['lowStockProducts'] }) {
  return <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-950">Ombor nazorati</h2><p className="mt-1 text-xs text-slate-500">Qoldig‘i eng kam mahsulotlar</p></div><Boxes className="h-5 w-5 text-amber-500" /></div>{products.length ? <div className="divide-y divide-slate-100">{products.map((product) => <div key={product.id} className="flex items-center gap-3 px-5 py-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">{product.brand.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{product.name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{product.category.name}</p></div><span className={cn('rounded px-2 py-1 text-xs font-bold', product.stock === 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700')}>{product.stock} dona</span></div>)}</div> : <EmptyCompact icon={Boxes} text="Ombor ma’lumoti yo‘q" />}<Link href="/admin/products" className="flex min-h-11 items-center justify-center gap-2 border-t border-slate-200 text-xs font-bold text-blue-700 hover:bg-blue-50">Omborni boshqarish <ArrowRight className="h-3.5 w-3.5" /></Link></section>;
}

function EmptyCompact({ icon: Icon, text }: { icon: typeof Boxes; text: string }) {
  return <div className="flex min-h-44 flex-col items-center justify-center px-5 text-center"><Icon className="h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">{text}</p></div>;
}

function createDemoDashboard(period: Period): DashboardData {
  const base = [2, 4, 3, 6, 5, 8, 7, 6, 9, 7, 10, 8];
  const count = period === 'week' ? 7 : period === 'month' ? 10 : period === 'two-months' ? 9 : period === 'six-months' ? 6 : 12;
  const series = base.slice(0, count).map((value, index) => ({ key: String(index), label: `${index + 1}`, revenue: value * 1250000, sales: value, orders: value + 2, returns: index % 5 === 0 ? 1 : 0 }));
  const revenue = series.reduce((sum, item) => sum + item.revenue, 0);
  return { period, periodLabel: periods.find((item) => item.value === period)?.label ?? '', range: { start: new Date(Date.now() - 30 * 86400000).toISOString(), end: new Date().toISOString() }, stats: { netRevenue: revenue, grossRevenue: revenue + 1490000, returnedRevenue: 1490000, sales: series.reduce((sum, item) => sum + item.sales, 0), newOrders: series.reduce((sum, item) => sum + item.orders, 0), returns: series.reduce((sum, item) => sum + item.returns, 0), customers: 24, averageOrder: 4850000, trends: { netRevenue: 12.4, sales: 8.2, newOrders: 6.1, customers: 5.6, averageOrder: 3.8, returns: -2.5 } }, inventory: { products: demoProducts.length, totalUnits: demoProducts.reduce((sum, product) => sum + product.stock, 0), lowStock: demoProducts.filter((product) => product.stock <= 5).length, outOfStock: demoProducts.filter((product) => product.stock === 0).length, lowStockProducts: demoProducts.slice(0, 6).map((product) => ({ id: product.id, name: product.name, stock: product.stock, category: { name: product.category.name }, brand: { name: product.brand.name } })) }, status: { new: 5, sold: 18, returned: 2 }, series, topProducts: demoProducts.slice(0, 6).map((product, index) => ({ productId: product.id, name: product.name, units: 8 - index, revenue: Number(product.discountPrice ?? product.price) * (8 - index) })), recentOrders: demoAdminOrders };
}

function formatCompactPrice(value: number) {
  const absolute = Math.abs(value);
  const prefix = value < 0 ? '−' : '';
  if (absolute >= 1_000_000_000) return `${prefix}${(absolute / 1_000_000_000).toFixed(1)} mlrd`;
  if (absolute >= 1_000_000) return `${prefix}${(absolute / 1_000_000).toFixed(1)} mln`;
  if (absolute >= 1_000) return `${prefix}${Math.round(absolute / 1_000)} ming`;
  return `${prefix}${Math.round(absolute)}`;
}

function formatShortDate(value: string) {
  const date = toTashkentDate(new Date(value));
  return `${padNumber(date.getUTCDate())}-${shortMonths[date.getUTCMonth()]}, ${padNumber(date.getUTCHours())}:${padNumber(date.getUTCMinutes())}`;
}

function formatUzbekDate(value: Date) {
  const date = toTashkentDate(value);
  return `${date.getUTCDate()}-${longMonths[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

function formatUzbekShortDate(value: Date) {
  const date = toTashkentDate(value);
  return `${padNumber(date.getUTCDate())}-${shortMonths[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

const longMonths = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const shortMonths = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];

function toTashkentDate(value: Date) {
  return new Date(value.getTime() + 5 * 60 * 60 * 1000);
}

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}
