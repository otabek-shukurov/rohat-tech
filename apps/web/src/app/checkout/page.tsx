'use client';

import Link from 'next/link';
import { CheckCircle2, MapPin, PackageCheck, Phone, Store, Truck, UserRound } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { CartItem, clearCart, getCartCount, getCartItems, getCartSubtotal } from '@/lib/cart';
import { cn, formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    setItems(getCartItems());
    setLoading(false);
  }, []);

  const subtotal = getCartSubtotal(items);
  const itemCount = getCartCount(items);
  const nameComplete = fullName.trim().split(/\s+/).filter(Boolean).length >= 2;
  const phoneComplete = phone.replace(/\D/g, '').length === 12;
  const addressComplete = method === 'PICKUP' || address.trim().length >= 5;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || !nameComplete || !phoneComplete || !addressComplete) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await api<{ orderNumber: string }>('/orders/guest/cart', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone,
          deliveryMethod: method,
          deliveryAddress: method === 'DELIVERY' ? address.trim() : undefined,
          customerNote: note.trim() || undefined,
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
        })
      });
      clearCart();
      setItems([]);
      setOrderNumber(result.orderNumber);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : '';
      setError(message === 'Failed to fetch' || submitError instanceof TypeError
        ? 'Server bilan bog‘lanib bo‘lmadi. Birozdan so‘ng qayta urinib ko‘ring.'
        : message || 'Buyurtma yaratilmadi');
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) {
    return (
      <div className="min-h-[65vh] bg-slate-50 px-4 py-16">
        <section className="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></span>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Buyurtma qabul qilindi</h1>
          <p className="mt-2 text-base font-semibold text-blue-700">Buyurtma raqami: {orderNumber}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">Buyurtma admin panelga va Telegram botga yuborildi. Operatorimiz tez orada siz bilan bog‘lanadi.</p>
          <Button asChild className="mt-7"><Link href="/catalog">Katalogga qaytish</Link></Button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-slate-50">
      <PageHeading title="Buyurtmani rasmiylashtirish" description="Bog‘lanish va qabul qilish ma’lumotlarini kiriting." />
      {loading ? <div className="mx-auto my-8 h-72 max-w-5xl skeleton-pulse rounded-lg border bg-white" /> : !items.length ? (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-5"><EmptyState icon={PackageCheck} title="Savat bo‘sh" description="Buyurtmani rasmiylashtirish uchun avval mahsulotlarni savatga qo‘shing." /></div>
      ) : (
        <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:px-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-950">Bog‘lanish ma’lumotlari</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Ism va familiya</span>
                <span className="relative block"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Ism Familiya" className="pl-10" required /></span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Telefon raqam</span>
                <span className="relative block"><Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input type="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(formatUzPhone(event.target.value))} autoComplete="tel" className="pl-10" required /></span>
              </label>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-950">Qabul qilish usuli</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MethodButton active={method === 'DELIVERY'} onClick={() => setMethod('DELIVERY')} icon={Truck} title="Yetkazib berish" text="Vobkent bo‘ylab bepul" />
                <MethodButton active={method === 'PICKUP'} onClick={() => setMethod('PICKUP')} icon={Store} title="Magazindan olish" text="Tayyor bo‘lganda olib ketish" />
              </div>
              <div className="mt-5 space-y-4">
                {method === 'DELIVERY' ? <label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin className="h-4 w-4 text-blue-600" /> Yetkazib berish manzili</span><Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Mahalla, ko‘cha, uy" required /></label> : null}
                <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Buyurtmaga izoh <span className="font-normal text-slate-400">(ixtiyoriy)</span></span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={500} placeholder="Masalan: yetkazishdan oldin qo‘ng‘iroq qiling" className="w-full resize-none rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-44">
            <h2 className="font-semibold text-slate-950">Buyurtma xulosasi</h2>
            <div className="mt-4 max-h-60 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => <div key={item.product.id} className="flex justify-between gap-3 text-sm"><span className="line-clamp-2 text-slate-600">{item.product.name} <b className="text-slate-900">× {item.quantity}</b></span><span className="shrink-0 font-semibold text-slate-900">{formatPrice(Number(item.product.discountPrice ?? item.product.price) * item.quantity)}</span></div>)}
            </div>
            <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm"><div className="flex justify-between text-slate-600"><span>Mahsulotlar ({itemCount})</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between text-slate-600"><span>Yetkazib berish</span><span className="font-semibold text-emerald-700">Bepul</span></div></div>
            <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4"><span className="font-semibold text-slate-950">Jami</span><span className="text-2xl font-bold text-slate-950">{formatPrice(subtotal)}</span></div>
            <div className="mt-5 flex items-start gap-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800"><PackageCheck className="mt-0.5 h-5 w-5 shrink-0" /><span>To‘lov mahsulotni olganingizdan keyin amalga oshiriladi.</span></div>
            {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p> : null}
            <Button type="submit" className="mt-5 w-full" disabled={submitting || !nameComplete || !phoneComplete || !addressComplete}>{submitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}</Button>
          </aside>
        </form>
      )}
    </div>
  );
}

function MethodButton({ active, onClick, icon: Icon, title, text }: { active: boolean; onClick: () => void; icon: typeof Truck; title: string; text: string }) {
  return <button type="button" onClick={onClick} className={cn('flex items-start gap-3 rounded-lg border p-4 text-left transition', active ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-400')}><span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-md', active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600')}><Icon className="h-4 w-4" /></span><span><strong className="block text-sm text-slate-950">{title}</strong><span className="mt-1 block text-xs text-slate-500">{text}</span></span></button>;
}

function formatUzPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const local = (digits.startsWith('998') ? digits.slice(3) : digits).slice(0, 9);
  const parts = ['+998'];
  if (local.length) parts.push(local.slice(0, 2));
  if (local.length > 2) parts.push(local.slice(2, 5));
  if (local.length > 5) parts.push(local.slice(5, 7));
  if (local.length > 7) parts.push(local.slice(7, 9));
  return parts.join(' ');
}
