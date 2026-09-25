'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

type Promotion = {
  id: string;
  title: string;
  code?: string;
  discountPct: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const load = () => api<Promotion[]>('/admin/promotions').then(setPromotions);

  useEffect(() => {
    load();
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api('/admin/promotions', {
      method: 'POST',
      body: JSON.stringify({
        title: form.get('title'),
        code: form.get('code'),
        description: form.get('description'),
        discountPct: Number(form.get('discountPct')),
        startsAt: form.get('startsAt'),
        endsAt: form.get('endsAt')
      })
    });
    event.currentTarget.reset();
    load();
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit">
        <CardHeader><CardTitle>Aksiya yaratish</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <Input name="title" placeholder="Aksiya nomi" required />
            <Input name="code" placeholder="Promokod" />
            <Input name="description" placeholder="Tavsif" />
            <Input name="discountPct" type="number" placeholder="Chegirma %" required />
            <Input name="startsAt" type="date" required />
            <Input name="endsAt" type="date" required />
            <Button className="w-full">Saqlash</Button>
          </form>
        </CardContent>
      </Card>
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">Aksiyalar</h1>
        {promotions.map((promo) => (
          <div key={promo.id} className="rounded-lg border bg-white p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">{promo.title}</p>
                <p className="text-sm text-muted-foreground">{promo.code ?? 'Promokodsiz'}</p>
              </div>
              <strong className="text-blue-700">{promo.discountPct}%</strong>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
