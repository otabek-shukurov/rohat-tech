'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
  XCircle
} from 'lucide-react';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { Button } from '@/components/ui/button';
import {
  type AdminOrder,
  type AdminOrderStatus,
  adminOrderStatuses,
  demoAdminOrders,
  formatAdminOrderDate,
  loadAdminOrders,
  updateAdminOrderStatus
} from '@/lib/admin-demo';
import { cn, formatPrice } from '@/lib/utils';

type StatusFilter = 'ALL' | AdminOrderStatus;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(demoAdminOrders);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  useEffect(() => setOrders(loadAdminOrders()), []);

  useEffect(() => {
    if (!selectedOrder) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedOrder]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('uz');
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesQuery = !normalizedQuery || [order.orderNumber, order.customer.name, order.customer.phone, ...order.items.map((item) => item.productName)]
        .join(' ')
        .toLocaleLowerCase('uz')
        .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const summary = [
    { label: 'Yangi', value: orders.filter((order) => order.status === 'PENDING').length, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Jarayonda', value: orders.filter((order) => ['CONFIRMED', 'PROCESSING', 'READY', 'DELIVERING'].includes(order.status)).length, icon: Truck, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Yakunlangan', value: orders.filter((order) => order.status === 'COMPLETED').length, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Bekor qilingan', value: orders.filter((order) => order.status === 'CANCELLED').length, icon: XCircle, tone: 'bg-rose-50 text-rose-700' }
  ];

  function changeStatus(id: string, status: AdminOrderStatus) {
    const nextOrders = updateAdminOrderStatus(id, status);
    setOrders(nextOrders);
    setSelectedOrder((current) => current?.id === id ? { ...current, status } : current);
  }

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-6 md:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">Buyurtmalar</h1>
          <p className="mt-1 text-sm text-slate-500">Buyurtmalarni qabul qiling, kuzating va statusini boshqaring.</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOrders(loadAdminOrders())}>
          <RefreshCw className="h-4 w-4" />
          Yangilash
        </Button>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Buyurtmalar holati">
        {summary.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-md', tone)}><Icon className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-950">{value}</p>
              <p className="truncate text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-200 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Raqam, mijoz yoki mahsulot bo‘yicha qidiring"
                className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <p className="text-xs font-medium text-slate-500">{filteredOrders.length} ta buyurtma topildi</p>
          </div>

          <div className="mt-4 flex gap-1 overflow-x-auto pb-1" aria-label="Status bo‘yicha filter">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={cn('min-h-9 shrink-0 rounded-md px-3 text-xs font-semibold transition', statusFilter === 'ALL' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
            >
              Barchasi
            </button>
            {adminOrderStatuses.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => setStatusFilter(status.value)}
                className={cn('min-h-9 shrink-0 rounded-md px-3 text-xs font-semibold transition', statusFilter === status.value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Buyurtma</th>
                    <th className="px-5 py-3">Mijoz</th>
                    <th className="px-5 py-3">Mahsulot</th>
                    <th className="px-5 py-3">Summa</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="text-sm transition hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatAdminOrderDate(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{order.customer.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{order.customer.phone}</p>
                      </td>
                      <td className="max-w-[260px] px-5 py-4">
                        <p className="truncate font-medium text-slate-700">{order.items[0].productName}</p>
                        {order.items.length > 1 ? <p className="mt-1 text-xs font-semibold text-blue-700">+{order.items.length - 1} ta mahsulot</p> : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-950">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={(event) => changeStatus(order.id, event.target.value as AdminOrderStatus)}
                          aria-label={`${order.orderNumber} statusi`}
                          className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          {adminOrderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          title="Buyurtmani ko‘rish"
                          aria-label={`${order.orderNumber} buyurtmasini ko‘rish`}
                          onClick={() => setSelectedOrder(order)}
                          className="inline-grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredOrders.map((order) => (
                <button key={order.id} type="button" onClick={() => setSelectedOrder(order)} className="block w-full px-4 py-4 text-left transition hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatAdminOrderDate(order.createdAt)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{order.customer.name}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{order.items[0].productName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <strong className="text-sm text-slate-950">{formatPrice(order.total)}</strong>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-slate-100 text-slate-400"><ShoppingBag className="h-5 w-5" /></span>
            <h2 className="mt-4 text-sm font-bold text-slate-900">Buyurtma topilmadi</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Qidiruv matni yoki status filtrini o‘zgartirib ko‘ring.</p>
          </div>
        )}
      </section>

      {selectedOrder ? (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <button type="button" aria-label="Buyurtma oynasini yopish" className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" onClick={() => setSelectedOrder(null)} />
          <aside className="relative h-full w-full overflow-y-auto bg-white shadow-2xl sm:max-w-lg" aria-label={`${selectedOrder.orderNumber} tafsilotlari`}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-lg">
              <div>
                <p className="text-xs font-semibold text-slate-500">Buyurtma tafsilotlari</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">{selectedOrder.orderNumber}</h2>
              </div>
              <button type="button" title="Yopish" aria-label="Yopish" onClick={() => setSelectedOrder(null)} className="grid h-10 w-10 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500">Joriy holat</span>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <select
                  value={selectedOrder.status}
                  onChange={(event) => changeStatus(selectedOrder.id, event.target.value as AdminOrderStatus)}
                  className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {adminOrderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
              </div>

              <section>
                <h3 className="text-xs font-bold uppercase text-slate-400">Mijoz</h3>
                <div className="mt-3 space-y-3 text-sm">
                  <p className="font-bold text-slate-950">{selectedOrder.customer.name}</p>
                  <a href={`tel:${selectedOrder.customer.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-700"><Phone className="h-4 w-4" />{selectedOrder.customer.phone}</a>
                  <p className="flex items-start gap-2 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{selectedOrder.address}</p>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase text-slate-400">Mahsulotlar</h3>
                <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{item.productName}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.quantity} dona × {formatPrice(item.unitPrice)}</p>
                      </div>
                      <strong className="shrink-0 text-sm text-slate-950">{formatPrice(item.quantity * item.unitPrice)}</strong>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 bg-slate-50 p-4">
                    <span className="text-sm font-semibold text-slate-600">Jami</span>
                    <strong className="text-base text-slate-950">{formatPrice(selectedOrder.total)}</strong>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-blue-50 text-blue-700"><PackageCheck className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedOrder.deliveryMethod}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatAdminOrderDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
