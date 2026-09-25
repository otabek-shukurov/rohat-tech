'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { Product, api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Cart = { id: string; subtotal: number; items: Array<{ id: string; quantity: number; product: Product }> };

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const load = () => api<Cart>('/cart').then(setCart).catch(() => setCart(null)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  async function update(id: string, quantity: number) {
    if (quantity < 1) return;
    await api(`/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) });
    load();
  }

  async function remove(id: string) {
    await api(`/cart/items/${id}`, { method: 'DELETE' });
    load();
  }

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="min-h-[60vh] bg-slate-50">
      <PageHeading title="Savat" description={itemCount ? `${itemCount} ta mahsulot xaridga tayyor.` : 'Tanlangan mahsulotlaringiz shu yerda jamlanadi.'} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-5">
        {loading ? <div className="skeleton-pulse h-64 rounded-lg border bg-white" /> : !cart?.items.length ? (
          <EmptyState icon={ShoppingCart} title="Savatingiz bo‘sh" description="Katalogdan kerakli texnikani tanlang va savatga qo‘shing." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-3">
              {cart.items.map((item) => {
                const image = item.product.images[0]?.url ?? '/images/rohat-tech-hero.png';
                return (
                  <article key={item.id} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[128px_minmax(0,1fr)_auto] sm:items-center">
                    <Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden rounded-md bg-slate-50"><Image src={image} alt={item.product.name} fill sizes="128px" className="object-contain p-3" /></Link>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500">{item.product.brand.name}</p>
                      <Link href={`/products/${item.product.slug}`} className="mt-1 line-clamp-2 font-semibold text-slate-950 transition hover:text-blue-700">{item.product.name}</Link>
                      <p className="mt-3 text-lg font-bold text-slate-950">{formatPrice(item.product.discountPrice ?? item.product.price)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <button type="button" onClick={() => remove(item.id)} className="grid h-9 w-9 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label="Mahsulotni o‘chirish" title="O‘chirish"><Trash2 className="h-4 w-4" /></button>
                      <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white">
                        <button type="button" onClick={() => update(item.id, item.quantity - 1)} className="grid h-full w-9 place-items-center text-slate-600 hover:bg-slate-50" aria-label="Kamaytirish"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                        <button type="button" onClick={() => update(item.id, item.quantity + 1)} className="grid h-full w-9 place-items-center text-slate-600 hover:bg-slate-50" aria-label="Ko‘paytirish"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-44">
              <h2 className="text-lg font-semibold text-slate-950">Buyurtma xulosasi</h2>
              <div className="mt-5 space-y-3 text-sm"><div className="flex justify-between text-slate-600"><span>Mahsulotlar ({itemCount})</span><span>{formatPrice(cart.subtotal)}</span></div><div className="flex justify-between text-slate-600"><span>Yetkazib berish</span><span>Checkout’da</span></div></div>
              <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-5"><span className="font-semibold text-slate-950">Jami</span><span className="text-2xl font-bold text-slate-950">{formatPrice(cart.subtotal)}</span></div>
              <Button asChild className="mt-5 w-full"><Link href="/checkout">Buyurtmani rasmiylashtirish</Link></Button>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> Yetkazib berish usuli va manzil keyingi bosqichda tanlanadi.</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
