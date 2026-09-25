'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Product, api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type Meta = {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta>({ categories: [], brands: [] });
  const load = () => api<Product[]>('/admin/products').then(setProducts);

  useEffect(() => {
    load();
    api<Meta>('/catalog/meta').then(setMeta);
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        slug: form.get('slug'),
        description: form.get('description'),
        price: Number(form.get('price')),
        discountPrice: form.get('discountPrice') ? Number(form.get('discountPrice')) : null,
        stock: Number(form.get('stock')),
        categoryId: form.get('categoryId'),
        brandId: form.get('brandId'),
        imageUrl: form.get('imageUrl'),
        specs: { kafolat: '24 oy', energiya: 'A++' }
      })
    });
    event.currentTarget.reset();
    load();
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit">
        <CardHeader><CardTitle>Mahsulot qo‘shish</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <Input name="name" placeholder="Nomi" required />
            <Input name="slug" placeholder="slug" required />
            <Input name="description" placeholder="Tavsif" required />
            <Input name="price" type="number" placeholder="Narx" required />
            <Input name="discountPrice" type="number" placeholder="Chegirma narxi" />
            <Input name="stock" type="number" placeholder="Ombor soni" required />
            <Input name="imageUrl" placeholder="Rasm URL" required />
            <select name="categoryId" className="h-10 w-full rounded-md border px-3 text-sm" required>
              <option value="">Kategoriya</option>
              {meta.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select name="brandId" className="h-10 w-full rounded-md border px-3 text-sm" required>
              <option value="">Brend</option>
              {meta.brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <Button className="w-full">Saqlash</Button>
          </form>
        </CardContent>
      </Card>
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">Mahsulotlar</h1>
        {products.map((product) => (
          <div key={product.id} className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-[96px_1fr_auto]">
            <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
              <Image src={product.images[0]?.url ?? '/images/rohat-tech-hero.png'} alt={product.name} fill className="object-contain p-2" />
            </div>
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.category.name} / {product.brand.name}</p>
              <p className="mt-2 font-bold text-blue-700">{formatPrice(product.discountPrice ?? product.price)}</p>
            </div>
            <div className="text-sm text-muted-foreground">{product.stock} dona</div>
          </div>
        ))}
      </section>
    </div>
  );
}
