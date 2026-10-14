'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeading } from '@/components/page-heading';
import { ProductImage } from '@/components/product-image';
import { Button } from '@/components/ui/button';
import {
  CART_CHANGE_EVENT,
  CartItem,
  clearCart,
  getCartCount,
  getCartItems,
  getCartSubtotal,
  removeCartItem,
  updateCartItem
} from '@/lib/cart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refresh = () => setItems(getCartItems());
    refresh();
    setLoading(false);
    window.addEventListener(CART_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const itemCount = getCartCount(items);
  const subtotal = getCartSubtotal(items);

  function update(productId: string, quantity: number) {
    setItems(updateCartItem(productId, quantity));
  }

  function remove(productId: string) {
    setItems(removeCartItem(productId));
  }

  function emptyCart() {
    clearCart();
    setItems([]);
  }

  return (
    <div className="min-h-[60vh] bg-slate-50">
      <PageHeading
        title="Savat"
        description={itemCount ? `${itemCount} ta mahsulot xaridga tayyor.` : 'Tanlangan mahsulotlaringiz shu yerda jamlanadi.'}
        action={items.length ? <Button type="button" variant="ghost" onClick={emptyCart}><Trash2 className="h-4 w-4" /> Savatni tozalash</Button> : null}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-5">
        {loading ? <div className="skeleton-pulse h-64 rounded-lg border bg-white" /> : !items.length ? (
          <EmptyState icon={ShoppingCart} title="Savatingiz bo‘sh" description="Katalogdan kerakli texnikani tanlang va savatga qo‘shing." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-3" aria-label="Savat mahsulotlari">
              {items.map((item) => {
                const image = item.product.images[0]?.url ?? '/images/rohat-tech-hero.png';
                const unitPrice = Number(item.product.discountPrice ?? item.product.price);
                const maxQuantity = Math.max(1, item.product.stock);
                return (
                  <article key={item.product.id} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[128px_minmax(0,1fr)_auto] sm:items-center">
                    <Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden rounded-md bg-slate-50">
                      <ProductImage src={image} alt={item.product.name} className="object-contain p-3" />
                    </Link>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500">{item.product.brand.name} · {item.product.category.name}</p>
                      <Link href={`/products/${item.product.slug}`} className="mt-1 line-clamp-2 font-semibold text-slate-950 transition hover:text-blue-700">{item.product.name}</Link>
                      <p className="mt-2 text-xs text-slate-500">Bir dona: {formatPrice(unitPrice)}</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">{formatPrice(unitPrice * item.quantity)}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                      <button type="button" onClick={() => remove(item.product.id)} className="grid h-9 w-9 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`${item.product.name}ni savatdan o‘chirish`} title="O‘chirish"><Trash2 className="h-4 w-4" /></button>
                      <div className="flex h-10 items-center overflow-hidden rounded-md border border-slate-300 bg-white">
                        <button type="button" onClick={() => update(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1} className="grid h-full w-9 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-35" aria-label="Kamaytirish"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-9 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
                        <button type="button" onClick={() => update(item.product.id, item.quantity + 1)} disabled={item.quantity >= maxQuantity} className="grid h-full w-9 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-35" aria-label="Ko‘paytirish"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
              <Button asChild variant="outline"><Link href="/catalog"><ShoppingBag className="h-4 w-4" /> Xaridni davom ettirish</Link></Button>
            </section>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-44">
              <h2 className="text-lg font-semibold text-slate-950">Buyurtma xulosasi</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600"><span>Mahsulotlar ({itemCount})</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Vobkent bo‘ylab yetkazish</span><span className="font-semibold text-emerald-700">Bepul</span></div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-5"><span className="font-semibold text-slate-950">Jami</span><span className="text-2xl font-bold text-slate-950">{formatPrice(subtotal)}</span></div>
              <Button asChild className="mt-5 w-full"><Link href="/checkout">Buyurtmani rasmiylashtirish</Link></Button>
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> Buyurtma yuborilgach operatorimiz siz bilan bog‘lanadi.</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
