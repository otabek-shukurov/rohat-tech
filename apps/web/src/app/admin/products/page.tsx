'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Boxes, Edit3, Loader2, PackagePlus, Search, Trash2 } from 'lucide-react';
import { ProductImage } from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { Product, api, isDemoMode } from '@/lib/api';
import { demoProducts } from '@/lib/demo-catalog';
import { cn, formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(isDemoMode ? demoProducts : []);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState('');

  async function load() {
    if (isDemoMode) return;
    setLoading(true);
    setError('');
    try {
      setProducts(await api<Product[]>('/admin/products'));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Mahsulotlarni yuklab bo‘lmadi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('uz');
    return products.filter((product) => !value || [product.name, product.category.name, product.brand.name, product.slug].join(' ').toLocaleLowerCase('uz').includes(value));
  }, [products, query]);

  async function deactivate(product: Product) {
    if (isDemoMode || !window.confirm(`${product.name} katalogdan yashirilsinmi? Oldingi buyurtmalar saqlanadi.`)) return;
    try {
      await api(`/admin/products/${product.id}`, { method: 'DELETE' });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Mahsulotni o‘chirib bo‘lmadi');
    }
  }

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= 5).length;

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-6 md:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Katalog va ombor</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Mahsulotlar</h1>
          <p className="mt-1 text-sm text-slate-500">Narx, qoldiq va katalogdagi ko‘rinishni boshqaring.</p>
        </div>
        <Button asChild><Link href="/admin/products/new"><PackagePlus className="h-4 w-4" />Mahsulot qo‘shish</Link></Button>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">Mahsulot turlari</p><p className="mt-2 text-2xl font-bold text-slate-950">{products.length}</p></article>
        <article className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">Jami qoldiq</p><p className="mt-2 text-2xl font-bold text-slate-950">{totalStock} <span className="text-sm font-semibold text-slate-500">dona</span></p></article>
        <article className="col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-4 lg:col-span-1"><p className="text-xs font-semibold text-amber-700">Kam qolgan</p><p className="mt-2 text-2xl font-bold text-amber-950">{lowStock} <span className="text-sm font-semibold text-amber-700">mahsulot</span></p></article>
      </section>

      <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <label className="relative block max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mahsulot, kategoriya yoki brend..." className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
        </div>
        {error ? <p className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {loading ? (
          <div className="grid min-h-64 place-items-center text-blue-700"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : filtered.length ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((product) => {
              const image = product.images[0]?.url ?? '/images/rohat-tech-hero.png';
              return (
                <article key={product.id} className="grid gap-4 p-4 transition hover:bg-slate-50/70 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center md:px-5">
                  <div className="relative aspect-square overflow-hidden rounded-md border border-slate-100 bg-white"><ProductImage src={image} alt={product.name} className={cn(image.startsWith('/images/') ? 'object-cover' : 'object-contain p-2')} /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-sm font-bold text-slate-950">{product.name}</h2>{product.isActive === false ? <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Nofaol</span> : null}</div>
                    <p className="mt-1 text-xs text-slate-500">{product.category.name} · {product.brand.name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3"><strong className="text-sm text-blue-700">{formatPrice(Number(product.discountPrice ?? product.price))}</strong>{product.discountPrice ? <span className="text-xs text-slate-400 line-through">{formatPrice(Number(product.price))}</span> : null}<span className={cn('rounded px-2 py-1 text-xs font-bold', product.stock <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>{product.stock} dona</span></div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <Link href={`/admin/products/${product.id}/edit`} title="Tahrirlash" aria-label={`${product.name}ni tahrirlash`} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><Edit3 className="h-4 w-4" /></Link>
                    <button type="button" onClick={() => deactivate(product)} disabled={product.isActive === false || isDemoMode} title="Katalogdan yashirish" aria-label={`${product.name}ni katalogdan yashirish`} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-35"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center text-center"><Boxes className="h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-800">Mahsulot topilmadi</p></div>
        )}
      </section>
    </div>
  );
}
