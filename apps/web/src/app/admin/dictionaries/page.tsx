'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

type Item = { id: string; name: string; slug: string };

export default function DictionariesPage() {
  const [categories, setCategories] = useState<Item[]>([]);
  const [brands, setBrands] = useState<Item[]>([]);
  const load = async () => {
    const meta = await api<{ categories: Item[]; brands: Item[] }>('/catalog/meta');
    setCategories(meta.categories);
    setBrands(meta.brands);
  };

  useEffect(() => {
    load();
  }, []);

  async function create(event: FormEvent<HTMLFormElement>, type: 'categories' | 'brands') {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api(`/admin/${type}`, {
      method: 'POST',
      body: JSON.stringify({ name: form.get('name'), slug: form.get('slug') })
    });
    event.currentTarget.reset();
    load();
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
      {[
        ['categories', 'Kategoriyalar', categories],
        ['brands', 'Brendlar', brands]
      ].map(([type, title, items]) => (
        <Card key={type as string}>
          <CardHeader><CardTitle>{title as string}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(event) => create(event, type as 'categories' | 'brands')} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input name="name" placeholder="Nomi" required />
              <Input name="slug" placeholder="slug" required />
              <Button>Qo‘shish</Button>
            </form>
            <div className="space-y-2">
              {(items as Item[]).map((item) => (
                <div key={item.id} className="flex justify-between rounded-md border p-3 text-sm">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">{item.slug}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
