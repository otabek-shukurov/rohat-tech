'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, api, isDemoMode } from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0]?.url ?? '/images/rohat-tech-hero.png';
  const salePrice = product.discountPrice ?? product.price;
  const isLifestyleImage = image.startsWith('/images/');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  async function addToCart() {
    if (isDemoMode) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
      return;
    }

    setAdding(true);
    try {
      await api('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      setAdded(true);
    } catch {
      setAdded(false);
    } finally {
      setAdding(false);
    }
  }

  async function addFavorite() {
    if (isDemoMode) {
      setFavorite((current) => !current);
      return;
    }

    try {
      await api('/favorites', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id })
      });
      setFavorite(true);
    } catch {
      setFavorite(false);
    }
  }

  return (
      <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.09)]">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-square bg-slate-50 p-6">
            <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className={cn('transition-transform duration-500 group-hover:scale-[1.03]', isLifestyleImage ? 'object-cover' : 'object-contain p-5')} />
            {product.discountPrice ? <Badge className="absolute left-3 top-3 bg-red-50 text-red-700">Chegirma</Badge> : null}
          </div>
        </Link>
        <Button onClick={addFavorite} variant="outline" size="icon" className="absolute right-3 top-3 z-10 border-white/80 bg-white/90 shadow-sm backdrop-blur hover:bg-white" aria-label={favorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'} title={favorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo‘shish'}>
          <Heart className={cn('h-4 w-4', favorite && 'fill-red-500 text-red-500')} />
        </Button>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">{product.category.name}</span>
            <span className="text-xs font-semibold text-slate-700">{product.brand.name}</span>
          </div>
          <Link href={`/products/${product.slug}`} className="mt-2 line-clamp-2 min-h-12 text-[15px] font-semibold leading-6 text-slate-900 transition-colors hover:text-blue-700">
            {product.name}
          </Link>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              {product.discountPrice ? <p className="mb-0.5 text-xs text-slate-400 line-through">{formatPrice(product.price)}</p> : null}
              <p className="text-base font-bold text-slate-950">{formatPrice(salePrice)}</p>
            </div>
            <p className={`text-xs font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-red-600'}`}>{product.stock > 0 ? 'Omborda bor' : 'Tugagan'}</p>
          </div>
          <Button className="mt-4 w-full" onClick={addToCart} disabled={adding || product.stock < 1}><ShoppingCart className="h-4 w-4" /> {adding ? 'Qo‘shilmoqda' : added ? 'Qo‘shildi' : 'Savatga'}</Button>
        </div>
      </article>
  );
}
