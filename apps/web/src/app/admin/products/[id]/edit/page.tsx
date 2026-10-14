'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ProductForm } from '@/components/admin/product-form-dialog';
import { Button } from '@/components/ui/button';
import { api, isDemoMode, type Product } from '@/lib/api';
import { demoProducts } from '@/lib/demo-catalog';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const request = isDemoMode
      ? Promise.resolve(demoProducts.find((item) => item.id === id) ?? null)
      : api<Product>(`/admin/products/${id}`);
    request
      .then((result) => {
        if (!result) throw new Error('Mahsulot topilmadi');
        if (active) setProduct(result);
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'Mahsulotni yuklab bo‘lmadi'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const returnToProducts = () => router.push('/admin/products');

  if (loading) return <div className="grid min-h-[55vh] place-items-center text-blue-700"><Loader2 className="h-7 w-7 animate-spin" /></div>;
  if (error || !product) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-xl font-bold text-slate-950">Mahsulotni ochib bo‘lmadi</h1><p className="mt-2 text-sm text-slate-500">{error}</p><Button className="mt-6" onClick={returnToProducts}>Mahsulotlarga qaytish</Button></div>;

  return <ProductForm product={product} onCancel={returnToProducts} onSaved={returnToProducts} />;
}
