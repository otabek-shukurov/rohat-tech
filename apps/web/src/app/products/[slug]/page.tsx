'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, PackageCheck, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product, api, isDemoMode } from '@/lib/api';
import { findDemoProduct } from '@/lib/demo-catalog';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

const fallbackImage = '/images/rohat-tech-hero.png';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      setProduct(findDemoProduct(slug));
      setLoading(false);
      return;
    }

    api<Product>(`/products/${slug}`).then(setProduct).catch(() => setProduct(findDemoProduct(slug))).finally(() => setLoading(false));
  }, [slug]);

  async function addToCart() {
    if (!product) return;
    if (isDemoMode) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
      return;
    }

    setAdding(true);
    try {
      await api('/cart/items', { method: 'POST', body: JSON.stringify({ productId: product.id, quantity: 1 }) });
      setAdded(true);
    } catch {
      setAdded(false);
    }
    finally { setAdding(false); }
  }

  async function toggleFavorite() {
    if (!product) return;
    if (isDemoMode) {
      setFavorite((current) => !current);
      return;
    }

    try {
      await api('/favorites', { method: 'POST', body: JSON.stringify({ productId: product.id }) });
      setFavorite(true);
    } catch {
      setFavorite(false);
    }
  }

  if (loading) return <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-5 lg:grid-cols-[1.1fr_0.9fr]"><div className="skeleton-pulse aspect-square rounded-lg bg-slate-100" /><div className="skeleton-pulse h-80 rounded-lg bg-slate-100" /></div>;
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-16 text-center md:px-5"><h1 className="text-2xl font-bold">Mahsulot topilmadi</h1><Button asChild className="mt-5"><Link href="/catalog">Katalogga qaytish</Link></Button></div>;

  const images = product.images.length ? product.images : [{ id: 'fallback', url: fallbackImage, alt: product.name }];
  const salePrice = product.discountPrice ?? product.price;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-5 md:py-10">
        <div className="mb-6 text-xs font-medium text-slate-500"><Link href="/" className="hover:text-blue-700">Bosh sahifa</Link><span className="px-1.5">/</span><Link href="/catalog" className="hover:text-blue-700">Katalog</Link><span className="px-1.5">/</span><span className="text-slate-700">{product.name}</span></div>
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <section>
            <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <Image src={images[selectedImage]?.url ?? fallbackImage} alt={images[selectedImage]?.alt ?? product.name} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain p-7 md:p-10" />
              {product.discountPrice ? <Badge className="absolute left-4 top-4 bg-red-50 px-3 py-1.5 text-red-700">Maxsus narx</Badge> : null}
            </div>
            {images.length > 1 ? <div className="mt-3 flex gap-3 overflow-x-auto pb-1">{images.map((image, index) => <button key={image.id} type="button" onClick={() => setSelectedImage(index)} className={cn('relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-slate-50 transition', selectedImage === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-400')} aria-label={`${index + 1}-rasm`}><Image src={image.url} alt="" fill sizes="80px" className="object-contain p-2" /></button>)}</div> : null}
          </section>

          <section className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-2"><Badge>{product.category.name}</Badge><span className="text-sm font-semibold text-slate-500">{product.brand.name}</span></div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 md:text-4xl">{product.name}</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
            <div className="mt-7 border-y border-slate-200 py-5">
              {product.discountPrice ? <p className="mb-1 text-sm text-slate-400 line-through">{formatPrice(product.price)}</p> : null}
              <p className="text-3xl font-bold text-slate-950">{formatPrice(salePrice)}</p>
              <p className={`mt-2 text-sm font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>{product.stock > 0 ? `Omborda mavjud: ${product.stock} dona` : 'Hozircha mavjud emas'}</p>
            </div>
            <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
              <Button onClick={addToCart} disabled={adding || product.stock < 1}><ShoppingCart className="h-4 w-4" /> {adding ? 'Qo‘shilmoqda...' : added ? 'Savatga qo‘shildi' : 'Savatga qo‘shish'}</Button>
              <Button variant="outline" size="icon" onClick={toggleFavorite} aria-label={favorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'} title={favorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'}><Heart className={cn('h-4 w-4', favorite && 'fill-red-500 text-red-500')} /></Button>
            </div>
            <div className="mt-7 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[{ icon: Truck, text: 'Tez yetkazish' }, { icon: ShieldCheck, text: 'Rasmiy kafolat' }, { icon: PackageCheck, text: 'Tekshirib olish' }].map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Icon className="h-4 w-4 text-blue-600" /> {text}</div>)}
            </div>
          </section>
        </div>

        <section className="mt-12 border-t border-slate-200 pt-10 md:mt-16">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div><p className="text-xs font-bold uppercase text-blue-700">Mahsulot haqida</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Texnik xususiyatlar</h2></div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              {Object.entries(product.specs ?? {}).map(([key, value], index) => <div key={key} className={cn('grid grid-cols-2 gap-4 px-5 py-3.5 text-sm', index % 2 === 0 ? 'bg-slate-50' : 'bg-white')}><span className="text-slate-500">{key}</span><span className="font-medium text-slate-900">{value}</span></div>)}
              {!Object.keys(product.specs ?? {}).length ? <div className="px-5 py-8 text-sm text-slate-500">Texnik xususiyatlar tez orada qo‘shiladi.</div> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
