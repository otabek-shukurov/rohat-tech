'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { PageHeading } from '@/components/page-heading';
import { ProductCard } from '@/components/product-card';
import { Product, api } from '@/lib/api';

type Favorite = { id: string; product: Product };

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Favorite[]>('/favorites').then(setFavorites).catch(() => setFavorites([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[60vh] bg-slate-50">
      <PageHeading title="Sevimlilar" description="Keyinroq ko‘rish uchun saqlagan mahsulotlaringiz." />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="rounded-lg border bg-white p-3"><div className="skeleton-pulse aspect-square rounded-md bg-slate-100" /><div className="skeleton-pulse mt-4 h-4 w-3/4 rounded bg-slate-100" /></div>)}</div>
        ) : favorites.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{favorites.map((item) => <ProductCard key={item.id} product={item.product} />)}</div>
        ) : (
          <EmptyState icon={Heart} title="Sevimlilar ro‘yxati bo‘sh" description="Yoqtirgan mahsulotlaringizni yurakcha orqali saqlab boring." />
        )}
      </div>
    </div>
  );
}
