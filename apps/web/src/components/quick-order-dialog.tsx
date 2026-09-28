'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Minus, Phone, Plus, ShoppingBag, UserRound, X } from 'lucide-react';
import { Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';

type QuickOrderDialogProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function QuickOrderDialog({ product, open, onClose }: QuickOrderDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    setQuantity(1);
    setFullName('');
    setPhone('+998 ');
    setSubmitting(false);
    setSubmitted(false);
    setOrderNumber('');
    setError('');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, open]);

  if (!mounted || !open) return null;

  const unitPrice = Number(product.discountPrice ?? product.price);
  const totalPrice = unitPrice * quantity;
  const phoneComplete = phone.replace(/\D/g, '').length === 12;
  const nameComplete = fullName.trim().split(/\s+/).filter(Boolean).length >= 2;
  const image = product.images[0]?.url ?? '/images/rohat-tech-hero.png';

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nameComplete || !phoneComplete) return;

    setSubmitting(true);
    setError('');
    const payload = {
      productId: product.id,
      productCategory: product.category.name,
      productName: product.name,
      unitPrice,
      quantity,
      totalPrice,
      fullName: fullName.trim(),
      phone
    };

    try {
      const endpoint = process.env.NEXT_PUBLIC_ORDER_ENDPOINT;
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => null) as { message?: string; orderNumber?: string } | null;
        if (!response.ok) throw new Error(result?.message ?? 'Buyurtmani yuborib bo‘lmadi');
        setOrderNumber(result?.orderNumber ?? '');
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        setOrderNumber('TEST-ORDER');
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[92svh] w-full overflow-y-auto rounded-t-lg bg-white shadow-[0_30px_90px_rgba(2,6,23,0.35)] sm:max-w-lg sm:rounded-lg" role="dialog" aria-modal="true" aria-labelledby="quick-order-title">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-700">Tez buyurtma</p>
            <h2 id="quick-order-title" className="mt-1 text-xl font-semibold text-slate-950">Buyurtma berish</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Oynani yopish" title="Yopish"><X className="h-5 w-5" /></Button>
        </div>

        {submitted ? (
          <div className="flex min-h-96 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></span>
            <h3 className="mt-5 text-xl font-semibold text-slate-950">Buyurtma qabul qilindi</h3>
            {orderNumber ? <p className="mt-2 text-sm font-semibold text-blue-700">Buyurtma raqami: {orderNumber}</p> : null}
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Operatorimiz tez orada siz bilan bog‘lanadi.</p>
            <Button type="button" className="mt-7" onClick={onClose}>Yopish</Button>
          </div>
        ) : (
          <form onSubmit={submitOrder} className="p-5 sm:p-6">
            <div className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-white">
                <Image src={image} alt={product.name} fill sizes="96px" className={cn(image.startsWith('/images/') ? 'object-cover' : 'object-contain p-2')} />
              </div>
              <div className="min-w-0 py-1">
                <p className="text-xs font-medium text-slate-500">{product.brand.name}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-950">{product.name}</h3>
                <p className="mt-2 text-base font-bold text-slate-950">{formatPrice(unitPrice)}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-y border-slate-200 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Mahsulot soni</p>
                <p className="mt-0.5 text-xs text-slate-500">Omborda {product.stock} dona</p>
              </div>
              <div className="flex items-center rounded-md border border-slate-300 bg-white p-1">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} className="grid h-9 w-9 place-items-center rounded-md text-slate-700 transition hover:bg-slate-100 disabled:opacity-35" aria-label="Soni kamaytirish"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-bold text-slate-950" aria-live="polite">{quantity}</span>
                <button type="button" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} disabled={quantity >= product.stock} className="grid h-9 w-9 place-items-center rounded-md text-slate-700 transition hover:bg-slate-100 disabled:opacity-35" aria-label="Soni oshirish"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Ism va familiya</span>
                <span className="relative block"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input autoFocus value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Ism Familiya" className="pl-10" /></span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Telefon raqam</span>
                <span className="relative block"><Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input type="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(formatUzPhone(event.target.value))} autoComplete="tel" className="pl-10" /></span>
              </label>
            </div>

            <div className="mt-6 flex items-end justify-between rounded-lg bg-blue-50 px-4 py-3.5">
              <span className="text-sm font-medium text-blue-800">Jami</span>
              <span className="text-xl font-bold text-slate-950">{formatPrice(totalPrice)}</span>
            </div>
            {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</p> : null}
            <Button type="submit" className="mt-4 w-full" disabled={!nameComplete || !phoneComplete || submitting || product.stock < 1}><ShoppingBag className="h-4 w-4" />{submitting ? 'Yuborilmoqda...' : 'Buyurtmani yuborish'}</Button>
          </form>
        )}
      </section>
    </div>,
    document.body
  );
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
