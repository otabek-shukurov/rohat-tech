'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
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
  markDemoOrderSold,
  updateAdminOrderStatus
} from '@/lib/admin-demo';
import { api, isDemoMode } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type StatusFilter = 'ALL' | AdminOrderStatus;
type PaymentMethod = 'cash' | 'bank_transfer';
const editableStatuses = adminOrderStatuses.filter((item) => item.value !== 'COMPLETED');

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(isDemoMode ? demoAdminOrders : []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(!isDemoMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (isDemoMode) {
      setOrders(loadAdminOrders());
      return;
    }
    api<AdminOrder[]>('/admin/orders')
      .then((result) => active && setOrders(result))
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'Buyurtmalarni yuklab bo‘lmadi'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    setPaymentMethod(selectedOrder.paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cash');
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [selectedOrder?.id]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('uz');
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesQuery = !normalizedQuery || [order.orderNumber, order.customer.name, order.customer.phone, ...order.items.map((item) => item.productName)]
        .join(' ').toLocaleLowerCase('uz').includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const summary = [
    { label: 'Yangi', value: orders.filter((order) => order.status === 'PENDING').length, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Jarayonda', value: orders.filter((order) => ['CONFIRMED', 'PROCESSING', 'READY', 'DELIVERING'].includes(order.status)).length, icon: Truck, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Sotilgan', value: orders.filter((order) => order.paymentStatus === 'PAID').length, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Bekor qilingan', value: orders.filter((order) => order.status === 'CANCELLED').length, icon: XCircle, tone: 'bg-rose-50 text-rose-700' }
  ];

  function replaceOrder(updated: AdminOrder) {
    setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));
    setSelectedOrder(updated);
  }

  async function changeStatus(id: string, status: AdminOrderStatus) {
    setSaving(true);
    setError('');
    try {
      if (isDemoMode) {
        const nextOrders = updateAdminOrderStatus(id, status);
        setOrders(nextOrders);
        setSelectedOrder(nextOrders.find((order) => order.id === id) ?? null);
      } else {
        replaceOrder(await api<AdminOrder>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Holatni yangilab bo‘lmadi');
    } finally {
      setSaving(false);
    }
  }

  async function markSold(order: AdminOrder) {
    if (!window.confirm(`${order.orderNumber} uchun pul qabul qilinganini tasdiqlaysizmi? Ombordagi qoldiq kamayadi.`)) return;
    setSaving(true);
    setError('');
    try {
      if (isDemoMode) {
        const nextOrders = markDemoOrderSold(order.id, paymentMethod);
        setOrders(nextOrders);
        setSelectedOrder(nextOrders.find((item) => item.id === order.id) ?? null);
      } else {
        replaceOrder(await api<AdminOrder>(`/admin/orders/${order.id}/mark-sold`, { method: 'POST', body: JSON.stringify({ method: paymentMethod }) }));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sotuvni yakunlab bo‘lmadi');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-6 md:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-slate-500">Savdo nazorati</p><h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Buyurtmalar</h1><p className="mt-1 text-sm text-slate-500">Buyurtma faqat pul olingach sotuvga aylanadi.</p></div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">Tushum: {formatPrice(orders.filter((order) => order.paymentStatus === 'PAID').reduce((sum, order) => sum + order.total, 0))}</div>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map(({ label, value, icon: Icon, tone }) => <article key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${tone}`}><Icon className="h-5 w-5" /></span><div><p className="text-xl font-bold text-slate-950">{value}</p><p className="text-xs font-medium text-slate-500">{label}</p></div></article>)}
      </section>

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Raqam, mijoz yoki mahsulot..." className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"><option value="ALL">Barcha holatlar</option>{adminOrderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
        </div>
        {error ? <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</div> : null}

        {loading ? <div className="grid min-h-64 place-items-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin" /></div> : filteredOrders.length ? (
          <>
            <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[850px] text-left"><thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500"><tr><th className="px-5 py-3">Buyurtma</th><th className="px-5 py-3">Mijoz</th><th className="px-5 py-3">Mahsulot</th><th className="px-5 py-3">To‘lov</th><th className="px-5 py-3">Holat</th><th className="px-5 py-3 text-right">Jami</th><th className="w-12" /></tr></thead><tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => <tr key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer text-sm transition hover:bg-slate-50"><td className="px-5 py-4"><p className="font-bold text-slate-950">{order.orderNumber}</p><p className="mt-1 text-xs text-slate-500">{formatAdminOrderDate(order.createdAt)}</p></td><td className="px-5 py-4"><p className="font-semibold text-slate-800">{order.customer.name}</p><p className="mt-1 text-xs text-slate-500">{order.customer.phone}</p></td><td className="max-w-[250px] px-5 py-4"><p className="truncate font-medium text-slate-700">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(', ')}</p></td><td className="px-5 py-4">{order.paymentStatus === 'PAID' ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />To‘langan</span> : <span className="text-xs font-semibold text-amber-700">Kutilmoqda</span>}</td><td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td><td className="px-5 py-4 text-right font-bold text-slate-950">{formatPrice(order.total)}</td><td className="pr-4"><ChevronRight className="h-4 w-4 text-slate-400" /></td></tr>)}
            </tbody></table></div>
            <div className="divide-y divide-slate-100 md:hidden">{filteredOrders.map((order) => <button key={order.id} type="button" onClick={() => setSelectedOrder(order)} className="w-full p-4 text-left transition active:bg-slate-50"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-950">{order.orderNumber}</p><p className="mt-1 text-xs text-slate-500">{order.customer.name}</p></div><OrderStatusBadge status={order.status} /></div><p className="mt-3 truncate text-xs text-slate-600">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(', ')}</p><div className="mt-3 flex items-center justify-between"><span className={`text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>{order.paymentStatus === 'PAID' ? 'To‘langan' : 'To‘lov kutilmoqda'}</span><strong className="text-sm text-slate-950">{formatPrice(order.total)}</strong></div></button>)}</div>
          </>
        ) : <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"><span className="grid h-12 w-12 place-items-center rounded-md bg-slate-100 text-slate-400"><ShoppingBag className="h-5 w-5" /></span><h2 className="mt-4 text-sm font-bold text-slate-900">Buyurtma topilmadi</h2><p className="mt-1 text-xs text-slate-500">Qidiruv yoki filtrni o‘zgartirib ko‘ring.</p></div>}
      </section>

      {selectedOrder ? <div className="fixed inset-0 z-[90] flex justify-end"><button type="button" aria-label="Buyurtma oynasini yopish" className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" onClick={() => setSelectedOrder(null)} /><aside className="relative h-full w-full overflow-y-auto bg-white shadow-2xl sm:max-w-lg" aria-label={`${selectedOrder.orderNumber} tafsilotlari`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-lg"><div><p className="text-xs font-semibold text-slate-500">Buyurtma tafsilotlari</p><h2 className="mt-1 text-xl font-bold text-slate-950">{selectedOrder.orderNumber}</h2></div><button type="button" title="Yopish" aria-label="Yopish" onClick={() => setSelectedOrder(null)} className="grid h-10 w-10 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
        <div className="space-y-6 p-5">
          {error ? <p className="rounded-md bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">{error}</p> : null}
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-500">Buyurtma holati</span><OrderStatusBadge status={selectedOrder.status} /></div>{selectedOrder.soldAt ? <p className="mt-3 text-xs leading-5 text-slate-600">Sotuv yakunlangan. Holat va to‘lov o‘zgartirilmaydi.</p> : <select disabled={saving} value={selectedOrder.status} onChange={(event) => changeStatus(selectedOrder.id, event.target.value as AdminOrderStatus)} className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 disabled:opacity-60">{editableStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>}</section>
          <section><h3 className="text-xs font-bold uppercase text-slate-400">Mijoz</h3><div className="mt-3 space-y-3 text-sm"><p className="font-bold text-slate-950">{selectedOrder.customer.name}</p><a href={`tel:${selectedOrder.customer.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-700"><Phone className="h-4 w-4" />{selectedOrder.customer.phone}</a><p className="flex items-start gap-2 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{selectedOrder.address}</p></div></section>
          <section><h3 className="text-xs font-bold uppercase text-slate-400">Mahsulotlar</h3><div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">{selectedOrder.items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 p-4"><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{item.productName}</p><p className="mt-1 text-xs text-slate-500">{item.quantity} dona × {formatPrice(item.unitPrice)}</p></div><strong className="shrink-0 text-sm text-slate-950">{formatPrice(item.quantity * item.unitPrice)}</strong></div>)}<div className="flex items-center justify-between bg-slate-50 p-4"><span className="text-sm font-semibold text-slate-600">Jami</span><strong className="text-base text-slate-950">{formatPrice(selectedOrder.total)}</strong></div></div></section>
          {selectedOrder.paymentStatus === 'PAID' ? <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-white text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span><div><p className="text-sm font-bold text-emerald-950">To‘lov qabul qilingan</p><p className="mt-1 text-xs leading-5 text-emerald-800">{selectedOrder.paymentMethod === 'bank_transfer' ? 'Bank o‘tkazmasi' : 'Naqd pul'} · {selectedOrder.soldAt ? formatAdminOrderDate(selectedOrder.soldAt) : ''}</p>{selectedOrder.soldBy ? <p className="text-xs text-emerald-800">Mas’ul: {selectedOrder.soldBy.name}</p> : null}</div></div></section> : selectedOrder.status !== 'CANCELLED' ? <section className="rounded-lg border-2 border-blue-200 bg-blue-50/60 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-white text-blue-700"><Banknote className="h-5 w-5" /></span><div><h3 className="text-sm font-bold text-slate-950">Sotuvni yakunlash</h3><p className="mt-0.5 text-xs text-slate-600">Faqat pul olingandan keyin tasdiqlang.</p></div></div><label className="mt-4 block"><span className="mb-2 block text-xs font-bold text-slate-700">To‘lov turi</span><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500"><option value="cash">Naqd pul</option><option value="bank_transfer">Bank o‘tkazmasi</option></select></label><Button type="button" onClick={() => markSold(selectedOrder)} disabled={saving} className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}{saving ? 'Saqlanmoqda...' : 'Pul olindi, sotildi'}</Button></section> : null}
          <section className="rounded-lg border border-slate-200 p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-md bg-blue-50 text-blue-700"><PackageCheck className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-slate-900">{selectedOrder.deliveryMethod}</p><p className="mt-0.5 text-xs text-slate-500">{formatAdminOrderDate(selectedOrder.createdAt)}</p></div></div></section>
        </div>
      </aside></div> : null}
    </div>
  );
}
